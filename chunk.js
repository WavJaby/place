class Chunk {
    //記錄整個chunk
    chunkMap;

    constructor(locX, locY, chunkWidth, chunkHeight) {
        this.locX = locX;
        this.locY = locY;
        this.chunkWidth = chunkWidth;
        this.chunkHeight = chunkHeight;

        this.canvasElement = document.createElement('canvas');
        this.canvas = this.canvasElement.getContext('2d');
        this.canvas.canvas.width = chunkWidth;
        this.canvas.canvas.height = chunkHeight;
        this.canvasElement.width = chunkWidth;
        this.canvasElement.height = chunkHeight;

        this.chunkMap = new Int8Array(chunkWidth * chunkHeight);
    }

    setPixel(x, y, color, canvas) {
        const chunkStartX = this.locX * realPixelSize * this.chunkWidth;
        const chunkStartY = this.locY * realPixelSize * this.chunkHeight;

        if (this.chunkMap[x + y * this.chunkWidth] === color) return false;
        this.chunkMap[x + y * this.chunkWidth] = color;
        this.canvas.fillStyle = canvas.fillStyle = COLOR_MAP[color];
        canvas.fillRect((chunkStartX + realPixelSize * x + mapX) + 0.5 | 0,
            (chunkStartY + realPixelSize * y + mapY) + 0.5 | 0,
            realPixelSize + 0.5 | 0, realPixelSize + 0.5 | 0);
        this.canvas.fillRect(x, y, 1, 1);
        return true;
    }

    loadChunk(colorData, length, canvas) {
        const chunkStartX = this.locX * realPixelSize * this.chunkWidth;
        const chunkStartY = this.locY * realPixelSize * this.chunkHeight;
        const realWidth = ((this.chunkWidth * realPixelSize * 100) | 0) / 100;
        const realHeight = ((this.chunkHeight * realPixelSize * 100) | 0) / 100;
        for (let i = 0; i < length; i++) {
            this.canvas.fillStyle = canvas.fillStyle = COLOR_MAP[this.chunkMap[i] = colorData[i]];
            const x = (i % this.chunkWidth), y = ((i / this.chunkWidth) | 0);
            this.canvas.fillRect(x, y, 1, 1);
        }
        canvas.drawImage(this.canvasElement, chunkStartX, chunkStartY, realWidth, realHeight);
    }

    //更新整個chunk
    drawChunk(canvas) {
        const chunkStartX = this.locX * realPixelSize * this.chunkWidth + mapX;
        const chunkStartY = this.locY * realPixelSize * this.chunkHeight + mapY
        const realChunkWidth = ((this.chunkWidth * realPixelSize * 100) | 0) / 100;
        const realChunkHeight = ((this.chunkHeight * realPixelSize * 100) | 0) / 100;
        canvas.drawImage(this.canvasElement, chunkStartX, chunkStartY, realChunkWidth, realChunkHeight);
    }
}