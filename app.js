// 图片分割工具主程序
class ImageSplitter {
    constructor() {
        this.image = null;
        this.imageFile = null;
        this.processedImage = null; // 处理后的图片（去边后）
        this.splitMode = 'grid'; // horizontal, vertical, grid
        this.cols = 3;
        this.rows = 3;
        this.addBorder = false;
        this.borderColor = '#ffffff';
        this.borderWidth = 2;
        this.outputFormat = 'png';
        this.quality = 100;
        this.splitImages = [];
        this.trimEnabled = false;
        this.trimThreshold = 30;
        this.trimMode = 'black'; // black, white, custom
        this.trimColor = '#000000';

        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        // 区域元素
        this.uploadSection = document.getElementById('uploadSection');
        this.editorSection = document.getElementById('editorSection');
        this.resultSection = document.getElementById('resultSection');
        
        // 上传相关
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        
        // 预览画布
        this.previewCanvas = document.getElementById('previewCanvas');
        this.ctx = this.previewCanvas.getContext('2d');
        
        // 信息显示
        this.originalSizeEl = document.getElementById('originalSize');
        this.fileSizeEl = document.getElementById('fileSize');
        this.splitModeInfoEl = document.getElementById('splitModeInfo');
        this.splitCountEl = document.getElementById('splitCount');
        
        // 模式选择器
        this.modeOptions = document.querySelectorAll('.mode-option');
        
        // 滑块
        this.colsSlider = document.getElementById('colsSlider');
        this.rowsSlider = document.getElementById('rowsSlider');
        this.colsValue = document.getElementById('colsValue');
        this.rowsValue = document.getElementById('rowsValue');
        this.colsGroup = document.getElementById('colsGroup');
        this.rowsGroup = document.getElementById('rowsGroup');
        this.totalParts = document.getElementById('totalParts');
        
        // 去边设置
        this.trimToggle = document.getElementById('trimToggle');
        this.trimOptions = document.getElementById('trimOptions');
        this.trimThresholdSlider = document.getElementById('trimThreshold');
        this.trimThresholdValue = document.getElementById('trimThresholdValue');
        this.trimModeRadios = document.querySelectorAll('input[name="trimMode"]');
        this.customColorGroup = document.getElementById('customColorGroup');
        this.trimColorInput = document.getElementById('trimColor');
        
        // 边框设置
        this.borderToggle = document.getElementById('borderToggle');
        this.borderOptions = document.getElementById('borderOptions');
        this.borderColorInput = document.getElementById('borderColor');
        this.borderWidthSlider = document.getElementById('borderWidth');
        this.borderWidthValue = document.getElementById('borderWidthValue');
        
        // 输出设置
        this.outputFormatSelect = document.getElementById('outputFormat');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        
        // 按钮
        this.resetBtn = document.getElementById('resetBtn');
        this.splitBtn = document.getElementById('splitBtn');
        this.backToEditBtn = document.getElementById('backToEditBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        
        // 结果网格
        this.resultGrid = document.getElementById('resultGrid');
        
        // 加载提示
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    initEventListeners() {
        // 文件上传
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽上传
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadImage(files[0]);
            }
        });
        
        // 模式选择
        this.modeOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.modeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.splitMode = option.dataset.mode;
                this.updateSliderVisibility();
                this.updatePreview();
            });
        });
        
        // 滑块事件
        this.colsSlider.addEventListener('input', (e) => {
            this.cols = parseInt(e.target.value);
            this.colsValue.textContent = this.cols;
            this.updateTotalParts();
            this.updatePreview();
        });
        
        this.rowsSlider.addEventListener('input', (e) => {
            this.rows = parseInt(e.target.value);
            this.rowsValue.textContent = this.rows;
            this.updateTotalParts();
            this.updatePreview();
        });
        
        // 去边设置
        this.trimToggle.addEventListener('change', (e) => {
            this.trimEnabled = e.target.checked;
            this.trimOptions.style.display = this.trimEnabled ? 'block' : 'none';
            this.processImage();
        });
        
        this.trimThresholdSlider.addEventListener('input', (e) => {
            this.trimThreshold = parseInt(e.target.value);
            this.trimThresholdValue.textContent = this.trimThreshold;
            if (this.trimEnabled) {
                this.processImage();
            }
        });
        
        // 边缘类型选择
        this.trimModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.trimMode = e.target.value;
                this.customColorGroup.style.display = this.trimMode === 'custom' ? 'flex' : 'none';
                if (this.trimEnabled) {
                    this.processImage();
                }
            });
        });
        
        // 自定义颜色选择
        this.trimColorInput.addEventListener('input', (e) => {
            this.trimColor = e.target.value;
            if (this.trimEnabled && this.trimMode === 'custom') {
                this.processImage();
            }
        });
        
        // 边框设置
        this.borderToggle.addEventListener('change', (e) => {
            this.addBorder = e.target.checked;
            this.borderOptions.style.display = this.addBorder ? 'block' : 'none';
            this.updatePreview();
        });
        
        this.borderColorInput.addEventListener('input', (e) => {
            this.borderColor = e.target.value;
            this.updatePreview();
        });
        
        this.borderWidthSlider.addEventListener('input', (e) => {
            this.borderWidth = parseInt(e.target.value);
            this.borderWidthValue.textContent = this.borderWidth + 'px';
            this.updatePreview();
        });
        
        // 输出设置
        this.outputFormatSelect.addEventListener('change', (e) => {
            this.outputFormat = e.target.value;
        });
        
        this.qualitySlider.addEventListener('input', (e) => {
            this.quality = parseInt(e.target.value);
            this.qualityValue.textContent = this.quality + '%';
        });
        
        // 操作按钮
        this.resetBtn.addEventListener('click', () => this.reset());
        this.splitBtn.addEventListener('click', () => this.splitImage());
        this.backToEditBtn.addEventListener('click', () => this.backToEdit());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        // 验证文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('请选择 JPG、PNG 或 WebP 格式的图片');
            return;
        }
        
        // 验证文件大小 (50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('文件大小不能超过 50MB');
            return;
        }
        
        this.imageFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.processedImage = img; // 初始化为原图
                this.trimInfo = null;
                this.showEditor();
                this.processImage(); // 处理图片（如果启用了去黑边）
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    showEditor() {
        this.uploadSection.style.display = 'none';
        this.editorSection.style.display = 'block';
        this.resultSection.style.display = 'none';
    }

    updateSliderVisibility() {
        switch (this.splitMode) {
            case 'horizontal':
                this.colsGroup.style.display = 'none';
                this.rowsGroup.style.display = 'block';
                document.querySelector('#rowsGroup .slider-header span:first-child').textContent = '分割份数';
                break;
            case 'vertical':
                this.colsGroup.style.display = 'block';
                this.rowsGroup.style.display = 'none';
                document.querySelector('#colsGroup .slider-header span:first-child').textContent = '分割份数';
                break;
            case 'grid':
                this.colsGroup.style.display = 'block';
                this.rowsGroup.style.display = 'block';
                document.querySelector('#colsGroup .slider-header span:first-child').textContent = '横向分割份数';
                document.querySelector('#rowsGroup .slider-header span:first-child').textContent = '竖向分割份数';
                break;
        }
        this.updateTotalParts();
    }

    updateTotalParts() {
        let total;
        switch (this.splitMode) {
            case 'horizontal':
                total = this.rows;
                break;
            case 'vertical':
                total = this.cols;
                break;
            case 'grid':
                total = this.cols * this.rows;
                break;
        }
        this.totalParts.textContent = total;
    }

    updateImageInfo() {
        if (!this.image) return;
        
        const displayImage = this.processedImage || this.image;
        
        if (this.trimEnabled && this.trimInfo) {
            this.originalSizeEl.textContent = `${displayImage.width} × ${displayImage.height}px (原: ${this.image.width} × ${this.image.height})`;
        } else {
            this.originalSizeEl.textContent = `${this.image.width} × ${this.image.height}px`;
        }
        this.fileSizeEl.textContent = this.formatFileSize(this.imageFile.size);
        this.updateSplitModeInfo();
    }

    updateSplitModeInfo() {
        let modeText;
        switch (this.splitMode) {
            case 'horizontal':
                modeText = `横向分割 - ${this.rows} 份`;
                break;
            case 'vertical':
                modeText = `竖向分割 - ${this.cols} 份`;
                break;
            case 'grid':
                modeText = `网格分割 - ${this.cols} × ${this.rows}`;
                break;
        }
        this.splitModeInfoEl.textContent = modeText;
        this.splitCountEl.textContent = this.totalParts.textContent + ' 个部分';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // 处理图片（去边）
    processImage() {
        if (!this.image) return;
        
        if (this.trimEnabled) {
            this.processedImage = this.trimBorders(this.image);
        } else {
            this.processedImage = this.image;
        }
        
        this.updatePreview();
        this.updateImageInfo();
    }

    // 解析颜色值为RGB
    parseColor(color) {
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            return {
                r: parseInt(hex.substr(0, 2), 16),
                g: parseInt(hex.substr(2, 2), 16),
                b: parseInt(hex.substr(4, 2), 16)
            };
        }
        return { r: 0, g: 0, b: 0 };
    }

    // 检测并裁剪边缘
    trimBorders(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        const threshold = this.trimThreshold;
        
        // 根据模式确定目标颜色
        let targetColor;
        switch (this.trimMode) {
            case 'black':
                targetColor = { r: 0, g: 0, b: 0 };
                break;
            case 'white':
                targetColor = { r: 255, g: 255, b: 255 };
                break;
            case 'custom':
                targetColor = this.parseColor(this.trimColor);
                break;
            default:
                targetColor = { r: 0, g: 0, b: 0 };
        }
        
        // 检测像素是否为边缘颜色（包括目标颜色及其容差范围内的颜色，以及透明像素）
        const isEdgeColor = (r, g, b, a) => {
            // 透明像素始终视为边缘
            if (a < 10) return true;
            
            // 计算与目标颜色的差异
            const diffR = Math.abs(r - targetColor.r);
            const diffG = Math.abs(g - targetColor.g);
            const diffB = Math.abs(b - targetColor.b);
            
            // 如果所有通道的差异都在阈值范围内，则视为边缘颜色
            return diffR <= threshold && diffG <= threshold && diffB <= threshold;
        };
        
        let top = 0, bottom = height - 1, left = 0, right = width - 1;
        
        // 从上边扫描
        topScan:
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    top = y;
                    break topScan;
                }
            }
        }
        
        // 从下边扫描
        bottomScan:
        for (let y = height - 1; y >= top; y--) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    bottom = y;
                    break bottomScan;
                }
            }
        }
        
        // 从左边扫描
        leftScan:
        for (let x = 0; x < width; x++) {
            for (let y = top; y <= bottom; y++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    left = x;
                    break leftScan;
                }
            }
        }
        
        // 从右边扫描
        rightScan:
        for (let x = width - 1; x >= left; x--) {
            for (let y = top; y <= bottom; y++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    right = x;
                    break rightScan;
                }
            }
        }
        
        // 计算裁剪后的尺寸
        const trimmedWidth = right - left + 1;
        const trimmedHeight = bottom - top + 1;
        
        // 如果裁剪后尺寸太小或没有变化，返回原图
        if (trimmedWidth < 10 || trimmedHeight < 10) {
            return img;
        }
        
        // 创建裁剪后的图片
        const trimmedCanvas = document.createElement('canvas');
        const trimmedCtx = trimmedCanvas.getContext('2d');
        trimmedCanvas.width = trimmedWidth;
        trimmedCanvas.height = trimmedHeight;
        
        trimmedCtx.drawImage(
            canvas,
            left, top, trimmedWidth, trimmedHeight,
            0, 0, trimmedWidth, trimmedHeight
        );
        
        // 转换为图片对象
        const trimmedImg = new Image();
        trimmedImg.src = trimmedCanvas.toDataURL();
        trimmedImg.width = trimmedWidth;
        trimmedImg.height = trimmedHeight;
        
        // 保存裁剪信息用于显示
        this.trimInfo = {
            original: { width: img.width, height: img.height },
            trimmed: { width: trimmedWidth, height: trimmedHeight },
            removed: {
                top: top,
                bottom: height - 1 - bottom,
                left: left,
                right: width - 1 - right
            }
        };
        
        return trimmedImg;
    }

    updatePreview() {
        if (!this.image) return;
        
        // 使用处理后的图片（如果有的话）
        const displayImage = this.processedImage || this.image;
        
        // 计算画布尺寸（保持比例，适应容器）
        const maxWidth = 800;
        const maxHeight = 500;
        let width = displayImage.width;
        let height = displayImage.height;
        
        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }
        
        this.previewCanvas.width = width;
        this.previewCanvas.height = height;
        
        // 绘制图片
        this.ctx.drawImage(displayImage, 0, 0, width, height);
        
        // 绘制分割线
        this.drawSplitLines(width, height);
        
        // 更新信息
        this.updateSplitModeInfo();
    }

    drawSplitLines(width, height) {
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        let cols = this.splitMode === 'horizontal' ? 1 : this.cols;
        let rows = this.splitMode === 'vertical' ? 1 : this.rows;
        
        // 绘制垂直线
        for (let i = 1; i < cols; i++) {
            const x = (width / cols) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let i = 1; i < rows; i++) {
            const y = (height / rows) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }

    async splitImage() {
        if (!this.image) return;
        
        this.showLoading(true);
        this.splitImages = [];
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            // 使用处理后的图片进行分割
            const sourceImage = this.processedImage || this.image;
            
            let cols = this.splitMode === 'horizontal' ? 1 : this.cols;
            let rows = this.splitMode === 'vertical' ? 1 : this.rows;
            
            const partWidth = sourceImage.width / cols;
            const partHeight = sourceImage.height / rows;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    // 先创建临时画布截取分割部分
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = partWidth;
                    tempCanvas.height = partHeight;
                    
                    tempCtx.drawImage(
                        sourceImage,
                        col * partWidth, row * partHeight,
                        partWidth, partHeight,
                        0, 0,
                        partWidth, partHeight
                    );
                    
                    // 如果启用了去边缘，对每个分割部分也进行边缘裁剪
                    let finalCanvas = tempCanvas;
                    if (this.trimEnabled) {
                        finalCanvas = this.trimCanvasBorders(tempCanvas);
                    }
                    
                    // 创建最终输出画布（包含边框）
                    const outputCanvas = document.createElement('canvas');
                    const outputCtx = outputCanvas.getContext('2d');
                    
                    let canvasWidth = finalCanvas.width;
                    let canvasHeight = finalCanvas.height;
                    
                    if (this.addBorder) {
                        canvasWidth += this.borderWidth * 2;
                        canvasHeight += this.borderWidth * 2;
                    }
                    
                    outputCanvas.width = canvasWidth;
                    outputCanvas.height = canvasHeight;
                    
                    // 绘制边框背景
                    if (this.addBorder) {
                        outputCtx.fillStyle = this.borderColor;
                        outputCtx.fillRect(0, 0, canvasWidth, canvasHeight);
                    }
                    
                    // 绘制图片部分
                    const offsetX = this.addBorder ? this.borderWidth : 0;
                    const offsetY = this.addBorder ? this.borderWidth : 0;
                    
                    outputCtx.drawImage(finalCanvas, offsetX, offsetY);
                    
                    // 转换为 blob
                    const mimeType = this.getMimeType();
                    const quality = this.outputFormat === 'png' ? 1 : this.quality / 100;
                    
                    const blob = await new Promise(resolve => {
                        outputCanvas.toBlob(resolve, mimeType, quality);
                    });
                    
                    const index = row * cols + col + 1;
                    this.splitImages.push({
                        blob,
                        name: `split_${row + 1}_${col + 1}.${this.outputFormat}`,
                        index,
                        dataUrl: outputCanvas.toDataURL(mimeType, quality)
                    });
                }
            }
            
            this.showResults();
        } catch (error) {
            console.error('分割失败:', error);
            alert('分割图片时出错，请重试');
        } finally {
            this.showLoading(false);
        }
    }

    // 对Canvas进行边缘裁剪
    trimCanvasBorders(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        const threshold = this.trimThreshold;
        
        // 根据模式确定目标颜色
        let targetColor;
        switch (this.trimMode) {
            case 'black':
                targetColor = { r: 0, g: 0, b: 0 };
                break;
            case 'white':
                targetColor = { r: 255, g: 255, b: 255 };
                break;
            case 'custom':
                targetColor = this.parseColor(this.trimColor);
                break;
            default:
                targetColor = { r: 0, g: 0, b: 0 };
        }
        
        // 检测像素是否为边缘颜色
        const isEdgeColor = (r, g, b, a) => {
            if (a < 10) return true;
            const diffR = Math.abs(r - targetColor.r);
            const diffG = Math.abs(g - targetColor.g);
            const diffB = Math.abs(b - targetColor.b);
            return diffR <= threshold && diffG <= threshold && diffB <= threshold;
        };
        
        let top = 0, bottom = height - 1, left = 0, right = width - 1;
        
        // 从上边扫描
        topScan:
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    top = y;
                    break topScan;
                }
            }
        }
        
        // 从下边扫描
        bottomScan:
        for (let y = height - 1; y >= top; y--) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    bottom = y;
                    break bottomScan;
                }
            }
        }
        
        // 从左边扫描
        leftScan:
        for (let x = 0; x < width; x++) {
            for (let y = top; y <= bottom; y++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    left = x;
                    break leftScan;
                }
            }
        }
        
        // 从右边扫描
        rightScan:
        for (let x = width - 1; x >= left; x--) {
            for (let y = top; y <= bottom; y++) {
                const idx = (y * width + x) * 4;
                if (!isEdgeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
                    right = x;
                    break rightScan;
                }
            }
        }
        
        // 计算裁剪后的尺寸
        const trimmedWidth = right - left + 1;
        const trimmedHeight = bottom - top + 1;
        
        // 如果裁剪后尺寸太小，返回原画布
        if (trimmedWidth < 5 || trimmedHeight < 5) {
            return canvas;
        }
        
        // 创建裁剪后的画布
        const trimmedCanvas = document.createElement('canvas');
        const trimmedCtx = trimmedCanvas.getContext('2d');
        trimmedCanvas.width = trimmedWidth;
        trimmedCanvas.height = trimmedHeight;
        
        trimmedCtx.drawImage(
            canvas,
            left, top, trimmedWidth, trimmedHeight,
            0, 0, trimmedWidth, trimmedHeight
        );
        
        return trimmedCanvas;
    }

    getMimeType() {
        switch (this.outputFormat) {
            case 'jpeg': return 'image/jpeg';
            case 'webp': return 'image/webp';
            default: return 'image/png';
        }
    }

    showResults() {
        this.editorSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        
        this.resultGrid.innerHTML = '';
        
        this.splitImages.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'result-item';
            
            item.innerHTML = `
                <img src="${img.dataUrl}" alt="分割图片 ${index + 1}">
                <div class="result-item-info">${img.name}</div>
                <a href="${img.dataUrl}" download="${img.name}" class="result-item-download">下载</a>
            `;
            
            this.resultGrid.appendChild(item);
        });
    }

    backToEdit() {
        this.resultSection.style.display = 'none';
        this.editorSection.style.display = 'block';
    }

    async downloadAll() {
        this.showLoading(true);
        
        try {
            const zip = new JSZip();
            
            this.splitImages.forEach(img => {
                zip.file(img.name, img.blob);
            });
            
            const content = await zip.generateAsync({ type: 'blob' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'split_images.zip';
            link.click();
            
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('打包下载失败:', error);
            alert('打包下载失败，请尝试单独下载各图片');
        } finally {
            this.showLoading(false);
        }
    }

    reset() {
        this.image = null;
        this.imageFile = null;
        this.splitImages = [];
        this.fileInput.value = '';
        
        this.uploadSection.style.display = 'block';
        this.editorSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImageSplitter();
});
