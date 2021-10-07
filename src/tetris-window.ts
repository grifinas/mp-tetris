/**
 * Window replaces game area, for example help window
 * @param string id
 */
export class TetrisWindow {
    private readonly el;

    constructor(private readonly id) {
        this.el = document.getElementById(this.id);
    }

    activate() {
        this.el.style.display = (this.el.style.display == "block" ? "none" : "block");
    };

    close() {
        this.el.style.display = "none";
    };

    isActive() {
        return (this.el.style.display == "block");
    };
}