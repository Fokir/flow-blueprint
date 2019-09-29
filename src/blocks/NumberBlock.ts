import { PinDirection } from '../PinDirection';
import { Block } from "../Block";
import { NumberPin } from "../pins/NumberPin";

export class NumberBlock extends Block {

    static group = 'Constants';

    pins = {
        output: new NumberPin(PinDirection.output, 'output'),
    }

    constructor(id?: string) {
        super('Number', id);

        this.pins.output.isCanWriteValue = true;
        this.pins.output.handler = () => this.pins.output.static_value || 0;
    }
}