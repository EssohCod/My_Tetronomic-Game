const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const nextCtx = nextPieceCanvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const linesDisplay = document.getElementById('linesDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const playButton = document.getElementById('playButton');

const CELL_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const COLORS = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange',
};
const SHAPES = {
    'I': [[1, 1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'Z': [[1, 1, 0], [0, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]],
    'L': [[0, 0, 1], [1, 1, 1]],
};

let grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));
let activePiece = getRandomTetromino();
let nextPiece = getRandomTetromino();
let heldPiece = null;
let isGameOver = false;
let dropInterval = 1000;
let lastDropTime = 0;
let currentScore = 0;
let linesCleared = 0;
let level = 0;

function drawCell(x, y, color, context) {
    context.fillStyle = color;
    context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    context.strokeStyle = '#000';
    context.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function renderBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x]) {
                drawCell(x, y, grid[y][x], ctx);
            }
        }
    }
}

function renderNextPiece() {
    nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    nextPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawCell(x, y, nextPiece.color, nextCtx);
            }
        });
    });
}

function getRandomTetromino() {
    const types = Object.keys(SHAPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return createTetromino(randomType);
}

function createTetromino(type) {
    return {
        type,
        shape: SHAPES[type],
        color: COLORS[type],
        x: Math.floor(GRID_WIDTH / 2) - 1,
        y: 0,
    };
}

function rotateTetromino(piece) {
    const newShape = piece.shape[0].map((_, index) => piece.shape.map(row => row[index]).reverse());
    return { ...piece, shape: newShape };
}

function moveTetromino(piece, offsetX, offsetY) {
    const newPiece = { ...piece, x: piece.x + offsetX, y: piece.y + offsetY };
    if (isValidMove(newPiece)) {
        return newPiece;
    }
    return piece;
}

function hardDrop(piece) {
    while (isValidMove({ ...piece, y: piece.y + 1 })) {
        piece.y++;
    }
    return piece;
}

function isValidMove(piece) {
    return piece.shape.every((row, dy) => {
        return row.every((cell, dx) => {
            const x = piece.x + dx;
            const y = piece.y + dy;
            return (
                cell === 0 ||
                (x >= 0 && x < GRID_WIDTH && y < GRID_HEIGHT && !grid[y][x])
            );
        });
    });
}

function placePiece(piece) {
    piece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
            if (cell) {
                const x = piece.x + dx;
                const y = piece.y + dy;
                grid[y][x] = piece.color;
            }
        });
    });
}

function clearLines() {
    let linesRemoved = 0;
    grid = grid.filter(row => {
        if (row.every(cell => cell !== null)) {
            linesRemoved++;
            return false;
        }
        return true;
    });
    while (grid.length < GRID_HEIGHT) {
        grid.unshift(Array(GRID_WIDTH).fill(null));
    }
    return linesRemoved;
}

function update(time) {
    if (!isGameOver) {
        if (time - lastDropTime > dropInterval) {
            const newPiece = moveTetromino(activePiece, 0, 1);
            if (newPiece === activePiece) {
                placePiece(activePiece);
                activePiece = nextPiece;
                nextPiece = getRandomTetromino();
                if (!isValidMove(activePiece)) {
                    isGameOver = true;
                }
                const linesRemoved = clearLines();
                currentScore += linesRemoved * 100;
                linesCleared += linesRemoved;
                if (linesCleared >= (level + 1) * 10) {
                    level++;
                    dropInterval *= 0.9;
                }
                scoreDisplay.textContent = currentScore;
                linesDisplay.textContent = linesCleared;
                levelDisplay.textContent = level;
            } else {
                activePiece = newPiece;
            }
            lastDropTime = time;
        }
    }
}

function draw() {
    renderBoard();
    renderNextPiece();
    activePiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawCell(activePiece.x + x, activePiece.y + y, activePiece.color, ctx);
            }
        });
    });
}

function gameLoop(time = 0) {
    update(time);
    draw();
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = 'red';
        ctx.font = '24px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 50, canvas.height / 2);
    }
}

document.addEventListener('keydown', (event) => {
    if (!isGameOver) {
        switch (event.key) {
            case 'ArrowUp':
            case 'x':
                activePiece = rotateTetromino(activePiece);
                break;
            case 'ArrowDown':
                activePiece = moveTetromino(activePiece, 0, 1);
                break;
            case 'ArrowLeft':
                activePiece = moveTetromino(activePiece, -1, 0);
                break;
            case 'ArrowRight':
                activePiece = moveTetromino(activePiece, 1, 0);
                break;
            case ' ':
                activePiece = hardDrop(activePiece);
                break;
            case 'Shift':
            case 'c':
                // Handle piece hold (if implemented)
                break;
            case 'Control':
            case 'z':
                activePiece = rotateTetromino(activePiece);
                break;
            case 'Escape':
            case 'F1':
                break;
            default:
                break;
        }
    }
});

playButton.addEventListener('click', () => {
    if (isGameOver) {
        isGameOver = false;
        grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));
        activePiece = getRandomTetromino();
        nextPiece = getRandomTetromino();
        currentScore = 0;
        linesCleared = 0;
        level = 0;
        dropInterval = 1000;
        lastDropTime = 0;
        scoreDisplay.textContent = currentScore;
        linesDisplay.textContent = linesCleared;
        levelDisplay.textContent = level;
        gameLoop();
    }
});

gameLoop();
