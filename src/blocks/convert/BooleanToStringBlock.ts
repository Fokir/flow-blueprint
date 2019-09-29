import { Block } from "../../Block";
import { PinDirection } from "../../PinDirection";
import { StringPin } from "../../pins/StringPin";
import { BooleanPin } from "../../pins";

export class BooleanToStringBlock extends Block {

    static group = 'Convert';

    pins = {
        input: new BooleanPin(PinDirection.input, 'in'),
        output: new StringPin(PinDirection.output, 'out'),
    }

    constructor(id?: string) {
        super('Boolean to string', id);
        this.pins.output.handler = () => `${this.pins.input.value ? 'true' : 'false'}`;
    }
}