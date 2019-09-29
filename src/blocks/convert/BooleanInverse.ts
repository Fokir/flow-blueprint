import { Block } from "../../Block";
import { PinDirection } from "../../PinDirection";
import { BooleanPin } from "../../pins";

export class BooleanInverseBlock extends Block {

    static group = 'Convert';

    pins = {
        input: new BooleanPin(PinDirection.input, 'in'),
        output: new BooleanPin(PinDirection.output, 'out'),
    }

    constructor(id?: string) {
        super('Invert boolean', id);
        this.pins.output.handler = () => !this.pins.input.value;
    }
}