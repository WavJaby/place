function MiniMap(colors, miniMap) {
    let miniMapWidth;
    let miniMapHeight;
    let mapScale;

    const maxPixNum = 50;
    const threshold = 2;
    const refreshRate = 30;

    let miniMapRefreshTime = 0;

    const canvas = miniMap.getContext('2d');

    const toNormalScale = miniMap.onmouseout = function () {
        mapScale = 1;
        miniMapWidth = 100;
        miniMapHeight = 100;
        updateSize();
        requestAnimationFrame(refreshMiniMap);
    }

    miniMap.onmouseover = function () {
        mapScale = 2;
        miniMapWidth *= 3;
        miniMapHeight *= 3;
        updateSize();
        requestAnimationFrame(refreshMiniMap);
    }

    function updateSize() {
        canvas.canvas.width = miniMapWidth;
        canvas.canvas.height = miniMapHeight;
        miniMap.style.width = miniMapWidth + 'px';
        miniMap.style.height = miniMapHeight + 'px';
    }

    this.updateMiniMap = function (need) {
        if (miniMapRefreshTime < refreshRate && need !== true) {
            miniMapRefreshTime++;
            return;
        } else
            miniMapRefreshTime = 0;
        requestAnimationFrame(refreshMiniMap);
    }

    toNormalScale();

    let chunkX = 0, chunkY = 0;
    let chunkXC = 0, chunkYC = 0;
    this.setLocation = function (x, y, xc, yc) {
        chunkX = x;
        chunkY = y;
        chunkXC = xc;
        chunkYC = yc;
    }

    function refreshMiniMap() {
        const xChunkCount = miniMapWidth / mapScale;
        const yChunkCount = miniMapHeight / mapScale;

        //重設背景
        canvas.clearRect(0, 0, miniMapWidth, miniMapHeight);
        canvas.fillStyle = colors[0];
        canvas.fillRect(0, 0, miniMapWidth, miniMapHeight);

        for (let x = 0; x < xChunkCount; x++) {
            for (let y = 0; y < yChunkCount; y++) {
                let chunk = chunks[(chunkX + x - xChunkCount / 2 + chunkXC / 2) | 0];
                if (chunk === undefined) continue;
                chunk = chunk[(chunkY + y - yChunkCount / 2 + chunkYC / 2) | 0]
                if (chunk === undefined) continue;

                const teamAc = chunk.teams[0];
                const teamBc = chunk.teams[1];

                let r, g, b;
                if (teamAc > threshold && teamAc > teamBc) {
                    let scale = (teamAc + 20) / maxPixNum;
                    r = colors[1].r * scale;
                    g = colors[1].g * scale;
                    b = colors[1].b * scale;
                } else if (teamBc > threshold && teamBc > teamAc) {
                    let scale = (teamBc + 20) / maxPixNum;
                    r = colors[2].r * scale;
                    g = colors[2].g * scale;
                    b = colors[2].b * scale;
                } else {
                    continue;
                }

                canvas.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
                canvas.fillRect(x * mapScale, y * mapScale, mapScale, mapScale);
            }
        }

        //視野
        canvas.lineWidth = '1';
        canvas.strokeStyle = 'rgb(255,10,0)';
        canvas.beginPath();
        const x = ((xChunkCount / 2 - chunkXC / 2) * mapScale + 0.5) | 0;
        const y = ((yChunkCount / 2 - chunkYC / 2) * mapScale + 0.5) | 0;
        canvas.rect(x, y,
            chunkXC * mapScale, chunkYC * mapScale);
        canvas.stroke();
    }
}