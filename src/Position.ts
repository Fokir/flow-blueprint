export class Position {
    constructor(public x: number, public y: number) {

    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    extend(position: Position) {
        this.x = position.x;
        this.y = position.y;
    }
}