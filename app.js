// 图片分割工具主程序
class ImageSplitter {
    constructor() {
        this.image = null;
        this.imageFile = null;
        this.splitMode = 'grid'; // horizontal, vertical, grid
        this.cols = 3;
        this.rows = 3;
        this.addBorder = false;
        this.borderColor = '#ffffff';
        this.borderWidth = 2;
        this.outputFormat = 'png';
        this.quality = 100;
        this.splitImages = [];

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
                this.showEditor();
                this.updatePreview();
                this.updateImageInfo();
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
        
        this.originalSizeEl.textContent = `${this.image.width} × ${this.image.height}px`;
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

    updatePreview() {
        if (!this.image) return;
        
        // 计算画布尺寸（保持比例，适应容器）
        const maxWidth = 800;
        const maxHeight = 500;
        let width = this.image.width;
        let height = this.image.height;
        
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
        this.ctx.drawImage(this.image, 0, 0, width, height);
        
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
            let cols = this.splitMode === 'horizontal' ? 1 : this.cols;
            let rows = this.splitMode === 'vertical' ? 1 : this.rows;
            
            const partWidth = this.image.width / cols;
            const partHeight = this.image.height / rows;
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let canvasWidth = partWidth;
                    let canvasHeight = partHeight;
                    
                    if (this.addBorder) {
                        canvasWidth += this.borderWidth * 2;
                        canvasHeight += this.borderWidth * 2;
                    }
                    
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    
                    // 绘制边框背景
                    if (this.addBorder) {
                        ctx.fillStyle = this.borderColor;
                        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    }
                    
                    // 绘制图片部分
                    const offsetX = this.addBorder ? this.borderWidth : 0;
                    const offsetY = this.addBorder ? this.borderWidth : 0;
                    
                    ctx.drawImage(
                        this.image,
                        col * partWidth, row * partHeight,
                        partWidth, partHeight,
                        offsetX, offsetY,
                        partWidth, partHeight
                    );
                    
                    // 转换为 blob
                    const mimeType = this.getMimeType();
                    const quality = this.outputFormat === 'png' ? 1 : this.quality / 100;
                    
                    const blob = await new Promise(resolve => {
                        canvas.toBlob(resolve, mimeType, quality);
                    });
                    
                    const index = row * cols + col + 1;
                    this.splitImages.push({
                        blob,
                        name: `split_${row + 1}_${col + 1}.${this.outputFormat}`,
                        index,
                        dataUrl: canvas.toDataURL(mimeType, quality)
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
