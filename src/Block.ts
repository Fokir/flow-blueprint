import { EventEmitter } from 'eventemitter3';
import * as uuid from 'uuid/v4';
import { Pin } from './Pin';
import { Position } from './Position';
import { FlowPin } from './pins/FlowPin';
import { IBlock, IPin } from './JSON';
import { FlowBlueprint } from './FlowBlueprint';

interface BlockEvents {

}

export abstract class Block extends EventEmitter<BlockEvents> {

    static group: string;

    abstract pins: { [name: string]: Pin<any> } = {};

    position = new Position(0, 0);

    constructor(public title: string, public id: string = uuid()) {
        super();
    }

    initPins() {
        this.entriesPins().forEach(([key, pin]) => {
            if (pin instanceof FlowPin) {
                pin.on('request_execute', () => {
                    this.execute();
                });
            }

            pin.on('can_connect', data => {
                const pins = this.entriesPins().map(([key, pin]) => pin);
                data.result = data.result && pins.indexOf(data.pin) === -1;
            })
        });
    }

    entriesPins() {
        return Object.entries(this.pins);
    }

    execute(): void {

    };

    disconnect() {
        this.entriesPins().forEach(([name, pin]) => {
            pin.disconnectAll();
        });
    }

    json(flow: FlowBlueprint): IBlock {
        const pins: { [name: string]: IPin } = Object.entries(this.pins).reduce((res, [name, pin]) => {
            res[name] = pin.json();
            return res;
        }, {});
        const instance = this as any;

        return {
            id: this.id,
            pins: pins,
            position: { x: this.position.x, y: this.position.y },
            type: flow.blockName(instance.constructor)
        }
    }
}