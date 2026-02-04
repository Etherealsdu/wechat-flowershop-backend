#!/bin/bash

# WeChat Flower Admin 部署脚本

set -e  # 遇到错误立即退出

echo "开始部署 WeChat Flower Admin..."

# 检查必要的命令是否存在
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker 未安装，请先安装 Docker。"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo >&2 "Docker Compose 未安装，请先安装 Docker Compose。"; exit 1; }

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "错误: 未找到 docker-compose.yml 文件，请确保在项目根目录下执行此脚本。"
    exit 1
fi

# 停止现有容器
echo "停止现有容器..."
docker-compose down || true

# 构建并启动服务
echo "构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
if docker-compose ps | grep -q "Up"; then
    echo "部署成功!"
    echo "服务状态:"
    docker-compose ps
else
    echo "警告: 部署可能存在问题，请检查日志:"
    docker-compose logs
    exit 1
fi

echo "部署完成！"
echo "前端访问地址: http://localhost:80"
echo "后端API地址: http://localhost:3000/api"