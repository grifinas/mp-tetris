export const COLUMNS = 12;
export const ROWS = 23;

export const DEBUG = {
    showBlockNumbers: false,
    showBlockY: true,
}

type XY = {x: number, y: number};

export function pos(pos: XY|number, y?: number): number {
    const realX = typeof pos === 'number' ? pos : pos.x;
    const realY = typeof pos === 'number' ? y : pos.y;
    return realX + realY * COLUMNS;
}

