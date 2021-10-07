/**
 * Live game statistics
 * Updating html
 */
export class Stats {
    private level;
    static time;
    private apm;
    private lines;
    private score;
    private puzzles; // number of puzzles created on current level

    private actions;

    static el = {
        "level": document.getElementById("tetris-stats-level"),
        "time": document.getElementById("tetris-stats-time"),
        "apm": document.getElementById("tetris-stats-apm"),
        "lines": document.getElementById("tetris-stats-lines"),
        "score": document.getElementById("tetris-stats-score")
    }

    public timerId = null;

    start() {
        this.reset();
        this.timerId = setInterval(this.incTime, 1000);
    };

    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    };

    reset() {
        this.stop();
        this.level = 1;
        Stats.time = 0;
        this.apm = 0;
        this.lines = 0;
        this.score = 0;
        this.puzzles = 0;
        this.actions = 0;
        Stats.el.level.innerHTML = this.level;
        Stats.el.time.innerHTML = Stats.time;
        Stats.el.apm.innerHTML = this.apm;
        Stats.el.lines.innerHTML = this.lines;
        Stats.el.score.innerHTML = this.score;
    };

    incTime() {
        Stats.time++;
        Stats.el.time.innerHTML = Stats.time;
        this.apm = (this.actions / Stats.time) * 60;
        Stats.el.apm.innerHTML = this.apm;
    };

    setScore(score: number) {
        this.score = score;
        Stats.el.score.innerHTML = this.score;
    };

    setLevel(level: number) {
        this.level = level;
        Stats.el.level.innerHTML = this.level;
    };

    setLines(i) {
        this.lines = i;
        Stats.el.lines.innerHTML = this.lines;
    };

    setPuzzles(i) {
        this.puzzles = i;
    };

    setActions(i) {
        this.actions = i;
    };

    getScore() {
        return this.score;
    };

    getLevel() {
        return this.level;
    };

    getLines() {
        return this.lines;
    };

    getPuzzles() {
        return this.puzzles;
    };

    getActions() {
        return this.actions;
    };
}