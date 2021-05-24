import { Keyboard, Key } from './keyboard.js';
import { Stats } from './stats.js';
import { Area } from './area.js';
import { Puzzle } from './puzzle.js';
import { TetrisWindow } from './tetris-window.js';
import { PlayerControls } from './controls.js';

export class Tetris {
    public readonly stats = new Stats();

    //TODO make these redonly
    private puzzle: Puzzle = null;
    private area = null;

    private readonly unit = 14; // unit = x pixels
    private readonly areaX = 12; // area width = x units
    private readonly areaY = 22; // area height = y units

    private paused = false;

    constructor(controls: PlayerControls) {
        // windows
        var helpwindow = new TetrisWindow("tetris-help");
        var highscores = new TetrisWindow("tetris-highscores");

        // game menu
        document.getElementById("tetris-menu-start").onclick = () => {
            helpwindow.close();
            highscores.close();
            this.start();
        };

        // document.getElementById("tetris-menu-reset").onclick = function() { helpwindow.close(); highscores.close(); this.reset();  };

        // document.getElementById("tetris-menu-pause").onclick = function () { this.pause();  };
        // document.getElementById("tetris-menu-resume").onclick = function () { this.pause();  };

        // help
        document.getElementById("tetris-menu-help").onclick = function () { highscores.close(); helpwindow.activate(); };
        document.getElementById("tetris-help-close").onclick = helpwindow.close;

        // highscores
        document.getElementById("tetris-menu-highscores").onclick = function () {
            helpwindow.close();
            // document.getElementById("tetris-highscores-content").innerHTML = this.highscores.toHtml();
            highscores.activate();

        };
        document.getElementById("tetris-highscores-close").onclick = highscores.close;


        this.bind(controls);
    }

    
    bind(controls: PlayerControls) {
        const keyboard = new Keyboard();
        keyboard.set(Key.n, () => this.start());
        keyboard.set(Key.p, () => this.pause());
        keyboard.set(controls.turn, () => this.up());
        keyboard.set(controls.down, () => this.down());
        keyboard.set(controls.left, () => this.left());
        keyboard.set(controls.right, () => this.right());
        keyboard.set(controls.forceDown, () => this.space());
    }

    start() {
        if (this.puzzle && !confirm('Are you sure you want to start a new game ?')) return;
        this.reset();
        this.stats.start();
        document.getElementById("tetris-nextpuzzle").style.display = "block";
        document.getElementById("tetris-keys").style.display = "none";
        this.area = new Area(this.unit, this.areaX, this.areaY, "tetris-area");
        this.puzzle = new Puzzle(this, this.area);
        if (this.puzzle.mayPlace()) {
            this.puzzle.place();
        } else {
            this.gameOver();
        }
    };

    reset() {
        if (this.puzzle) {
            this.puzzle.destroy();
            this.puzzle = null;
        }
        if (this.area) {
            this.area.destroy();
            this.area = null;
        }
        document.getElementById("tetris-gameover").style.display = "none";
        document.getElementById("tetris-nextpuzzle").style.display = "none";
        document.getElementById("tetris-keys").style.display = "block";
        this.stats.reset();
        this.paused = false;
        document.getElementById('tetris-pause').style.display = 'block';
        document.getElementById('tetris-resume').style.display = 'none';
    };

    pause() {
        if (this.puzzle == null) return;
        if (this.paused) {
            this.puzzle.running = true;
            this.puzzle.fallDownID = setTimeout(this.puzzle.fallDown, this.puzzle.speed);
            document.getElementById('tetris-pause').style.display = 'block';
            document.getElementById('tetris-resume').style.display = 'none';
            this.stats.timerId = setInterval(this.stats.incTime, 1000);
            this.paused = false;
        } else {
            if (!this.puzzle.isRunning()) return;
            if (this.puzzle.fallDownID) clearTimeout(this.puzzle.fallDownID);
            document.getElementById('tetris-pause').style.display = 'none';
            document.getElementById('tetris-resume').style.display = 'block';
            clearTimeout(this.stats.timerId);
            this.paused = true;
            this.puzzle.running = false;
        }
    };

    gameOver() {
        this.stats.stop();
        this.puzzle.stop();
        document.getElementById("tetris-nextpuzzle").style.display = "none";
        document.getElementById("tetris-gameover").style.display = "block";
    };

    up() {
        if (this.puzzle && this.puzzle.isRunning() && !this.puzzle.isStopped()) {
            if (this.puzzle.mayRotate()) {
                this.puzzle.rotate();
                this.stats.setActions(this.stats.getActions() + 1);
            }
        }
    };

    down() {
        if (this.puzzle && this.puzzle.isRunning() && !this.puzzle.isStopped()) {
            if (this.puzzle.mayMoveDown()) {
                this.stats.setScore(this.stats.getScore() + 5 + this.stats.getLevel());
                this.puzzle.moveDown();
                this.stats.setActions(this.stats.getActions() + 1);
            }
        }
    };

    left() {
        if (this.puzzle && this.puzzle.isRunning() && !this.puzzle.isStopped()) {
            if (this.puzzle.mayMoveLeft()) {
                this.puzzle.moveLeft();
                this.stats.setActions(this.stats.getActions() + 1);
            }
        }
    };

    right() {
        if (this.puzzle && this.puzzle.isRunning() && !this.puzzle.isStopped()) {
            if (this.puzzle.mayMoveRight()) {
                this.puzzle.moveRight();
                this.stats.setActions(this.stats.getActions() + 1);
            }
        }
    };

    space() {
        if (this.puzzle && this.puzzle.isRunning() && !this.puzzle.isStopped()) {
            this.puzzle.stop();
            this.puzzle.forceMoveDown();
        }
    };
}