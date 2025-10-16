const WINDOW_SIZE = 800;
const ROWS = 40;
const GRID_MARGIN = 40;
const GRID_SIZE = WINDOW_SIZE - GRID_MARGIN * 2;
const NODE_SIZE = GRID_SIZE / ROWS;
const PATH_DELAY_MS = 25;

const BG_COLOR = '#1c1c1c';
const GRID_LINE_COLOR = '#505050';
const EMPTY_COLOR = '#1c1c1c';
const START_COLOR = '#ffa500';
const END_COLOR = '#40e0d0';
const BARRIER_COLOR = '#0a0a28';
const OPEN_COLOR = '#00c864';
const CLOSED_COLOR = '#c83232';
const PATH_COLOR = '#8c00ff';

class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.x = GRID_MARGIN + col * NODE_SIZE;
        this.y = GRID_MARGIN + row * NODE_SIZE;
        this.color = EMPTY_COLOR;
        this.neighbors = [];
    }

    getPos() {
        return [this.row, this.col];
    }

    isClosed() {
        return this.color === CLOSED_COLOR;
    }

    isOpen() {
        return this.color === OPEN_COLOR;
    }

    isBarrier() {
        return this.color === BARRIER_COLOR;
    }

    isStart() {
        return this.color === START_COLOR;
    }

    isEnd() {
        return this.color === END_COLOR;
    }

    reset() {
        this.color = EMPTY_COLOR;
    }

    makeStart() {
        this.color = START_COLOR;
    }

    makeClosed() {
        this.color = CLOSED_COLOR;
    }

    makeOpen() {
        this.color = OPEN_COLOR;
    }

    makeBarrier() {
        this.color = BARRIER_COLOR;
    }

    makeEnd() {
        this.color = END_COLOR;
    }

    makePath() {
        this.color = PATH_COLOR;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, NODE_SIZE, NODE_SIZE);
    }

    updateNeighbors(grid) {
        this.neighbors = [];
        if (this.row > 0 && !grid[this.row - 1][this.col].isBarrier()) {
            this.neighbors.push(grid[this.row - 1][this.col]);
        }
        if (this.row < ROWS - 1 && !grid[this.row + 1][this.col].isBarrier()) {
            this.neighbors.push(grid[this.row + 1][this.col]);
        }
        if (this.col > 0 && !grid[this.row][this.col - 1].isBarrier()) {
            this.neighbors.push(grid[this.row][this.col - 1]);
        }
        if (this.col < ROWS - 1 && !grid[this.row][this.col + 1].isBarrier()) {
            this.neighbors.push(grid[this.row][this.col + 1]);
        }
    }
}

function heuristic(p1, p2) {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

function reconstructPath(cameFrom, current, draw) {
    while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        if (current.isStart()) break;
        current.makePath();
        draw();
    }
}

async function algorithm(draw, grid, start, end) {
    let count = 0;
    const openSet = [];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const openSetHash = new Set();

    // Initialize scores
    for (let row of grid) {
        for (let node of row) {
            gScore.set(node, Infinity);
            fScore.set(node, Infinity);
        }
    }
    gScore.set(start, 0);
    fScore.set(start, heuristic(start.getPos(), end.getPos()));

    openSet.push([fScore.get(start), count, start]);
    openSetHash.add(start);

    while (openSet.length > 0) {
        openSet.sort((a, b) => a[0] - b[0]);
        const current = openSet.shift()[2];
        openSetHash.delete(current);

        if (current === end) {
            reconstructPath(cameFrom, end, draw);
            end.makeEnd();
            start.makeStart();
            return true;
        }

        for (let neighbor of current.neighbors) {
            const tempGScore = gScore.get(current) + 1;
            if (tempGScore < gScore.get(neighbor)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tempGScore);
                fScore.set(neighbor, tempGScore + heuristic(neighbor.getPos(), end.getPos()));
                
                if (!openSetHash.has(neighbor)) {
                    count++;
                    openSet.push([fScore.get(neighbor), count, neighbor]);
                    openSetHash.add(neighbor);
                    if (!neighbor.isEnd()) neighbor.makeOpen();
                }
            }
        }

        draw();
        if (!current.isStart()) current.makeClosed();
        
        // Add slight delay for visualization
        await new Promise(resolve => setTimeout(resolve, PATH_DELAY_MS));
    }
    return false;
}

function makeGrid() {
    const grid = [];
    for (let i = 0; i < ROWS; i++) {
        const row = [];
        for (let j = 0; j < ROWS; j++) {
            row.push(new Node(i, j));
        }
        grid.push(row);
    }
    return grid;
}

function drawGridLines(ctx) {
    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= ROWS; i++) {
        const offset = GRID_MARGIN + i * NODE_SIZE;
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(GRID_MARGIN, offset);
        ctx.lineTo(GRID_MARGIN + GRID_SIZE, offset);
        ctx.stroke();
        
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(offset, GRID_MARGIN);
        ctx.lineTo(offset, GRID_MARGIN + GRID_SIZE);
        ctx.stroke();
    }
}

function draw(ctx, grid) {
    // Clear canvas
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, WINDOW_SIZE, WINDOW_SIZE);
    
    // Draw nodes
    for (let row of grid) {
        for (let node of row) {
            node.draw(ctx);
        }
    }
    
    // Draw grid lines
    drawGridLines(ctx);
}

function getClickedPos(x, y) {
    if (x < GRID_MARGIN || x >= GRID_MARGIN + GRID_SIZE || 
        y < GRID_MARGIN || y >= GRID_MARGIN + GRID_SIZE) {
        return null;
    }
    const row = Math.floor((y - GRID_MARGIN) / NODE_SIZE);
    const col = Math.floor((x - GRID_MARGIN) / NODE_SIZE);
    return [row, col];
}

window.onload = function() {
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    
    controls.innerHTML = '<p>Left Click: Set Start/End/Barriers | Right Click: Erase | Space: Run Algorithm | C: Clear</p>';
    
    let grid = makeGrid();
    let start = null;
    let end = null;
    let mouseDown = false;
    let rightMouseDown = false;
    
    draw(ctx, grid);
    
    // Event listeners
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        if (e.button === 2) rightMouseDown = true;
        handleMouse(e);
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
        rightMouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) handleMouse(e);
    });
    
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && start && end) {
            for (let row of grid) {
                for (let node of row) {
                    node.updateNeighbors(grid);
                }
            }
            algorithm(() => draw(ctx, grid), grid, start, end);
        } else if (e.key === 'c' || e.key === 'C') {
            grid = makeGrid();
            start = null;
            end = null;
            draw(ctx, grid);
        }
    });
    
    function handleMouse(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const clicked = getClickedPos(x, y);
        
        if (!clicked) return;
        const [row, col] = clicked;
        const node = grid[row][col];
        
        if (rightMouseDown) {
            node.reset();
            if (node === start) start = null;
            if (node === end) end = null;
        } else if (mouseDown) {
            if (!start && node !== end) {
                start = node;
                start.makeStart();
            } else if (!end && node !== start) {
                end = node;
                end.makeEnd();
            } else if (node !== start && node !== end) {
                node.makeBarrier();
            }
        }
        
        draw(ctx, grid);
    }
};
