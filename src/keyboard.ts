import { PlayerControls } from "./controls";

export enum Key {
    up = 38,
    down = 40,
    left = 37,
    right = 39,
    n = 78,
    p = 80,
    r = 82,
    c = 67,
    space = 32,
    f12 = 123,
    escape = 27,
}

/**
 * Assigning functions to keyboard events
 * When key is pressed, searching in a table if any function has been assigned to this key, execute the function.
 */
export class Keyboard {
    private readonly keys = [];
    private readonly funcs = [];

    constructor() {
        document.onkeydown = (e) => this.event(e);
    }

    set(key: Key, func: Function) {
        this.keys.push(key);
        this.funcs.push(func);
    };

    event(e) {
        if (!e) { e = window.event; }
        for (var i = 0; i < this.keys.length; i++) {
            if (e.keyCode == this.keys[i]) {
                this.funcs[i]();
            }
        }
    };
}