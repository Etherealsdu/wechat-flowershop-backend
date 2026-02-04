# WeChat Flower Shop Admin System

## 项目介绍

这是一个为微信花店小程序提供的后台管理系统，使用现代Web技术栈构建，提供完整的商品、订单、用户管理功能。

## 特性

- **现代化技术栈**: React + Ant Design + Node.js + Express + MySQL + Redis
- **完整的管理功能**: 用户、商品、分类、订单管理
- **安全认证**: JWT身份验证和权限控制
- **文件上传**: 集成阿里云OSS
- **输入验证**: 使用Joi进行完整的数据验证
- **全面测试**: 包含单元测试和API测试
- **Docker化部署**: 支持一键部署

## 技术栈

- **前端**: React + Ant Design + Vite
- **后端**: Node.js + Express
- **数据库**: MySQL
- **缓存**: Redis
- **文件存储**: 阿里云OSS
- **验证**: Joi
- **测试**: Jest + Supertest

## 快速开始

### 开发环境设置

1. 克隆项目：
```bash
git clone <repository-url>
cd wechat-flower-admin
```

2. 后端设置：
```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件以配置数据库和其他服务
npm run dev
```

3. 前端设置：
```bash
cd frontend
npm install
cp .env.example .env
# 编辑 .env 文件以配置API地址
npm run dev
```

### Docker部署

使用Docker Compose进行一键部署：

1. 复制环境变量文件：
```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件配置环境变量
```

2. 启动服务：
```bash
chmod +x deploy.sh
./deploy.sh
```

或者手动运行：
```bash
docker-compose up -d --build
```

## 目录结构

```
wechat-flower-admin/
├── backend/              # 后端代码
│   ├── controllers/      # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   ├── config/          # 配置文件
│   ├── tests/           # 测试文件
│   │   ├── unit/        # 单元测试
│   │   └── api.test.js  # API测试
│   ├── server.js        # 服务器入口
│   ├── package.json
│   └── jest.config.js   # 测试配置
├── frontend/             # 前端代码
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/       # 页面
│   │   ├── api/         # API请求
│   │   ├── utils/       # 工具函数
│   │   ├── App.jsx      # 主应用组件
│   │   └── main.jsx     # 入口文件
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml   # Docker编排配置
├── Dockerfile          # Docker镜像配置
├── nginx.conf          # Nginx配置
├── deploy.sh           # 部署脚本
├── README.md
├── api-docs.md         # API文档
├── deployment.md       # 部署指南
└── PROJECT_PLAN.md     # 项目计划
```

## API 接口

### 用户管理
- GET /api/users - 获取用户列表
- GET /api/users/:id - 获取用户详情
- PUT /api/users/:id - 更新用户信息
- DELETE /api/users/:id - 删除用户

### 商品管理
- GET /api/products - 获取商品列表
- GET /api/products/:id - 获取商品详情
- POST /api/products - 创建商品
- PUT /api/products/:id - 更新商品
- DELETE /api/products/:id - 删除商品

### 分类管理
- GET /api/categories - 获取分类列表
- GET /api/categories/tree - 获取分类树
- GET /api/categories/:id - 获取分类详情
- POST /api/categories - 创建分类
- PUT /api/categories/:id - 更新分类
- DELETE /api/categories/:id - 删除分类

### 订单管理
- GET /api/orders - 获取订单列表
- GET /api/orders/:id - 获取订单详情
- PUT /api/orders/:id - 更新订单
- PUT /api/orders/:id/status - 更新订单状态
- DELETE /api/orders/:id - 删除订单
- GET /api/orders/stats - 获取订单统计

### 文件管理
- POST /api/files/upload - 单文件上传
- POST /api/files/uploads - 多文件上传

## 环境变量

### 后端 (.env)
- DB_HOST - 数据库主机
- DB_PORT - 数据库端口
- DB_USER - 数据库用户名
- DB_PASSWORD - 数据库密码
- DB_NAME - 数据库名
- REDIS_HOST - Redis主机
- REDIS_PORT - Redis端口
- REDIS_PASSWORD - Redis密码
- JWT_SECRET - JWT密钥
- ALI_OSS_REGION - 阿里云OSS区域
- ALI_OSS_ACCESS_KEY_ID - 阿里云OSS访问密钥ID
- ALI_OSS_ACCESS_KEY_SECRET - 阿里云OSS访问密钥
- ALI_OSS_BUCKET - 阿里云OSS桶名
- PORT - 服务端口

### 前端 (.env)
- VITE_API_BASE_URL - API基础URL

## 测试

运行后端测试：
```bash
cd backend
npm test
```

运行测试并生成覆盖率报告：
```bash
cd backend
npm run test:coverage
```

## 部署

### 生产环境部署

使用Docker Compose进行生产环境部署：

1. 配置生产环境变量
2. 运行部署脚本：
```bash
./deploy.sh
```

### 访问服务

- API接口: http://your-domain.com/api
- 健康检查: http://your-domain.com/health

## 开发指南

### 添加新功能

1. 在 `models` 目录下创建新的数据模型
2. 在 `services` 目录下创建业务逻辑服务
3. 在 `controllers` 目录下创建控制器
4. 在 `routes` 目录下创建路由
5. 在前端 `pages` 目录下创建页面组件
6. 编写相应的测试用例

### 测试策略

项目包含两层测试：
- **单元测试**: 测试各个服务层的业务逻辑
- **API测试**: 测试整个API端点的功能

目标是实现100%的测试覆盖率。

## 许可证

MIT License