# 微信花店后台系统 - 部署指南

## 目录

1. [环境要求](#环境要求)
2. [快速部署](#快速部署)
3. [手动部署](#手动部署)
4. [Docker部署](#docker部署)
5. [Kubernetes部署](#kubernetes部署)
6. [环境配置](#环境配置)
7. [SSL证书配置](#ssl证书配置)
8. [监控配置](#监控配置)

---

## 环境要求

### 硬件要求

| 配置项 | 最低配置 | 推荐配置 |
|--------|----------|----------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 磁盘 | 50GB SSD | 100GB+ SSD |
| 带宽 | 5Mbps | 10Mbps+ |

### 软件要求

| 软件 | 版本 |
|------|------|
| Node.js | >= 18.x |
| MySQL | >= 8.0 |
| Redis | >= 6.0 |
| Nginx | >= 1.20 |
| Docker | >= 20.10 (可选) |

---

## 快速部署

### 1. 克隆代码

```bash
git clone https://github.com/Etherealsdu/wechat-flowershop-backend.git
cd wechat-flowershop-backend/backend
```

### 2. 安装依赖

```bash
npm install --production
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他参数
```

### 4. 初始化数据库

```bash
npm run db:sync
npm run db:seed  # 可选：初始化测试数据
```

### 5. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

---

## 手动部署

### 1. 安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 2. 安装 MySQL 8.0

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server

# 安全配置
sudo mysql_secure_installation
```

### 3. 创建数据库

```sql
CREATE DATABASE wechat_flowershop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'flowershop'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON wechat_flowershop.* TO 'flowershop'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 安装 Redis

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 5. 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/flowershop

upstream flowershop_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.flowershop.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.flowershop.com;

    ssl_certificate /etc/nginx/ssl/flowershop.crt;
    ssl_certificate_key /etc/nginx/ssl/flowershop.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    location / {
        proxy_pass http://flowershop_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 'healthy';
    }
}
```

### 6. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name flowershop-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs flowershop-backend
```

---

## Docker 部署

### 1. 构建镜像

```bash
docker build -t flowershop-backend:latest .
```

### 2. 使用 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=flowershop
      - DB_PASSWORD=your_password
      - DB_NAME=wechat_flowershop
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mysql
      - redis
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=wechat_flowershop
      - MYSQL_USER=flowershop
      - MYSQL_PASSWORD=your_password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
```

### 3. 启动服务

```bash
docker-compose up -d
```

---

## Kubernetes 部署

### 1. 创建 ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: flowershop-config
data:
  NODE_ENV: "production"
  DB_HOST: "mysql-service"
  DB_PORT: "3306"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
```

### 2. 创建 Secret

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: flowershop-secrets
type: Opaque
stringData:
  DB_USER: "flowershop"
  DB_PASSWORD: "your_password"
  JWT_SECRET: "your_jwt_secret"
```

### 3. 创建 Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flowershop-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: flowershop-backend
  template:
    metadata:
      labels:
        app: flowershop-backend
    spec:
      containers:
      - name: backend
        image: flowershop-backend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: flowershop-config
        - secretRef:
            name: flowershop-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## 环境配置

### 完整的 .env 配置示例

```bash
# 服务配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=flowershop
DB_PASSWORD=your_secure_password
DB_NAME=wechat_flowershop

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your_very_secure_jwt_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 微信小程序配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# 阿里云OSS配置
ALI_OSS_REGION=oss-cn-hangzhou
ALI_OSS_ACCESS_KEY_ID=your_access_key_id
ALI_OSS_ACCESS_KEY_SECRET=your_access_key_secret
ALI_OSS_BUCKET=your_bucket_name
```

---

## SSL证书配置

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.flowershop.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 监控配置

### PM2 监控

```bash
# 启用监控
pm2 monit

# 查看日志
pm2 logs

# 查看性能指标
pm2 show flowershop-backend
```

### 健康检查端点

系统提供以下健康检查端点：

- `GET /` - 基础健康检查
- 返回: `{ "message": "WeChat Flower Shop Admin Backend API", "version": "1.0.0" }`

---

## 故障排查

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 服务是否运行
   - 验证数据库用户名和密码
   - 确认防火墙规则

2. **Redis 连接失败**
   - 检查 Redis 服务是否运行
   - 验证 Redis 密码（如果设置）

3. **端口被占用**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

4. **内存不足**
   - 增加服务器内存
   - 调整 Node.js 内存限制：`NODE_OPTIONS=--max-old-space-size=4096`
