// Image upload and validation handler
class ImageHandler {
    constructor() {
        this.uploadedImage = null;
        this.imageFile = null;
    }

    /**
     * Validate image file
     * @param {File} file - The uploaded file
     * @returns {Object} - Validation result with success flag and message
     */
    async validateImage(file) {
        const constraints = CONFIG.IMAGE_CONSTRAINTS;

        // Check file type
        if (!constraints.ALLOWED_TYPES.includes(file.type)) {
            return {
                success: false,
                message: `不支援的檔案格式。請上傳 JPEG 或 PNG 圖片。`
            };
        }

        // Check file size
        if (file.size > constraints.MAX_FILE_SIZE) {
            return {
                success: false,
                message: `檔案大小超過限制。最大允許 ${constraints.MAX_FILE_SIZE / 1024 / 1024}MB，目前檔案為 ${(file.size / 1024 / 1024).toFixed(2)}MB。`
            };
        }

        // Load image to check dimensions
        try {
            const img = await this.loadImage(file);
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const aspectRatio = width / height;

            // Check width
            if (width < constraints.MIN_WIDTH || width > constraints.MAX_WIDTH) {
                return {
                    success: false,
                    message: `圖片寬度不符合規定。需要 ${constraints.MIN_WIDTH}-${constraints.MAX_WIDTH}px，目前為 ${width}px。`
                };
            }

            // Check height
            if (height < constraints.MIN_HEIGHT) {
                return {
                    success: false,
                    message: `圖片高度不符合規定。最小需要 ${constraints.MIN_HEIGHT}px，目前為 ${height}px。`
                };
            }

            // Check aspect ratio
            if (aspectRatio < constraints.MIN_ASPECT_RATIO) {
                return {
                    success: false,
                    message: `圖片長寬比不符合規定。最小需要 ${constraints.MIN_ASPECT_RATIO}，目前為 ${aspectRatio.toFixed(2)}。`
                };
            }

            // All validation passed
            this.uploadedImage = img;
            this.imageFile = file;

            return {
                success: true,
                message: `圖片驗證成功！尺寸: ${width}x${height}px，長寬比: ${aspectRatio.toFixed(2)}`,
                dimensions: { width, height, aspectRatio }
            };

        } catch (error) {
            return {
                success: false,
                message: `無法載入圖片。請確認檔案是否正確。錯誤: ${error.message}`
            };
        }
    }

    /**
     * Load image from file
     * @param {File} file - The image file
     * @returns {Promise<HTMLImageElement>} - Loaded image element
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('圖片載入失敗'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('檔案讀取失敗'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Get the uploaded image
     * @returns {HTMLImageElement|null}
     */
    getImage() {
        return this.uploadedImage;
    }

    /**
     * Get the uploaded file
     * @returns {File|null}
     */
    getFile() {
        return this.imageFile;
    }

    /**
     * Reset the handler
     */
    reset() {
        this.uploadedImage = null;
        this.imageFile = null;
    }
}
