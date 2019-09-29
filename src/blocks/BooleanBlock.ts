import { PinDirection } from '../PinDirection';
import { Block } from "../Block";
import { BooleanPin } from '../pins';

export class BooleanBlock extends Block {

    static group = 'Constants';

    pins = {
        output: new BooleanPin(PinDirection.output, 'output'),
    }

    constructor(id?: string) {
        super('Boolean', id);
        
        this.pins.output.isCanWriteValue = true;
        this.pins.output.handler = () => this.pins.output.static_value || false;
    }
}