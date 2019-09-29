import { Block } from "../../Block";
import { FlowPin } from "../../pins";
import { PinDirection } from "../../PinDirection";

export class SequenceSeparationBlock extends Block {

    static group = 'Sequence';
    
    pins = {
        input: new FlowPin(PinDirection.input, 'in'),
        output1: new FlowPin(PinDirection.output, 'out 1'),
        output2: new FlowPin(PinDirection.output, 'out 2'),
        output3: new FlowPin(PinDirection.output, 'out 3'),
    }

    constructor(id?: string) {
        super('Sequence separation', id);
    }

    execute() {        
        this.pins.output1.value();
        this.pins.output2.value();
        this.pins.output3.value();
    }
}
