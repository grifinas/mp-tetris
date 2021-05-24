/**
 * Area consists of blocks (2 dimensional board).
 * Block contains "0" (if empty) or Html Object.
 * @param int x
 * @param int y
 * @param string id
 */
export class Area {
    private readonly el;
    private readonly board = [];

    constructor(public readonly unit: number, public readonly x: number, public readonly y: number, private readonly id) {
        this.el = document.getElementById(id);

        // create 2-dimensional board
        for (let y = 0; y < this.y; y++) {
            this.board.push(new Array());
            for (let x = 0; x < this.x; x++) {
                this.board[y].push(0);
            }
        }
    }

    /**
     * Removing html elements from area.
     * @return void
     * @access public
     */
    destroy() {
        for (var y = 0; y < this.board.length; y++) {
            for (var x = 0; x < this.board[y].length; x++) {
                if (this.board[y][x]) {
                    this.el.removeChild(this.board[y][x]);
                    this.board[y][x] = 0;
                }
            }
        }
    };

    /**
     * Searching for full lines.
     * Must go from the bottom of area to the top.
     * Returns the number of lines removed - needed for Stats.score.
     * @see isLineFull() removeLine()
     * @return void
     * @access public
     */
    removeFullLines() {
        var lines = 0;
        for (var y = this.y - 1; y > 0; y--) {
            if (this.isLineFull(y)) {
                this.removeLine(y);
                lines++;
                y++;
            }
        }
        return lines;
    };

    /**
     * @param int y
     * @return bool
     * @access public
     */
    isLineFull(y) {
        for (var x = 0; x < this.x; x++) {
            if (!this.board[y][x]) { return false; }
        }
        return true;
    };

    /**
     * Remove given line
     * Remove html objects
     * All lines that are above given line move down by 1 unit
     * @param int y
     * @return void
     * @access public
     */
    removeLine(y) {
        for (var x = 0; x < this.x; x++) {
            this.el.removeChild(this.board[y][x]);
            this.board[y][x] = 0;
        }
        y--;
        for (; y > 0; y--) {
            for (var x = 0; x < this.x; x++) {
                if (this.board[y][x]) {
                    var el = this.board[y][x];
                    el.style.top = el.offsetTop + this.unit + "px";
                    this.board[y + 1][x] = el;
                    this.board[y][x] = 0;
                }
            }
        }
    };

    /**
     * @param int y
     * @param int x
     * @return mixed 0 or Html Object
     * @access public
     */
    getBlock(y: number, x: number) {
        if (y < 0) { return 0; }
        if (y < this.y && x < this.x) {
            return this.board[y | 0][x | 0];
        } else {
            throw new Error(`Area.getBlock(${y}, ${x}) failed, ${this.y}, ${this.x}`);
        }
    };

    /**
     * Add Html Element to the area.
     * Find (x,y) position using offsetTop and offsetLeft
     * @param object el
     * @return void
     * @access public
     */
    addElement(el) {
        var x = el.offsetLeft / this.unit;
        var y = el.offsetTop / this.unit;
        if (y >= 0 && y < this.y && x >= 0 && x < this.x) {
            this.board[y][x] = el;
        } else {
            // not always an error ..
        }
    };
}