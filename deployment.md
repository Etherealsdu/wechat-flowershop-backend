# WeChat Flower Admin - 部署指南

## 部署选项

本项目支持多种部署方式：

1. [独立部署](#独立部署) - 适合开发和测试环境
2. [Docker部署](#docker部署) - 适合生产环境
3. [Docker Compose部署](#docker-compose部署) - 适合完整环境部署

## 独立部署

### 环境要求

- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 部署步骤

#### 1. 克隆代码

```bash
git clone <repository-url>
cd wechat-flower-admin
```

#### 2. 配置数据库

创建数据库：

```sql
CREATE DATABASE wechat_flowershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. 配置后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件配置数据库连接
npm install
npm run start
```

#### 4. 配置前端

```bash
cd frontend
cp .env.example .env
# 编辑 .env 文件配置API地址
npm install
npm run build
```

## Docker部署

### 单容器部署

```bash
# 构建镜像
docker build -t wechat-flower-admin .

# 运行容器（连接外部数据库）
docker run -d \
  --name wechat-admin \
  -p 3000:3000 \
  --env-file ./backend/.env \
  wechat-flower-admin
```

### 使用Docker Compose（推荐）

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: wechat-admin-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: wechat_flowershop
      MYSQL_USER: admin
      MYSQL_PASSWORD: your_password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

  redis:
    image: redis:7-alpine
    container_name: wechat-admin-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build: .
    container_name: wechat-admin-app
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    env_file:
      - ./backend/.env
    environment:
      - DB_HOST=db
      - REDIS_HOST=redis

volumes:
  db_data:
  redis_data:
```

运行：

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f app
```

## 生产环境配置

### Nginx反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件（如果你使用Nginx托管前端）
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源（如上传的图片）
    location /uploads {
        alias /path/to/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL配置（HTTPS）

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # SSL配置...
    # （同上面的配置）
}
```

## 环境变量说明

### 后端环境变量

- `DB_HOST`: 数据库主机地址
- `DB_PORT`: 数据库端口
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名
- `REDIS_HOST`: Redis主机地址
- `REDIS_PORT`: Redis端口
- `REDIS_PASSWORD`: Redis密码（可选）
- `JWT_SECRET`: JWT密钥（重要：生产环境必须修改）
- `ALI_OSS_*`: 阿里云OSS配置
- `PORT`: 应用端口

### 前端环境变量

- `VITE_API_BASE_URL`: 后端API基础URL

## 数据库迁移

首次部署时，需要初始化数据库表结构。在生产环境中，建议使用数据库迁移工具。

当前实现中，应用启动时会自动同步数据库结构（仅适用于开发环境）。

## 安全注意事项

1. **JWT密钥**: 生产环境中必须使用强随机密钥
2. **数据库凭证**: 不要在代码中硬编码数据库密码
3. **API限制**: 在生产环境中启用适当的速率限制
4. **HTTPS**: 生产环境中必须使用HTTPS
5. **防火墙**: 限制对数据库和Redis的访问

## 监控和日志

### 日志配置

应用会在控制台输出日志，可以通过以下方式收集：

```bash
# 查看实时日志
docker-compose logs -f app

# 查看特定时间段的日志
docker-compose logs --since "1h" app
```

### 健康检查

应用提供了健康检查端点：

```
GET /
```

返回应用基本信息和状态。

## 备份策略

### 数据库备份

定期备份数据库：

```bash
# 备份数据库
docker exec wechat-admin-db mysqldump -u admin -p wechat_flowershop > backup.sql

# 恢复数据库
docker exec -i wechat-admin-db mysql -u admin -p wechat_flowershop < backup.sql
```

### 上传文件备份

备份用户上传的文件（如果有文件上传功能）。

## 故障排除

### 常见问题

1. **数据库连接失败**：
   - 检查数据库服务是否运行
   - 检查网络连接和防火墙设置
   - 验证数据库凭证

2. **Redis连接失败**：
   - 检查Redis服务是否运行
   - 验证Redis配置

3. **API调用失败**：
   - 检查JWT令牌是否有效
   - 验证API端点URL

### 性能优化

1. **数据库索引**：为常用查询字段添加索引
2. **Redis缓存**：合理使用Redis缓存减少数据库压力
3. **CDN**：为静态资源配置CDN
4. **负载均衡**：在高流量场景下使用负载均衡