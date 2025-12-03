// Area selector for drawing clickable regions on the image
class AreaSelector {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.image = null;
        this.areas = [];
        this.currentArea = null;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.scale = 1;

        this.setupEventListeners();
    }

    /**
     * Set the image to draw on
     * @param {HTMLImageElement} image
     */
    setImage(image) {
        this.image = image;
        this.areas = [];
        this.setupCanvas();
        this.draw();
    }

    /**
     * Setup canvas dimensions and scale
     */
    setupCanvas() {
        if (!this.image) return;

        const maxWidth = this.canvas.parentElement.clientWidth - 40;
        const imageWidth = this.image.naturalWidth;
        const imageHeight = this.image.naturalHeight;

        // Calculate scale to fit container
        this.scale = Math.min(maxWidth / imageWidth, 1);

        this.canvas.width = imageWidth;
        this.canvas.height = imageHeight;
        this.canvas.style.width = (imageWidth * this.scale) + 'px';
        this.canvas.style.height = (imageHeight * this.scale) + 'px';
    }

    /**
     * Setup mouse event listeners for drawing
     */
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }

    /**
     * Get mouse position relative to canvas actual size (not scaled)
     */
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        this.isDrawing = true;
        this.startX = pos.x;
        this.startY = pos.y;
        this.currentArea = {
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0
        };
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;

        const pos = this.getMousePos(e);
        this.currentArea.width = pos.x - this.startX;
        this.currentArea.height = pos.y - this.startY;

        this.draw();
    }

    handleMouseUp(e) {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        // Normalize the area (handle negative width/height)
        const area = this.normalizeArea(this.currentArea);

        // Only add area if it has meaningful size (at least 10x10 pixels)
        if (area.width >= 10 && area.height >= 10) {
            // Show modal to configure area action
            if (window.app) {
                window.app.showAreaModal(area);
            }
        }

        this.currentArea = null;
        this.draw();
    }

    handleMouseLeave(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.currentArea = null;
            this.draw();
        }
    }

    /**
     * Normalize area to ensure positive width and height
     */
    normalizeArea(area) {
        let x = area.x;
        let y = area.y;
        let width = area.width;
        let height = area.height;

        if (width < 0) {
            x = x + width;
            width = Math.abs(width);
        }

        if (height < 0) {
            y = y + height;
            height = Math.abs(height);
        }

        return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
    }

    /**
     * Add a configured area
     * @param {Object} bounds - Area bounds {x, y, width, height}
     * @param {Object} action - Area action {type, label, text}
     */
    addArea(bounds, action) {
        const area = {
            bounds: this.normalizeArea(bounds),
            action: action
        };
        this.areas.push(area);
        this.draw();
    }

    /**
     * Remove an area by index
     * @param {number} index
     */
    removeArea(index) {
        this.areas.splice(index, 1);
        this.draw();
    }

    /**
     * Get all areas in LINE API format
     * @returns {Array}
     */
    getAreasForAPI() {
        return this.areas.map(area => ({
            bounds: area.bounds,
            action: area.action
        }));
    }

    /**
     * Get all areas
     * @returns {Array}
     */
    getAreas() {
        return this.areas;
    }

    /**
     * Draw the image and all areas
     */
    draw() {
        if (!this.image) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw image
        this.ctx.drawImage(this.image, 0, 0);

        // Draw existing areas
        this.areas.forEach((area, index) => {
            this.drawArea(area.bounds, `#4CAF50`, index + 1);
        });

        // Draw current area being drawn
        if (this.currentArea && this.isDrawing) {
            this.drawArea(this.currentArea, '#2196F3', '?');
        }
    }

    /**
     * Draw a single area
     * @param {Object} bounds - {x, y, width, height}
     * @param {string} color - Border color
     * @param {string|number} label - Label to display
     */
    drawArea(bounds, color, label) {
        const { x, y, width, height } = bounds;

        // Draw semi-transparent fill
        this.ctx.fillStyle = color + '40'; // 40 = 25% opacity in hex
        this.ctx.fillRect(x, y, width, height);

        // Draw border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);

        // Draw label
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x + width / 2, y + height / 2);
    }

    /**
     * Reset the selector
     */
    reset() {
        this.image = null;
        this.areas = [];
        this.currentArea = null;
        this.isDrawing = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
