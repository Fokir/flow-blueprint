import { Pin } from "../Pin";
import { PinDirection } from "../PinDirection";

export class BooleanPin extends Pin<boolean> {

    color = '#ff4c4c';

    constructor(direction: PinDirection, title: string, id?: string) {
        super(direction, title, id);
    }
}