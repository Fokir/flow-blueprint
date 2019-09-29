import { StringPin } from './../pins/StringPin';
import { PinDirection } from '../PinDirection';
import { Block } from "../Block";
import { NumberPin } from "../pins/NumberPin";

export class StringBlock extends Block {

    static group = 'Constants';

    pins = {
        output: new StringPin(PinDirection.output, 'output'),
    }

    constructor(id?: string) {
        super('String', id);

        this.pins.output.isCanWriteValue = true;
        this.pins.output.handler = () => this.pins.output.static_value || '';
    }
}