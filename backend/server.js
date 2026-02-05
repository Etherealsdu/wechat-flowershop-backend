const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const sequelize = require('./utils/database');
const routes = require('./routes');

// 服务器启动时间
const startTime = new Date();

// Rate limiting - 根据环境配置不同限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 生产环境更严格
  message: { error: '请求过于频繁，请稍后重试', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize Express app
const app = express();

// 信任代理（在 Nginx 反向代理后面时需要）
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Apply middleware
app.use(limiter);
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
})); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// 请求日志中间件（仅开发环境）
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use('/api', routes);

// 基础信息接口
app.get('/', (req, res) => {
  res.json({
    message: '微信花店后台管理系统 API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 健康检查端点
app.get('/health', async (req, res) => {
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime.getTime()) / 1000),
    version: '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'ok'
    }
  };

  try {
    // 检查数据库连接
    await sequelize.authenticate();
    healthInfo.checks.database = 'connected';
  } catch (error) {
    healthInfo.checks.database = 'disconnected';
    healthInfo.status = 'degraded';
  }

  // 检查内存使用
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  healthInfo.checks.memoryUsageMB = heapUsedMB;
  if (heapUsedMB > 500) {
    healthInfo.checks.memory = 'warning';
  }

  const statusCode = healthInfo.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthInfo);
});

// 就绪检查端点（Kubernetes readiness probe）
app.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: 'Database unavailable' });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    code: 'NOT_FOUND',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // 记录错误
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.error(err.stack);

  // 判断错误类型
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '输入验证失败',
      code: 'VALIDATION_ERROR',
      details: err.details || err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: '认证失败',
      code: 'UNAUTHORIZED'
    });
  }

  // 生产环境不暴露错误详情
  const errorResponse = {
    error: '服务器内部错误',
    code: 'INTERNAL_ERROR'
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
});

// 服务器实例
let server = null;

// 同步数据库并启动服务器
async function startServer() {
  try {
    // 检查必要的配置
    if (process.env.NODE_ENV === 'production' && config.jwt.secret === 'default_secret_key_for_dev') {
      console.error('警告：生产环境必须设置 JWT_SECRET 环境变量！');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步数据库表结构
    // 注意：在生产环境中，应使用迁移工具而不是 sync()
    if (process.env.NODE_ENV !== 'production') {
      // await sequelize.sync({ alter: true }); // 仅开发环境
    }

    const PORT = config.port;
    server = app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`启动时间: ${startTime.toISOString()}`);
    });

    // 优雅关闭处理
    setupGracefulShutdown();

  } catch (error) {
    console.error('无法连接到数据库:', error);
    process.exit(1);
  }
}

// 优雅关闭处理
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    console.log(`\n收到 ${signal} 信号，开始优雅关闭...`);

    // 停止接受新连接
    if (server) {
      server.close(async () => {
        console.log('HTTP 服务器已关闭');

        try {
          // 关闭数据库连接
          await sequelize.close();
          console.log('数据库连接已关闭');
        } catch (error) {
          console.error('关闭数据库连接时出错:', error);
        }

        console.log('优雅关闭完成');
        process.exit(0);
      });

      // 如果 30 秒内没有关闭完成，强制退出
      setTimeout(() => {
        console.error('强制关闭（超时）');
        process.exit(1);
      }, 30000);
    }
  };

  // 监听终止信号
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
  });
}

// 如果不是测试环境，启动服务器
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;