const databaseURL = 'https://script.google.com/macros/s/AKfycbx5nYlL6apT4RdFSf6hz7Gk-NvF8uFAlPCZo-lLiVy6-Csc2AVFbf3eakrz3-9E8is/exec';
const chunks = {};
//螢幕設定
let screenScale = 1.5;
let screenMinScale = 0.1;
let drawLineScreenScale = 1.5;
let enableStroke = false;
let strokeStyle = 'rgb(54, 54, 54)';
let background = 'rgb(30, 30, 30)';
let placeErrorColor = 'rgb(255, 0, 0)';

const COLOR_MAP = [
    new Color(0x000000),  // black
    new Color(0x6D001A),  // darkest red
    new Color(0xBE0039),  // dark red
    new Color(0xFF4500),  // red
    new Color(0xFFA800),  // orange
    new Color(0xFFD635),  // yellow
    new Color(0xFFF8B8),  // pale yellow
    new Color(0x00A368),  // dark green
    new Color(0x00CC78),  // green
    new Color(0x7EED56),  // light green
    new Color(0x00756F),  // dark teal
    new Color(0x009EAA),  // teal
    new Color(0x00CCC0),  // light teal
    new Color(0x2450A4),  // dark blue
    new Color(0x3690EA),  // blue
    new Color(0x51E9F4),  // light blue
    new Color(0x493AC1),  // indigo
    new Color(0x6A5CFF),  // periwinkle
    new Color(0x94B3FF),  // lavender
    new Color(0x811E9F),  // dark purple
    new Color(0xB44AC0),  // purple
    new Color(0xE4ABFF),  // pale purple
    new Color(0xDE107F),  // magenta
    new Color(0xFF3881),  // pink
    new Color(0xFF99AA),  // light pink
    new Color(0x6D482F),  // dark brown
    new Color(0x9C6926),  // brown
    new Color(0xFFB470),  // beige
    new Color(0x515252),  // dark gray
    new Color(0x898D90),  // gray
    new Color(0xD4D7D9),  // light gray
    new Color(0xFFFFFF),  // white
];

//chunk資訊
const chunkWidth = 16, chunkHeight = 16
const chunkWidthCount = 3, chunkHeightCount = 3
const cellSize = 10, cellWallGap = 2;
let realPixelSize;
let mapX = 0, mapY = 0;

function Main() {
    const playground = document.getElementById('playground');
    const canvas = playground.getContext('2d');
    const gameWindow = document.getElementById('gamePage');
    const locationView = document.getElementById('location')
    const colorSelectionArea = document.getElementById('colorSelectionArea');

    // const miniMapElement = document.getElementById('miniMap');
    // const minMap = new MiniMap(colors, miniMapElement);

    // 範例
    let lastDrawPosX = 0, lastDrawPosY = 0;
    let lastMousePosX = 0, lastMousePosY = 0;
    // 移動
    let drag = false;
    let moved = false;
    let lastMouseX, lastMouseY;
    // 縮放
    let delta = 0.1;
    // 顏色
    let selectColorCode = 0;

    /** init */
    realPixelSize = ((cellSize * screenScale) * 10 | 0) / 10;
    gameWindow.style.backgroundColor = background;
    resizeScreen();
    getData('t=0', i => {
        i = i.split(',');
        const width = parseInt(i[0]), height = parseInt(i[1]);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                getData(`x=${x}&y=${y}`, data => {
                    getChunk(x, y).loadChunk(data.split(','), canvas);
                });
            }
        }
    });

    const colorSelectionAreaHeight = (window.innerHeight - 20);
    colorSelectionArea.style.height = colorSelectionAreaHeight + 'px';
    const colorHeight = (
        colorSelectionAreaHeight -
        COLOR_MAP.length * parseInt(getStyle('.colorSelection')['margin-top'])
    ) / COLOR_MAP.length;
    for (let i = 0; i < COLOR_MAP.length; i++) {
        const colorSelection = document.createElement('div');
        colorSelection.classList.add('colorSelection');
        colorSelection.style.backgroundColor = COLOR_MAP[i].toString();
        colorSelection.style.height = colorSelection.style.width = colorHeight + 'px';
        colorSelection.colorID = i;
        colorSelection.onclick = onColorSelect;
        colorSelectionArea.appendChild(colorSelection);
    }


    // loadExample();
    // minMap.updateMiniMap(true);

    /** listener */
    window.onkeydown = function (event) {
        // if (selectModel) {
        //     if (event.key === 'r') {
        //         //先清除
        //         placeExample(lastMousePosX, lastMousePosY, true);
        //         const modelWidth = model[0][0];
        //         const modelHeight = model[0][1];
        //         let newModel = [];
        //         newModel.push([modelHeight, modelWidth]);
        //
        //         for (let x = 0; x < modelWidth; x++) {
        //             let cache = []
        //             for (let y = modelHeight; y > 0; y--) {
        //                 cache.push(model[y][x]);
        //             }
        //             newModel.push(cache);
        //         }
        //
        //         model = newModel;
        //         drawExample(lastMousePosX, lastMousePosY, true);
        //     }
        //
        //     if (event.key === 'f') {
        //         //先清除
        //         placeExample(lastMousePosX, lastMousePosY, true);
        //         const modelWidth = model[0][0];
        //         const modelHeight = model[0][1];
        //         let newModel = [];
        //         newModel.push([modelWidth, modelHeight]);
        //
        //         for (let y = 0; y < modelHeight; y++) {
        //             let cache = [];
        //             for (let x = modelWidth; x > 0; x--) {
        //                 cache.push(model[y + 1][x - 1]);
        //             }
        //             newModel.push(cache);
        //         }
        //
        //         model = newModel;
        //         drawExample(lastMousePosX, lastMousePosY, true);
        //     }
        //
        //     if (event.key === 'Escape') {
        //         selectModel = false;
        //         placeExample(lastMousePosX, lastMousePosY, true);
        //     }
        // }
    }

    playground.onmousedown = function (event) {
        resizeScreen();
        if (!drag) {
            lastMouseX = event.offsetX;
            lastMouseY = event.offsetY;
            drag = true;
        }
    }

    playground.onmouseup = function (event) {
        //點擊
        if (!moved) {
            // if (selectModel) {
            //     const donePlace = placeExample(event.offsetX, event.offsetY);
            //     //沒有按住shift且放置成功
            //     if (!event.shiftKey && donePlace)
            //         selectModel = false;
            // }
            //一般的點選
            // else {
            let x = (event.offsetX - mapX) / realPixelSize;
            let y = (event.offsetY - mapY) / realPixelSize;
            //計算chunk位置
            let cx = x / chunkWidth | 0;
            let cy = y / chunkHeight | 0;
            if (x < 0)
                cx--;
            if (y < 0)
                cy--;
            if (cx < 0 || cx >= chunkWidthCount || cy < 0 || cy >= chunkHeightCount) {
                drag = false;
                moved = false;
                return;
            }


            const chunk = getChunk(cx, cy);

            //chunk裡的x,y
            let xInC = x - (cx * chunkWidth) | 0;
            let yInC = y - (cy * chunkHeight) | 0;
            // if (chunk.chunkMap[xInC][yInC] > 0 && chunk.chunkMap[xInC][yInC] !== teamID) {
            //     canvas.fillStyle = placeErrorColor;
            //     let chunkStartX = cx * realPixelSize * chunkWidth;
            //     let chunkStartY = cy * realPixelSize * chunkHeight;
            //     canvas.fillRect(chunkStartX + xInC * realPixelSize, chunkStartY + yInC * realPixelSize, realPixelSize, realPixelSize);
            // } else {
            chunk.setPixel(xInC, yInC, selectColorCode, canvas);
            uploadData(x, y, selectColorCode);
            // calculateChangeLaterChunk();
            // }
            // chunk.drawChangeCells(canvas);
            // }
        }
        //還在選取狀態
        // else if (selectModel) {
        //     drawExample(event.offsetX, event.offsetY, true);
        // }
        // minMap.updateMiniMap(true);
        drag = false;
        moved = false;
    }

    playground.onmousemove = function (event) {
        //移動
        if (drag && !event.shiftKey) {
            mapX += event.offsetX - lastMouseX;
            mapY += event.offsetY - lastMouseY;
            lastMouseX = event.offsetX;
            lastMouseY = event.offsetY;

            moved = true;
            move();
        }

        //畫範例
        // if (!drag && selectModel) {
        //     drawExample(event.offsetX, event.offsetY, false, false, true);
        // }
    }

    playground.onmouseleave = function (event) {
        drag = false;
    }

    playground.onwheel = function (event) {
        const lastScreenScale = screenScale;

        delta = delta < 0 ? -delta : delta;
        if (event.deltaY > 0)
            delta *= -1;

        screenScale = Math.round((screenScale + delta) * 10) / 10;

        if (screenScale < screenMinScale) {
            screenScale = screenMinScale;
        }

        if (lastScreenScale === screenScale)
            return;

        realPixelSize = ((cellSize * screenScale) * 10 | 0) / 10;
        refreshScreen();
    }

    function onColorSelect(e) {
        selectColorCode = e.target.colorID;
    }

    /** draw */
    function drawAllChunks() {
        const adjustX = mapX < 0;
        const adjustY = mapY < 0;

        const viewWidth = playground.width;
        const viewHeight = playground.height;

        canvas.clearRect(0, 0, viewWidth, viewHeight);
        //計算畫面中有幾個chunk
        const xChunkCount = (viewWidth / realPixelSize * chunkWidth + 2) | 0;
        const yChunkCount = (viewHeight / realPixelSize * chunkHeight + 2) | 0;

        //計算chunk開始位置X
        const startX = ((-mapX / realPixelSize / chunkWidth | 0) - 1 + adjustX);
        //計算chunk開始位置Y
        const startY = ((-mapY / realPixelSize / chunkHeight | 0) - 1 + adjustY);
        // minMap.setLocation(startX + 1, startY + 1, xChunkCount - 2, yChunkCount - 2);

        for (let x = 0; x < xChunkCount; x++) {
            //計算chunk位置X
            const cx = chunks[(startX + x) | 0];
            if (cx === undefined) continue;
            for (let y = 0; y < yChunkCount; y++) {
                //計算chunk位置Y
                const cy = cx[(startY + y) | 0];
                if (cy === undefined) continue;
                cy.drawChunk(canvas);
            }
        }

        if (screenScale > drawLineScreenScale && enableStroke) {
            canvas.lineWidth = cellWallGap;
            canvas.strokeStyle = strokeStyle;
            canvas.beginPath();
            const lStartX = mapX % realPixelSize - realPixelSize * (adjustX + 1);
            const lStartY = mapY % realPixelSize - realPixelSize * (adjustY + 1);
            for (let y = 0; y < viewWidth; y++) {
                canvas.moveTo(lStartX, lStartY + y * realPixelSize);
                canvas.lineTo(viewWidth, lStartY + y * realPixelSize);
            }

            for (let x = 0; x < xChunkCount * chunkWidth; x++) {
                canvas.moveTo(lStartX + x * realPixelSize, lStartY);
                canvas.lineTo(lStartX + x * realPixelSize, viewHeight);
            }
            canvas.stroke();
        }
    }

    function drawExample(x, y, need, failed, clear) {
        const objectWidth = model[0][0];
        const objectHeight = model[0][1];

        let startX = ((x - mapX - realPixelSize / 2) / realPixelSize | 0) * realPixelSize;
        let startY = ((y - mapY - realPixelSize / 2) / realPixelSize | 0) * realPixelSize;
        //置中
        startX -= realPixelSize * (objectWidth / 2 | 0);
        startY -= realPixelSize * (objectHeight / 2 | 0);

        //負的地方需要更改
        if ((x - mapX) < realPixelSize / 2)
            startX -= realPixelSize;
        if ((y - mapY) < realPixelSize / 2)
            startY -= realPixelSize;

        //刷新螢幕
        if (startX !== lastDrawPosX || startY !== lastDrawPosY || need) {
            //清除上次畫的
            if (clear)
                placeExample(lastMousePosX, lastMousePosY, true);
            lastDrawPosX = startX;
            lastDrawPosY = startY;
        } else {
            return;
        }

        if (failed)
            canvas.fillStyle = placeErrorColor;
        else
            canvas.fillStyle = colors[teamID];

        //畫範例
        for (let y = 0; y < objectHeight; y++) {
            for (let x = 0; x < objectWidth; x++) {
                if (model[y + 1][x] === 0)
                    continue;
                canvas.fillRect(startX + realPixelSize * (x + 1), startY + realPixelSize * (y + 1), realPixelSize, realPixelSize);
            }
        }

        lastMousePosX = x;
        lastMousePosY = y;
    }

    function placeExample(x, y, clear) {
        const modelWidth = model[0][0];
        const modelHeight = model[0][1];

        let startX = ((x - mapX - realPixelSize / 2) / realPixelSize | 0) * realPixelSize;
        let startY = ((y - mapY - realPixelSize / 2) / realPixelSize | 0) * realPixelSize;
        //置中
        startX -= realPixelSize * (modelWidth / 2 | 0);
        startY -= realPixelSize * (modelHeight / 2 | 0);
        let startXsav = startX;
        let startYsav = startY;

        //負的地方需要更改
        if ((x - mapX) < realPixelSize / 2)
            startX -= realPixelSize;
        if ((y - mapY) < realPixelSize / 2)
            startY -= realPixelSize;

        //節省chunk的取得
        let lastCx = null, lastCy = null;
        let chunk;

        let needChangeChunk = {};
        for (let y = 0; y < modelHeight; y++) {
            startY += realPixelSize;
            let cache = startX;
            for (let x = 0; x < modelWidth; x++) {
                startX += realPixelSize;
                if (model[y + 1][x] === 0)
                    continue;

                let cx = (startX + 0.05) / realPixelSize / chunkWidth | 0;
                let cy = (startY + 0.05) / realPixelSize / chunkWidth | 0;
                if (startX < 0)
                    cx--;
                if (startY < 0)
                    cy--;

                //在chunk中的位置
                let xInC = startX / realPixelSize - (cx * chunkWidth) | 0;
                let yInC = startY / realPixelSize - (cy * chunkHeight) | 0;

                if (lastCx !== cx || lastCy !== cy) {
                    chunk = chunks[cx];
                    if (chunk !== undefined)
                        chunk = chunk[cy];
                    lastCx = cx;
                    lastCy = cy;
                }

                if (clear) {
                    if (chunk === undefined) {
                        canvas.fillStyle = colors[0];
                    }
                    //chunk有在
                    else {
                        let teamID = chunk.chunkMap[xInC][yInC];
                        canvas.fillStyle = colors[teamID];
                    }
                    canvas.fillRect(startX, startY, realPixelSize, realPixelSize);

                } else {
                    //放置
                    //看看這附近有沒有東西
                    if (chunk !== undefined)
                        //有東西
                        if (chunk.cellData[xInC][yInC] > 0) {
                            drawExample(lastMousePosX, lastMousePosY, true, true);
                            return false;
                        }

                    //加入替換清單
                    const thisChunk = needChangeChunk[cx + ',' + cy];
                    if (thisChunk === undefined)
                        needChangeChunk[cx + ',' + cy] = [[xInC, yInC]];
                    else
                        thisChunk.push([xInC, yInC])
                }
            }
            startX = cache;
        }

        if (!clear) {
            for (const i in needChangeChunk) {
                const j = i.split(',');
                getChunk(parseInt(j[0]), parseInt(j[1]))
                    .addCells(needChangeChunk[i], canvas, teamID)
            }
            // calculateChangeLaterChunk();
            return true;
        }

        startXsav += realPixelSize;
        startYsav += realPixelSize;

        if (screenScale > drawLineScreenScale && enableStroke) {
            canvas.lineWidth = cellWallGap;
            canvas.strokeStyle = strokeStyle;
            canvas.beginPath();
            const viewWidth = startXsav + modelWidth * realPixelSize;
            const viewHeight = startYsav + modelHeight * realPixelSize;
            for (let y = 0; y < modelHeight + 1; y++) {
                let ly = startYsav + y * realPixelSize;
                canvas.moveTo(startXsav, ly);
                canvas.lineTo(viewWidth, ly);
            }

            for (let x = 0; x < modelWidth + 1; x++) {
                let lx = startXsav + x * realPixelSize;
                canvas.moveTo(lx, startYsav);
                canvas.lineTo(lx, viewHeight);
            }
            canvas.stroke();
        }
    }

    function move() {
        locationView.innerText = '座標: ' + -(mapX / realPixelSize | 0) + ',' + (mapY / realPixelSize | 0);
        refreshScreen();
    }

    function resizeScreen() {
        if (playground.width !== gameWindow.offsetWidth || playground.height !== gameWindow.offsetHeight) {
            playground.width = gameWindow.offsetWidth;
            playground.height = gameWindow.offsetHeight;
            refreshScreen();
        }
    }

    function refreshScreen() {
        window.requestAnimationFrame(drawAllChunks);
    }

    /** database control */
    function uploadData(x, y, color) {
        postData(`${x},${y},${color}`);
    }

    function getData(parameter, callBack) {
        fetch(databaseURL + '?' + parameter, {
            headers: {
                'content-type': 'text/plain;charset=utf-8',
            },
            cache: 'no-cache',
            credentials: 'same-origin',
            mode: 'cors',
            redirect: 'follow',
            method: 'GET',
        }).then(i => i.text()).then(i => callBack(i));
    }

    function postData(body, callBack) {
        fetch(databaseURL, {
            headers: {
                'content-type': 'text/plain;charset=utf-8',
            },
            cache: 'no-cache',
            credentials: 'same-origin',
            mode: 'no-cors',
            redirect: 'follow',
            method: 'POST',
            body: body
        }).then(data => callBack);
    }

    /** chunk control */
    function loadChunk(x, y) {
        const chunk = new Chunk(x, y, chunkWidth, chunkHeight);
        let cx = chunks[x];
        if (cx === undefined)
            cx = chunks[x] = {};
        cx[y] = chunk;
        return chunk;
    }

    function getChunk(x, y) {
        let chunk = chunks[x];
        if (chunk === undefined)
            return loadChunk(x, y);
        chunk = chunk[y];
        if (chunk === undefined)
            return loadChunk(x, y);
        return chunk;
    }

    function unloadChunk(x, y) {
        const chunk = chunks[x];
        if (chunk !== undefined && chunk[y] !== undefined)
            delete chunks[x][y];
    }
}

function getStyle(selector) {
    var styleSheet = document.styleSheets[0];
    var rules = styleSheet.cssRules ? styleSheet.cssRules : styleSheet.rules;

    for (var i = 0; i < rules.length; i++) {
        if (rules[i].selectorText === selector)
            return rules[i].style;
    }
}

window.onload = Main;
