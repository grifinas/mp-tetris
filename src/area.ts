import { COLUMNS, DEBUG, pos, ROWS } from './config.js';

/**
 * Area consists of blocks (2 dimensional board).
 * Block contains "0" (if empty) or Html Object.
 * @param int x
 * @param int y
 * @param string id
 */
export class Area {
    private readonly el;
    private board: number[] = [];
    private readonly visualBoard = [];

    constructor(public readonly unit: number, id: string) {
        this.el = document.getElementById(id);

        this.board = new Array(COLUMNS * ROWS).fill(0);
        this.visualBoard = this.board.map((_, i) => {
            const el = document.createElement("div");
            el.className = "block block0";
            if (DEBUG.showBlockNumbers) {
                el.innerHTML = `${i}`;
            } else if (DEBUG.showBlockY) {
                el.innerHTML = `${(i / COLUMNS) | 0}`;
            }
            this.el.appendChild(el);
            return el;
        });
    }

    rerender() {
        this.board.forEach((value, index) => {
            this.visualBoard[index].className = `block block${Math.abs(value)}`;
        });
    }

    removeFromBoard(xOffset: number, yOffset: number, structure: number[][]): void {
        structure.forEach((row, y) => row.forEach((value, x) => {
            value && this.setAt(pos(x + xOffset, y + yOffset), 0)
        }))
    }

    setOnBoard(xOffset: number, yOffset: number, structure: number[][]): void {
        structure.forEach((row, y) => row.forEach((value, x) => {
            value && this.setAt(pos(x + xOffset, y + yOffset), value)
        }))
    }

    movingPuzzle(xOffset: number, yOffset: number, structure: number[][], realNumber?: number): void {
        const movingStructure = structure.map(row => row.map(number => number && realNumber || -number));

        this.setOnBoard(xOffset, yOffset, movingStructure);
    }

    removeFullRows() {
        var lines = 0;
        for (let y = 0; y > ROWS; y++) {
            if (this.isRowFull(y)) {
                this.removeRow(y);
                lines++;
                y--;
            }
        }
        return lines;
    };

    getBoard() {
        return this.board;
    }

    getBlock(y: number, x: number): boolean {
        if (y < 0) { return false; }
        if (y < ROWS && x < COLUMNS) {
            return this.board[pos(x, y)] > 0;
        } else {
            throw new Error(`Area.getBlock(${y}, ${x})`);
        }
    };

    getColumn(x: number) {
        if (x < 0) { return []; }
        if (x < COLUMNS) {
            return this.board.filter((value, i) => {
                return i % COLUMNS === x;
            });
        } else {
            throw new Error(`Area.getColumn(${x})`);
        }
    }

    // mayMoveDown() {
    //     for (var y = 0; y < this.puzzle.length; y++) {
    //         for (var x = 0; x < this.puzzle[y].length; x++) {
    //             if (this.puzzle[y][x]) {
    //                 if (this.getY() + y + 1 >= ROWS) {
    //                     this.stopped = true;
    //                     return false;
    //                 }
    //                 if (this.area.getBlock(this.getY() + y + 1, this.getX() + x)) {
    //                     this.stopped = true;
    //                     return false;
    //                 }
    //             }
    //         }
    //     }
    //     return true;
    // };

    getLowestViablePosition(xOffset, structure: number[][]) {
        let lowestPoint = ROWS;
        const skipedColumns = {};

        for (let y = structure.length - 1; y >= 0; y--) {
            for (let x = 0; x < structure[y].length; x++) {
                if (skipedColumns[x]) {
                    continue;
                }
                
                if (structure[y][x]) {
                    skipedColumns[x] = true;
                    
                    let lastFreePoint = 0;
                    const column = this.getColumn(xOffset + x);

                    for (; lastFreePoint < column.length - 1; lastFreePoint++) {
                        if (column[lastFreePoint] > 0) {
                            lastFreePoint -= 1;
                            break;
                        }
                    }
                    lastFreePoint -= y ;
                    lowestPoint = lowestPoint > lastFreePoint ? lastFreePoint : lowestPoint;
                }
            }
        }

        return lowestPoint;
    }

    private isRowFull(y: number) {
        for (var x = 0; x < COLUMNS; x++) {
            if (!this.board[pos(x, y)]) { return false; }
        }
        return true;
    };

    private removeRow(y: number) {
        const emptyRow = new Array(COLUMNS).fill(0);
        this.board = this.board.splice(y * COLUMNS, y * COLUMNS + ROWS).concat(emptyRow);
    };

    private setAt(position: number, value: number): void {
        try {
            this.board[position] = value;
            this.visualBoard[position].className = `block block${Math.abs(value)}`;
        } catch (e) {
            if (value > 0) {
                console.trace('setAt', position, e)
            }
        }
    }
}