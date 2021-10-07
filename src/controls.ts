import { Key } from "./keyboard.js";

export interface PlayerControls {
    left: Key;
    right: Key;
    down: Key;
    turn: Key;
    forceDown: Key;
    store: Key;
}

interface Controls {
    player1: PlayerControls;
    player2: PlayerControls;
}

export const controls: Controls = {
    "player1": {
        "left": Key.left,
        "right": Key.right,
        "down": Key.down,
        "turn": Key.up,
        "forceDown": Key.space,
        "store": Key.c
    },
    "player2": {
        "left": Key.left,
        "right": Key.right,
        "down": Key.down,
        "turn": Key.up,
        "forceDown": Key.space,
        "store": Key.c
    }
}