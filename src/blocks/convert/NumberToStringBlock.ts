import { Block } from "../../Block";
import { NumberPin } from "../../pins/NumberPin";
import { PinDirection } from "../../PinDirection";
import { StringPin } from "../../pins/StringPin";

export class NumberToStringBlock extends Block {

    static group = 'Convert';

    pins = {
        input: new NumberPin(PinDirection.input, 'in'),
        output: new StringPin(PinDirection.output, 'out'),
    }

    constructor(id?: string) {
        super('Number to string', id);
        this.pins.output.handler = () => `${this.pins.input.value}`;
    }
}