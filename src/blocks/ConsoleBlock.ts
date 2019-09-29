import { PinDirection } from '../PinDirection';
import { Block } from "../Block";
import { FlowPin } from '../pins/FlowPin';
import { StringPin } from './../pins/StringPin';

export class ConsoleBlock extends Block {

    pins = {
        flow_input: new FlowPin(PinDirection.input, 'in'),
        string_input: new StringPin(PinDirection.input, 'message'),
        flow_output: new FlowPin(PinDirection.output, 'out'),
    }

    constructor(id?: string) {
        super('Debug log', id);
    }

    execute() {
        console.log(this.pins.string_input.value);
        this.pins.flow_output.value();
    }
}