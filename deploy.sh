#!/bin/bash
# 图片分割工具部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

# 配置
PORT=1996
WEB_ROOT="/var/www/cut-images"

echo "=========================================="
echo "  图片分割工具部署脚本"
echo "  端口: $PORT"
echo "=========================================="

# 创建目录
echo "[1/5] 创建网站目录..."
sudo mkdir -p $WEB_ROOT

# 复制文件（假设脚本在项目目录中运行）
echo "[2/5] 复制文件..."
sudo cp -r ./* $WEB_ROOT/ 2>/dev/null || true
sudo rm -f $WEB_ROOT/deploy.sh $WEB_ROOT/Dockerfile

# 检测并安装 Nginx
echo "[3/5] 检查 Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "正在安装 Nginx..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install nginx -y
    elif command -v yum &> /dev/null; then
        sudo yum install nginx -y
    else
        echo "无法自动安装 Nginx，请手动安装"
        exit 1
    fi
fi

# 创建 Nginx 配置
echo "[4/5] 配置 Nginx..."
sudo tee /etc/nginx/conf.d/cut-images.conf > /dev/null <<EOF
server {
    listen $PORT;
    server_name _;
    
    root $WEB_ROOT;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # 启用 gzip
    gzip on;
    gzip_types text/plain text/css application/javascript image/svg+xml;
}
EOF

# 测试并重载 Nginx
echo "[5/5] 启动服务..."
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

# 配置防火墙
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=$PORT/tcp 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || true
elif command -v ufw &> /dev/null; then
    sudo ufw allow $PORT/tcp 2>/dev/null || true
fi

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "请确保在腾讯云控制台的安全组中开放 $PORT 端口"
echo ""
echo "访问地址: http://你的服务器IP:$PORT"
echo ""
