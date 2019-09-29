import { Block } from "../../Block";
import { FlowPin, BooleanPin } from "../../pins";
import { PinDirection } from "../../PinDirection";

export class SequenceIfBlock extends Block {

    static group = 'Sequence';

    pins = {
        input: new FlowPin(PinDirection.input, 'in'),
        condition: new BooleanPin(PinDirection.input, 'condition'),
        true: new FlowPin(PinDirection.output, 'true'),
        false: new FlowPin(PinDirection.output, 'false'),
    }

    constructor(id?: string) {
        super('Sequence if', id);
    }

    execute() {
        if (this.pins.condition.value) {
            this.pins.true.value();
        } else {
            this.pins.false.value();
        }
    }
}
