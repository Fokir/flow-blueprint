import { PinDirection } from './../PinDirection';
import { Block } from "../Block";
import { NumberPin } from "../pins/NumberPin";

export class AddBlock extends Block {

    static group = 'Math'

    pins = {
        input_x: new NumberPin(PinDirection.input, 'x'),
        input_y: new NumberPin(PinDirection.input, 'y'),
        output: new NumberPin(PinDirection.output, 'output'),
    }

    constructor(id?: string) {
        super('Add', id);

        this.pins.output.handler = () => {
            return this.pins.input_x.value + this.pins.input_y.value;
        }
    }
}