import { Area } from "./area.js";
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

    // timeout ids
    private fallDownID = null;
    private forceMoveDownID = null;

    private type = null; // 0..6
    private position = null; // 0..3
    private speed = null;
    private running = null;
    private stopped = null;

    private board = []; // filled with html elements after placing on area
    private elements = [];
    private nextElements = []; // next board elements

    // (x,y) position of the puzzle (top-left)
    private x = null;
    private y = null;

    // width & height must be the same
    private puzzles = [
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [1, 1],
            [1, 1]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    ];

    /**
     * Reset puzzle. It does not destroy html elements in this.board.
     * @return void
     * @access public
     */
    reset() {
        if (this.fallDownID) {
            clearTimeout(this.fallDownID);
        }
        if (this.forceMoveDownID) {
            clearTimeout(this.forceMoveDownID);
        }
        this.type = this.nextType;
        this.nextType = random(this.puzzles.length);
        this.position = 0;
        this.speed = 80 + (700 / this.tetris.stats.getLevel());
        this.running = false;
        this.stopped = false;
        this.board = [];
        this.elements = [];
        for (var i = 0; i < this.nextElements.length; i++) {
            document.getElementById("tetris-nextpuzzle").removeChild(this.nextElements[i]);
        }
        this.nextElements = [];
        this.x = null;
        this.y = null;
    };

    /**
     * Check whether puzzle is running.
     * @return bool
     * @access public
     */
    isRunning() {
        return this.running;
    };

    /**
     * Check whether puzzle has been stopped by user. It happens when user clicks
     * "down" when puzzle is already at the bottom of area. The puzzle may still
     * be running with event fallDown(). When puzzle is stopped, no actions will be
     * performed when user press a key.
     * @return bool
     * @access public
     */
    isStopped() {
        return this.stopped;
    };

    /**
     * Get X position of puzzle (top-left)
     * @return int
     * @access public
     */
    getX() {
        return this.x;
    };

    /**
     * Get Y position of puzzle (top-left)
     * @return int
     * @access public
     */
    getY() {
        return this.y;
    };

    /**
     * Check whether new puzzle may be placed on the area.
     * Find (x,y) in area where beginning of the puzzle will be placed.
     * Check if first puzzle line (checking from the bottom) can be placed on the area.
     * @return bool
     * @access public
     */
    mayPlace() {
        var puzzle = this.puzzles[this.type];
        var areaStartX = ((this.area.x - puzzle[0].length) / 2) | 0;
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
        var areaStartX = ((this.area.x - puzzle[0].length) / 2) | 0;
        var areaStartY = 1;
        
        var lineFound = false;
        var lines = 0;
        this.x = areaStartX;
        this.y = 1;
        this.board = this.createEmptyPuzzle(puzzle.length, puzzle[0].length);
        // create puzzle
        for (var y = puzzle.length - 1; y >= 0; y--) {
            for (var x = 0; x < puzzle[y].length; x++) {
                if (puzzle[y][x]) {
                    lineFound = true;
                    var el = document.createElement("div");
                    el.className = "block" + this.type;
                    el.style.left = (areaStartX + x) * this.area.unit + "px";
                    el.style.top = (areaStartY - lines) * this.area.unit + "px";
                    this.area.el.appendChild(el);
                    this.board[y][x] = el;
                    this.elements.push(el);
                }
            }
            if (lines) {
                this.y--;
            }
            if (lineFound) {
                lines++;
            }
        }
        this.running = true;        
        this.fallDownID = setTimeout(() => this.fallDown(), this.speed);
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
    };

    /**
     * Remove puzzle from the area.
     * Clean some other stuff, see reset()
     * @return void
     * @access public
     */
    destroy() {
        for (var i = 0; i < this.elements.length; i++) {
            this.area.el.removeChild(this.elements[i]);
        }
        this.elements = [];
        this.board = [];
        this.reset();
    };

    /**
     * @param int y
     * @param int x
     * @return array
     * @access private
     */
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

    /**
     * Puzzle fall from the top to the bottom.
     * After placing a puzzle, this event will be called as long as the puzzle is running.
     * @see place() stop()
     * @return void
     * @access event
     */
    fallDown() {
        if (this.isRunning()) {
            if (this.mayMoveDown()) {
                this.moveDown();
                this.fallDownID = setTimeout(() => this.fallDown(), this.speed);
            } else {
                // move blocks into area board
                for (var i = 0; i < this.elements.length; i++) {
                    this.area.addElement(this.elements[i]);
                }
                // stats
                var lines = this.area.removeFullLines();
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
        }
    };

    /**
     * After clicking "space" the puzzle is forced to move down, no user action is performed after
     * this event is called. this.running must be set to false. This func is similiar to fallDown()
     * Also update score & actions - like Tetris.down()
     * @see fallDown()
     * @return void
     * @access public event
     */
    forceMoveDown() {
        if (!this.isRunning() && !this.isStopped()) {
            if (this.mayMoveDown()) {
                // stats: score, actions
                this.tetris.stats.setScore(this.tetris.stats.getScore() + 5 + this.tetris.stats.getLevel());
                this.tetris.stats.setActions(this.tetris.stats.getActions() + 1);
                this.moveDown();
                this.forceMoveDownID = setTimeout(() => this.forceMoveDown(), 30);
            } else {
                // move blocks into area board
                for (var i = 0; i < this.elements.length; i++) {
                    this.area.addElement(this.elements[i]);
                }
                // stats: lines
                var lines = this.area.removeFullLines();
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
        }
    };

    /**
     * Stop the puzzle falling
     * @return void
     * @access public
     */
    stop() {
        this.running = false;
    };

    /**
     * Check whether puzzle may be rotated.
     * Check down, left, right, rotate
     * @return bool
     * @access public
     */
    mayRotate() {
        for (var y = 0; y < this.board.length; y++) {
            for (var x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x]) {
                    var newY = this.getY() + this.board.length - 1 - x;
                    var newX = this.getX() + y;
                    if (newY >= this.area.y) { return false; }
                    if (newX < 0) { return false; }
                    if (newX >= this.area.x) { return false; }
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
        var puzzle = this.createEmptyPuzzle(this.board.length, this.board[0].length);
        for (var y = 0; y < this.board.length; y++) {
            for (var x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x]) {
                    var newY = puzzle.length - 1 - x;
                    var newX = y;
                    var el = this.board[y][x];
                    var moveY = newY - y;
                    var moveX = newX - x;
                    el.style.left = el.offsetLeft + (moveX * this.area.unit) + "px";
                    el.style.top = el.offsetTop + (moveY * this.area.unit) + "px";
                    puzzle[newY][newX] = el;
                }
            }
        }
        this.board = puzzle;
    };

    /**
     * Check whether puzzle may be moved down.
     * - is any other puzzle on the way ?
     * - is it end of the area ?
     * If false, then true is assigned to variable this.stopped - no user actions will be performed to this puzzle,
     * so this func should be used carefully, only in Tetris.down() and Tetris.puzzle.fallDown()
     * @return bool
     * @access public
     */
    mayMoveDown() {
        for (var y = 0; y < this.board.length; y++) {
            for (var x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x]) {
                    if (this.getY() + y + 1 >= this.area.y) { this.stopped = true; return false; }
                    if (this.area.getBlock(this.getY() + y + 1, this.getX() + x)) { this.stopped = true; return false; }
                }
            }
        }
        return true;
    };

    /**
     * Move the puzzle down by 1 unit.
     * @return void
     * @access public
     */
    moveDown() {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].style.top = this.elements[i].offsetTop + this.area.unit + "px";
        }
        this.y++;
    };

    /**
     * Check whether puzzle may be moved left.
     * - is any other puzzle on the way ?
     * - is the end of the area
     * @return bool
     * @access public
     */
    mayMoveLeft() {
        for (var y = 0; y < this.board.length; y++) {
            for (var x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x]) {
                    if (this.getX() + x - 1 < 0) { return false; }
                    if (this.area.getBlock(this.getY() + y, this.getX() + x - 1)) { return false; }
                }
            }
        }
        return true;
    };

    /**
     * Move the puzzle left by 1 unit
     * @return void
     * @access public
     */
    moveLeft() {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].style.left = this.elements[i].offsetLeft - this.area.unit + "px";
        }
        this.x--;
    };

    /**
     * Check whether puzle may be moved right.
     * - is any other puzzle on the way ?
     * - is the end of the area
     * @return bool
     * @access public
     */
    mayMoveRight() {
        for (var y = 0; y < this.board.length; y++) {
            for (var x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x]) {
                    if (this.getX() + x + 1 >= this.area.x) { return false; }
                    if (this.area.getBlock(this.getY() + y, this.getX() + x + 1)) { return false; }
                }
            }
        }
        return true;
    };

    /**
     * Move the puzzle right by 1 unit.
     * @return void
     * @access public
     */
    moveRight() {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].style.left = this.elements[i].offsetLeft + this.area.unit + "px";
        }
        this.x++;
    };
}

/**
 * Generates random number that is >= 0 and < i
 * @return int
 * @access private
 */
function random(i) {
    return Math.floor(Math.random() * i);
}