class Chunk {
    //記錄整個chunk
    chunkMap;
    //要更改的cell
    changeList = [];

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
        let chunkStartX = this.locX * realPixelSize * this.chunkWidth;
        let chunkStartY = this.locY * realPixelSize * this.chunkHeight;
        console.log()

        if (this.chunkMap[x + y * this.chunkWidth] === color) return false;
        this.chunkMap[x + y * this.chunkWidth] = color;
        this.canvas.fillStyle = canvas.fillStyle = COLOR_MAP[color];
        canvas.fillRect((chunkStartX + realPixelSize * x + mapX) + 0.5 | 0,
            (chunkStartY + realPixelSize * y + mapY) + 0.5 | 0,
            realPixelSize, realPixelSize);
        this.canvas.fillRect(x, y, 1, 1);
        return true;
    }

    loadChunk(colorData, length, canvas) {
        let chunkStartX = this.locX * realPixelSize * this.chunkWidth;
        let chunkStartY = this.locY * realPixelSize * this.chunkHeight;
        for (let i = 0; i < length; i++) {
            this.canvas.fillStyle = canvas.fillStyle = COLOR_MAP[this.chunkMap[i] = colorData[i]];
            const x = (i % this.chunkWidth), y = ((i / this.chunkWidth) | 0);
            canvas.fillRect(chunkStartX + realPixelSize * x + mapX,
                chunkStartY + realPixelSize * y + mapY,
                realPixelSize, realPixelSize);
            this.canvas.fillRect(x, y, 1, 1);
        }
    }

    //更新整個chunk
    drawChunk(canvas) {
        let chunkStartX = this.locX * realPixelSize * this.chunkWidth + mapX;
        let chunkStartY = this.locY * realPixelSize * this.chunkHeight + mapY
        const realWidth = ((this.chunkWidth * realPixelSize * 100) | 0) / 100;
        const realHeight = ((this.chunkHeight * realPixelSize * 100) | 0) / 100;

        // if (this.lastDrawScale !== screenScale) {
        //     // 更新畫布大小
        //     const realWidth = ((this.chunkWidth * realPixelSize * 10) | 0) / 10;
        //     const realHeight = ((this.chunkHeight * realPixelSize * 10) | 0) / 10;
        //     this.canvas.canvas.width = realWidth;
        //     this.canvas.canvas.height = realHeight;
        //     this.canvasElement.width = realWidth;
        //     this.canvasElement.height = realHeight;
        //     this.canvas.fillStyle = COLOR_MAP[0].toString();
        //     this.canvas.fillRect(0, 0, realWidth, realHeight);
        //
        //     for (let x = 0; x < this.chunkWidth; x++) {
        //         for (let y = 0; y < this.chunkHeight; y++) {
        //             const color = this.chunkMap[x + y * this.chunkWidth];
        //             if (color === 0) continue;
        //             this.canvas.fillStyle = COLOR_MAP[color].toString();
        //
        //             //fill square
        //             this.canvas.fillRect(realPixelSize * x, realPixelSize * y, realPixelSize, realPixelSize);
        //         }
        //     }
        //
        //     this.lastDrawScale = screenScale;
        // }
        canvas.drawImage(this.canvasElement, chunkStartX, chunkStartY, realWidth, realHeight);
    }

    //更新改變的cells
    drawChangeCells(canvas) {
        let chunkStartX = this.locX * realPixelSize * this.chunkWidth;
        let chunkStartY = this.locY * realPixelSize * this.chunkHeight;

        for (const i of this.changeList) {
            const team = this.chunkMap[i[0]][i[1]];
            canvas.fillStyle = this.canvas.fillStyle = colors[team].toString();

            if (screenScale > drawLineScreenScale)
                canvas.fillRect(chunkStartX + realPixelSize * i[0] + cellWallGap / 2 + mapX,
                    chunkStartY + realPixelSize * i[1] + cellWallGap / 2 + mapY,
                    realPixelSize - cellWallGap, realPixelSize - cellWallGap);
            else
                canvas.fillRect(chunkStartX + realPixelSize * i[0] + mapX,
                    chunkStartY + realPixelSize * i[1] + mapY,
                    realPixelSize, realPixelSize);
        }
    }
}