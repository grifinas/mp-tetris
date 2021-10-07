import { Area } from "./area.js";
import { COLUMNS, pos, ROWS } from "./config.js";
import { Tetris } from "./tetris.js";

/**
 * Puzzle consists of blocks.
 * Each puzzle after rotating 4 times, returns to its primitive position.
 */
export class Puzzle {

    constructor(private readonly tetris: Tetris, private readonly area: Area) {
        this.nextType = random(this.puzzles.length);
        this.reset();
    }

    private nextType;

    private type = null; // 0..6
    private puzzle = [];
    private stopped = null;

    private elements = [];
    private nextElements = []; // next board elements

    // (x,y) position of the puzzle (top-left)
    private x = null;
    private y = null;
    private shadowY = null;

    // width & height must be the same
    private readonly puzzles = [
        [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0]
        ],
        [
            [4, 0, 0],
            [4, 4, 4],
            [0, 0, 0]
        ],
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ],
        [
            [0, 5, 0],
            [5, 5, 5],
            [0, 0, 0]
        ],
        [
            [6, 6],
            [6, 6]
        ],
        [
            [0, 0, 0, 0],
            [2, 2, 2, 2],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    ];

    reset() {
        this.type = this.nextType;
        this.puzzle = this.puzzles[this.type];
        this.nextType = random(this.puzzles.length);
        this.stopped = false;
        this.elements = [];
        for (var i = 0; i < this.nextElements.length; i++) {
            document.getElementById("tetris-nextpuzzle").removeChild(this.nextElements[i]);
        }
        this.nextElements = [];
        this.x = null;
        this.y = null;
    };

    isStopped() {
        return this.stopped;
    };

    mayPlace() {
        var puzzle = this.puzzles[this.type];
        var areaStartX = ((COLUMNS - puzzle[0].length) / 2) | 0;
        var areaStartY = 1;
        var lineFound = false;
        var lines = 0;
        for (var y = puzzle.length - 1; y >= 0; y--) {
            for (var x = 0; x < puzzle[y].length; x++) {
                if (puzzle[y][x]) {
                    lineFound = true;
                    if (this.area.getBlock(areaStartY, areaStartX + x)) { return false; }
                }
            }
            if (lineFound) {
                lines++;
            }
            if (areaStartY - lines < 0) {
                break;
            }
        }
        return true;
    };

    renderShadow() {
        // this.area.movingPuzzle(this.x, this.shadowY, this.puzzle, -99);
    }

    unRenderShadow() {
        // this.area.removeFromBoard(this.x, this.shadowY, this.puzzle);
    }

    /**
     * Create empty board, create blocks in area - html objects, update puzzle board.
     * Check puzzles on current level, increase level if needed.
     * @return void
     * @access public
     */
    place() {
        // stats
        this.tetris.stats.setPuzzles(this.tetris.stats.getPuzzles() + 1);
        if (this.tetris.stats.getPuzzles() >= (10 + this.tetris.stats.getLevel() * 2)) {
            this.tetris.stats.setLevel(this.tetris.stats.getLevel() + 1);
            this.tetris.stats.setPuzzles(0);
        }
        // init
        var puzzle = this.puzzles[this.type];
        this.x = ((COLUMNS - puzzle[0].length) / 2) | 0;
        this.y = -2;
        this.area.movingPuzzle(this.x, this.y, this.puzzle);
        // next puzzle
        var nextPuzzle = this.puzzles[this.nextType];
        for (var y = 0; y < nextPuzzle.length; y++) {
            for (var x = 0; x < nextPuzzle[y].length; x++) {
                if (nextPuzzle[y][x]) {
                    var el = document.createElement("div");
                    el.className = "block" + this.nextType;
                    el.style.left = (x * this.area.unit) + "px";
                    el.style.top = (y * this.area.unit) + "px";
                    document.getElementById("tetris-nextpuzzle").appendChild(el);
                    this.nextElements.push(el);
                }
            }
        }

        this.shadowY = this.area.getLowestViablePosition(this.x, this.puzzle);
        this.renderShadow();
    };

    destroy() {
        this.elements = [];
        this.puzzle = [];
        this.reset();
    };

    createEmptyPuzzle(y, x) {
        var puzzle = [];
        for (var y2 = 0; y2 < y; y2++) {
            puzzle.push(new Array());
            for (var x2 = 0; x2 < x; x2++) {
                puzzle[y2].push(0);
            }
        }
        return puzzle;
    };

    fallDown() {
        if (this.mayMoveDown()) {
            this.moveDown();
        } else {
            this.freeze();
        }
    };

    forceMoveDown() {
        if (!this.isStopped()) {
            this.transform(() => {
                this.y = this.shadowY;
            });
        }
    };

    stop() {
        this.stopped = true;
    };

    /**
     * Check whether puzzle may be rotated.
     * Check down, left, right, rotate
     * @return bool
     * @access public
     */
    mayRotate() {
        for (var y = 0; y < this.puzzle.length; y++) {
            for (var x = 0; x < this.puzzle[y].length; x++) {
                if (this.puzzle[y][x]) {
                    var newY = this.y + this.puzzle.length - 1 - x;
                    var newX = this.x + y;
                    if (newY >= ROWS) { return false; }
                    if (newX < 0) { return false; }
                    if (newX >= COLUMNS) { return false; }
                    if (this.area.getBlock(newY, newX)) { return false; }
                }
            }
        }
        return true;
    };

    /**
     * Rotate the puzzle to the left.
     * @return void
     * @access public
     */
    rotate() {
        this.transform(() => {
            const size = this.puzzle.length;
            for (let y = 0; y < size / 2; y++) {
                for (let x = y; x < size - y - 1; x++) {
                    let temp = this.puzzle[y][x];
                    this.puzzle[y][x] = this.puzzle[x][size - 1 - y];
                    this.puzzle[x][size - 1 - y]
                        = this.puzzle[size - 1 - y][size - 1 - x];
                    this.puzzle[size - 1 - y][size - 1 - x] = this.puzzle[size - 1 - x][y];
                    this.puzzle[size - 1 - x][y] = temp;
                }
            }
        });
    };

    mayMoveDown() {
        for (var y = 0; y < this.puzzle.length; y++) {
            for (var x = 0; x < this.puzzle[y].length; x++) {
                if (this.puzzle[y][x]) {
                    if (this.y + y + 1 >= ROWS) {
                        this.stopped = true;
                        return false;
                    }
                    if (this.area.getBlock(this.y + y + 1, this.x + x)) {
                        this.stopped = true;
                        return false;
                    }
                }
            }
        }
        return true;
    };

    moveDown() {
        this.transform(() => this.y++);
    };

    mayMoveLeft() {
        for (var y = 0; y < this.puzzle.length; y++) {
            for (var x = 0; x < this.puzzle[y].length; x++) {
                if (this.puzzle[y][x]) {
                    if (this.x + x - 1 < 0) { return false; }
                    if (this.area.getBlock(this.y + y, this.x + x - 1)) { return false; }
                }
            }
        }
        return true;
    };

    moveLeft() {
        this.transform(() => {
            this.x--;
            this.shadowY = this.area.getLowestViablePosition(this.x, this.puzzle);
        });
    };

    mayMoveRight() {
        for (var y = 0; y < this.puzzle.length; y++) {
            for (var x = 0; x < this.puzzle[y].length; x++) {
                if (this.puzzle[y][x]) {
                    if (this.x + x + 1 >= COLUMNS) { return false; }
                    if (this.area.getBlock(this.y + y, this.x + x + 1)) { return false; }
                }
            }
        }
        return true;
    };

    moveRight() {
        this.transform(() => {
            this.x++;
            this.shadowY = this.area.getLowestViablePosition(this.x, this.puzzle);
        });
    };

    public freeze() {
        this.unRenderShadow();
        this.area.setOnBoard(this.x, this.y, this.puzzle);
        // stats: lines
        var lines = this.area.removeFullRows();
        if (lines) {
            this.tetris.stats.setLines(this.tetris.stats.getLines() + lines);
            this.tetris.stats.setScore(this.tetris.stats.getScore() + (1000 * this.tetris.stats.getLevel() * lines));
        }
        // reset puzzle
        this.reset();
        if (this.mayPlace()) {
            this.place();
        } else {
            this.tetris.gameOver();
        }
    }

    private transform(action: Function) {
        this.unRenderShadow();
        this.area.removeFromBoard(this.x, this.y, this.puzzle);
        action();
        this.renderShadow();
        this.area.movingPuzzle(this.x, this.y, this.puzzle);
    }
}

/**
 * Generates random number that is >= 0 and < i
 * @return int
 * @access private
 */
function random(i) {
    return Math.floor(Math.random() * i);
}