import { Pin } from "../Pin";
import { PinDirection } from "../PinDirection";

export class FlowPin extends Pin<() => void> {

    // color = '#ffa04e';
    color = '#ffffff';

    get value() {
        if (this.direction === PinDirection.input) {
            return () => this.emit('request_execute', this);
        } else if (this.direction === PinDirection.output && this.connects.length > 0) {
            return this.connects[0].value;
        } else {
            return () => { };
        }
    }

    constructor(direction: PinDirection, title: string, id?: string) {
        super(direction, title, id);
    }

    connect(pin: FlowPin, ignoreNext = false) {
        if (!this.avaliableConnect(pin)) return;

        if (this.direction === PinDirection.output) {
            this.connects.forEach(p => {
                p.disconnect(this);
            });
            this.connects = [pin];
        } else {
            this.connects.push(pin);
        }

        if (!ignoreNext)
            pin.connect(this, true);

        pin.emit('update', this);
    }

    disconnect(pin: FlowPin) {
        if (this.direction === PinDirection.input) {
            this.connects.splice(this.connects.indexOf(pin), 1);
        } else {
            this.connects = [];
        }
        pin.emit('update', this);
    }

    setValue() {
        // Ignore update value
    }
}