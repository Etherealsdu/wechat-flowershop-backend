# 多阶段构建：前端构建阶段
FROM node:18-alpine AS frontend-build

WORKDIR /app

# 复制前端package文件并安装依赖
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --only=production && npm ci

# 复制前端源码并构建
COPY frontend/ ./
RUN npm run build


# 后端构建阶段
FROM node:18-alpine AS backend-build

WORKDIR /app

# 复制后端package文件并安装依赖
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# 复制后端源码
COPY backend/ ./


# 最终运行阶段
FROM node:18-alpine

WORKDIR /app

# 从构建阶段复制后端代码和依赖
COPY --from=backend-build /app/backend ./backend

# 从构建阶段复制前端构建产物
COPY --from=frontend-build /app/dist ./frontend/dist

# 暴露端口
EXPOSE 3000

# 启动后端服务
CMD ["sh", "-c", "cd backend && npm start"]