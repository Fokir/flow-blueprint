import { IPin } from './JSON';
import { PinDirection } from './PinDirection';
import { EventEmitter } from 'eventemitter3';
import * as uuid from 'uuid/v4';
import { FlowBlueprint } from './FlowBlueprint';

interface PinEvents {
    update: [Pin<any>],
    request_execute: [Pin<any>];
    can_connect: [{ result: boolean, pin: Pin<any> }]
}

export abstract class Pin<T> extends EventEmitter<PinEvents> {
    connects: Pin<T>[] = [];

    static_value: T;

    isCanWriteValue = false;

    handler: () => T;

    get value(): T {
        if (this.direction === PinDirection.input && this.connects.length > 0) {
            return this.connects[0].value;
        } else if (this.direction === PinDirection.input && this.connects.length > 0) {
            return this.static_value;
        } else if (this.handler && this.direction === PinDirection.output) {
            return this.handler();
        } else {
            return this.static_value;
        }
    }

    abstract color: string;

    constructor(public direction: PinDirection, public title: string, public id: string = uuid()) {
        super();
    }

    avaliableConnect(pin: Pin<T>) {
        const data = { result: true, pin: pin };
        this.emit('can_connect', data);
        return data.result && this.direction !== pin.direction && pin instanceof (this as any).constructor;
    }

    connect(pin: Pin<T>, ignoreNext = false) {
        if (!this.avaliableConnect(pin)) return;

        if (this.direction === PinDirection.input) {
            this.connects.forEach(p => {
                p.disconnect(this);
            });
            this.connects = [pin];
        } else {
            this.connects.push(pin);
        }

        if (!ignoreNext)
            pin.connect(this, true);

        this.emit('update', this);
    }

    disconnect(pin: Pin<T>) {
        if (this.direction === PinDirection.output) {
            this.connects.splice(this.connects.indexOf(pin), 1);
        } else {
            this.connects = [];
        }
        this.emit('update', this);
    }

    disconnectAll() {
        this.connects.forEach(p => {
            p.disconnect(this);
        });
        this.connects = [];
        this.emit('update', this);
    }

    setValue(value: T) {
        if (this.direction === PinDirection.input) {
            this.connects.forEach(p => {
                p.disconnect(this);
            });
        }

        this.static_value = value;
    }

    json(): IPin {
        return {
            id: this.id,
            connectsOutput: this.direction === PinDirection.output ? this.connects.map(pin => pin.id) : [],
            value: this.connects.length === 0 || this.direction === PinDirection.output ? this.static_value : undefined
        }
    }
}