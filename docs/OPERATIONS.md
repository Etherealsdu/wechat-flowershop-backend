# 微信花店后台系统 - 运维指南

## 目录

1. [系统架构](#系统架构)
2. [日常运维](#日常运维)
3. [监控告警](#监控告警)
4. [日志管理](#日志管理)
5. [性能优化](#性能优化)
6. [安全加固](#安全加固)
7. [故障处理](#故障处理)

---

## 系统架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (反向代理)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌────┴────┐ ┌─────┴─────┐
        │ Backend-1 │ │Backend-2│ │ Backend-3 │
        │  (PM2)    │ │  (PM2)  │ │  (PM2)    │
        └─────┬─────┘ └────┬────┘ └─────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────┴────┐      ┌─────┴─────┐     ┌────┴────┐
    │  MySQL  │      │   Redis   │     │  OSS    │
    │ (主从)  │      │ (Cluster) │     │(阿里云) │
    └─────────┘      └───────────┘     └─────────┘
```

---

## 日常运维

### 服务管理

#### PM2 常用命令

```bash
# 查看所有进程状态
pm2 status

# 重启应用
pm2 restart flowershop-backend

# 零停机重载
pm2 reload flowershop-backend

# 停止应用
pm2 stop flowershop-backend

# 删除应用
pm2 delete flowershop-backend

# 查看日志
pm2 logs flowershop-backend

# 查看实时监控
pm2 monit

# 查看详细信息
pm2 show flowershop-backend
```

#### 系统服务管理

```bash
# MySQL
sudo systemctl status mysql
sudo systemctl restart mysql

# Redis
sudo systemctl status redis
sudo systemctl restart redis

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t  # 测试配置
```

### 资源监控

#### 系统资源

```bash
# 查看系统负载
top
htop

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看网络连接
netstat -tunlp
ss -tunlp

# 查看进程
ps aux | grep node
```

#### 数据库监控

```bash
# 进入MySQL
mysql -u root -p

# 查看当前连接
SHOW PROCESSLIST;

# 查看数据库大小
SELECT
  table_schema AS 'Database',
  SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;

# 查看慢查询
SHOW VARIABLES LIKE 'slow_query%';
```

### 定期维护任务

#### Crontab 配置

```bash
# 编辑定时任务
crontab -e

# 每天凌晨2点备份数据库
0 2 * * * /home/user/scripts/backup_database.sh

# 每周日凌晨3点清理日志
0 3 * * 0 /home/user/scripts/cleanup_logs.sh

# 每小时检查服务状态
0 * * * * /home/user/scripts/health_check.sh
```

---

## 监控告警

### Prometheus + Grafana 配置

#### 1. Node.js 应用指标

安装 `prom-client`:

```javascript
// server.js 添加监控端点
const client = require('prom-client');

// 收集默认指标
client.collectDefaultMetrics();

// 自定义指标
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// 指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

#### 2. Prometheus 配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'flowershop-backend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

#### 3. 告警规则

```yaml
# alerts.yml
groups:
  - name: flowershop-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time detected"

      - alert: HighMemoryUsage
        expr: node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
```

### 钉钉/企业微信告警

```javascript
// utils/alert.js
const axios = require('axios');

async function sendDingTalkAlert(message) {
  const webhook = process.env.DINGTALK_WEBHOOK;
  await axios.post(webhook, {
    msgtype: 'text',
    text: {
      content: `[花店后台告警] ${message}`
    }
  });
}

module.exports = { sendDingTalkAlert };
```

---

## 日志管理

### 日志配置

#### Winston 日志库配置

```javascript
// utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    // 错误日志
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '100m',
      maxFiles: '30d'
    }),
    // 所有日志
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '14d'
    })
  ]
});

module.exports = logger;
```

### 日志轮转

```bash
# /etc/logrotate.d/flowershop
/home/user/wechat-flowershop-backend/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 日志分析

#### 使用 ELK Stack

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /home/user/wechat-flowershop-backend/backend/logs/*.log
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "flowershop-logs-%{+yyyy.MM.dd}"
```

---

## 性能优化

### Node.js 优化

#### 1. 集群模式

```javascript
// cluster.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // 自动重启
  });
} else {
  require('./server');
  console.log(`Worker ${process.pid} started`);
}
```

#### 2. 内存优化

```bash
# 启动时设置内存限制
NODE_OPTIONS="--max-old-space-size=4096" pm2 start server.js
```

### MySQL 优化

```sql
-- 查看慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- 优化表
OPTIMIZE TABLE products;
OPTIMIZE TABLE orders;

-- 分析查询
EXPLAIN SELECT * FROM products WHERE category_id = 1;
```

#### my.cnf 优化配置

```ini
[mysqld]
# 缓冲池大小（通常设为可用内存的70%）
innodb_buffer_pool_size = 4G

# 日志文件大小
innodb_log_file_size = 256M

# 连接数
max_connections = 500

# 查询缓存
query_cache_type = 1
query_cache_size = 128M

# 慢查询
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
```

### Redis 优化

```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

### Nginx 优化

```nginx
# nginx.conf
worker_processes auto;
worker_connections 65535;

http {
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript;

    # 缓存
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;

    # Keep-alive
    keepalive_timeout 65;
    keepalive_requests 1000;
}
```

---

## 安全加固

### 系统安全

```bash
# 防火墙配置
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3306/tcp  # MySQL 只允许本地访问

# 禁用 root SSH 登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 应用安全

1. **Helmet 中间件** - 已配置
2. **Rate Limiting** - 已配置
3. **CORS** - 已配置
4. **输入验证** - Joi 验证

### 密码安全

```bash
# 生成强密码
openssl rand -base64 32

# 定期轮换JWT密钥
# 在 .env 中更新 JWT_SECRET
```

---

## 故障处理

### 常见故障及解决方案

#### 1. 服务无响应

```bash
# 检查进程状态
pm2 status

# 查看错误日志
pm2 logs flowershop-backend --err

# 重启服务
pm2 restart flowershop-backend
```

#### 2. 数据库连接失败

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 检查连接数
mysql -e "SHOW STATUS LIKE 'Threads_connected';"

# 重启MySQL
sudo systemctl restart mysql
```

#### 3. Redis 内存不足

```bash
# 查看内存使用
redis-cli info memory

# 清理过期键
redis-cli --scan --pattern '*' | xargs redis-cli del

# 扩展内存
redis-cli config set maxmemory 4gb
```

#### 4. 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理日志
sudo rm -rf /var/log/nginx/*.gz
sudo rm -rf /home/user/wechat-flowershop-backend/backend/logs/*.gz

# 清理Docker（如果使用）
docker system prune -a
```

### 紧急联系人

| 角色 | 姓名 | 电话 |
|------|------|------|
| 运维负责人 | xxx | 138xxxxxxxx |
| DBA | xxx | 139xxxxxxxx |
| 开发负责人 | xxx | 137xxxxxxxx |
