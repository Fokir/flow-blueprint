import { Pin } from "../Pin";
import { PinDirection } from "../PinDirection";

export class StringPin extends Pin<string> {

    color = '#64ff81';

    constructor(direction: PinDirection, title: string, id?: string) {
        super(direction, title, id);
    }
}