import { Pin } from "../Pin";
import { PinDirection } from "../PinDirection";

export class NumberPin extends Pin<number> {

    color = '#647cff';

    constructor(direction: PinDirection, title: string, id?: string) {
        super(direction, title, id);
    }
}