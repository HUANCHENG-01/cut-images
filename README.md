# 🖼️ 图片分割工具

一个免费、开源的在线图片分割工具，支持横向、竖向和网格分割，所有处理均在浏览器本地完成，保障隐私安全。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ 功能特点

- 🎯 **四种分割模式**
  - 横向分割 - 将图片水平切分成多行
  - 竖向分割 - 将图片垂直切分成多列
  - 网格分割 - 将图片切分成 M×N 的网格
  - 智能定位 - 根据黑边/白边自动检测分割位置

- 📐 **灵活的分割参数**
  - 支持 1-10 份分割
  - 最多可分割成 100 个部分 (10×10)
  - 智能定位自动检测边框线位置

- ✂️ **智能边缘去除**
  - 支持去除黑边、白边或同时去除
  - 自定义边缘颜色检测
  - 可调整检测阈值 (0-255)
  - 额外裁剪功能，去除残留边框线

- 🖌️ **边框设置**
  - 可选添加边框
  - 自定义边框颜色
  - 可调整边框宽度 (1-20px)

- 📤 **输出设置**
  - 支持 PNG、JPEG、WebP 格式
  - 可调整图片质量 (10%-100%)

- 🚀 **便捷功能**
  - 拖拽上传图片
  - 实时预览分割效果
  - 单独下载每个分割图片
  - 一键打包下载所有图片 (ZIP)

- 🔒 **隐私安全**
  - 纯前端处理，无需服务器
  - 图片不会上传到任何地方
  - 支持大文件 (最大 50MB)

## 📁 项目结构

```
cut-images/
├── index.html      # 主页面
├── style.css       # 样式文件
├── app.js          # 核心逻辑
├── Dockerfile      # Docker 部署配置
├── deploy.sh       # 一键部署脚本
└── README.md       # 说明文档
```

## 🚀 快速开始

### 本地运行

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/cut-images.git
   cd cut-images
   ```

2. **启动本地服务器**
   ```bash
   # 使用 Python
   python -m http.server 8080
   
   # 或使用 Node.js
   npx serve .
   ```

3. **访问应用**
   
   打开浏览器访问 `http://localhost:8080`

### Docker 部署

```bash
# 构建镜像
docker build -t cut-images .

# 运行容器
docker run -d -p 1996:1996 --name cut-images cut-images
```

## ☁️ 服务器部署

### 使用一键部署脚本

1. **上传文件到服务器**
   ```bash
   scp -r ./* root@your_server_ip:~/cut-images/
   ```

2. **执行部署脚本**
   ```bash
   ssh root@your_server_ip
   cd ~/cut-images
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **开放防火墙端口**
   
   在云服务商控制台的安全组中开放 1996 端口

### 手动配置 Nginx

```nginx
server {
    listen 1996;
    server_name _;
    
    root /var/www/cut-images;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    gzip on;
    gzip_types text/plain text/css application/javascript image/svg+xml;
}
```

## 📖 使用说明

1. **上传图片** - 拖拽图片到上传区域，或点击选择文件
2. **选择分割模式** - 横向分割、竖向分割或网格分割
3. **调整参数** - 设置分割份数、边框、输出格式等
4. **预览效果** - 实时查看分割线位置
5. **执行分割** - 点击"分割图片"按钮
6. **下载结果** - 单独下载或打包下载所有图片

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式与动画
- **JavaScript (ES6+)** - 核心逻辑
- **Canvas API** - 图片处理
- **JSZip** - ZIP 打包下载

## 📝 支持的格式

| 格式 | 输入 | 输出 |
|------|------|------|
| JPEG/JPG | ✅ | ✅ |
| PNG | ✅ | ✅ |
| WebP | ✅ | ✅ |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- 灵感来源：[Split Image](https://splitimage.app/zh-CN)
- ZIP 打包：[JSZip](https://stuk.github.io/jszip/)

---

<p align="center">
  Made with ❤️ for image splitting
</p>
