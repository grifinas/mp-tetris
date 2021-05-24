import { Tetris } from './tetris.js';
import { controls } from './controls.js'

function playTetris() {
    console.log('playing tetris');

    const t = new Tetris(controls.player1);
}

playTetris();
