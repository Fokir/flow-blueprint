import { Block } from '../../Block';
import { FlowPin } from '../../pins/FlowPin';
import { PinDirection } from '../../PinDirection';
import { StringPin } from './../../pins/StringPin';

export class OnMessageEventBlock extends Block {

    static group = 'Events';

    pins = {
        flow: new FlowPin(PinDirection.output, 'output'),
        message: new StringPin(PinDirection.output, 'message')
    };

    constructor(id?: string) {
        super('On message event', id);
    }

    execute() {
        this.pins.flow.value();
    }

    setMessage(message: string) {
        this.pins.message.setValue(message);
    }
}