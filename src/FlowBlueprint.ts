import { Block } from './Block';
import { EventEmitter } from 'eventemitter3';
import { IFlow } from './JSON';

import * as all_blocks from './blocks'
import { Pin } from './Pin';
import { PinDirection } from './PinDirection';

interface IFlowBlueprintEvents {
    add: [Block],
    remove: [Block]
}

export class FlowBlueprint extends EventEmitter<IFlowBlueprintEvents> {

    blocks: Block[] = [];

    blockNames = new Map<string, Type<Block>>();

    constructor() {
        super();
        Object.entries(all_blocks).forEach(([name, constructor]) => this.registerBlock(name, constructor));
    }

    registerBlock(name: string, block: Type<Block>) {
        if (this.blockNames.has(name)) {
            console.warn(`Block "${name}" is already registered in the system`)
        }
        this.blockNames.set(name, block);
    }

    blockName(block: Type<Block>) {
        for (const [key, value] of this.blockNames.entries()) {
            if (block === value) {
                return key;
            }
        }
    }

    json(): IFlow {
        return {
            blocks: this.blocks.map((block: Block) => block.json(this))
        };
    }

    add(block: Block) {
        const exist = this.blocks.indexOf(block) > -1;
        if (exist) {
            console.warn(`Block "${block.title}(${block.id})" already exist`);
            return false;
        }
        block.initPins();
        this.blocks.push(block);
        this.emit('add', block);
        return true;
    }

    remove(block: Block) {
        const index = this.blocks.indexOf(block);
        if (index === -1) {
            console.warn(`Block "${block.title}(${block.id})" already deleted`);
            return false;
        }
        this.blocks[index].disconnect();
        this.blocks.splice(index, 1);
        this.emit('remove', block);
        return true;
    }

    addScheme(flow: IFlow) {

        const blocks: Block[] = [];

        flow.blocks.forEach(blockFlow => {
            const type = this.blockNames.get(blockFlow.type);
            const block = new type(blockFlow);
            block.position.set(blockFlow.position.x, blockFlow.position.y);
            Object.entries(blockFlow.pins).forEach(([name, pinDraw]) => {
                block.pins[name].id = pinDraw.id;
            });
            blocks.push(block);
        });

        const pins: Map<string, Pin<any>> = new Map(
            [].concat
                .apply([], blocks.map(block => block.entriesPins().map(([name, pin]) => [pin.id, pin])))
        );

        flow.blocks.forEach(blockFlow => {
            Object.entries(blockFlow.pins).forEach(([name, pinFlow]) => {
                const pin = pins.get(pinFlow.id);
                if (pinFlow.connectsOutput.length > 0 && pin.direction === PinDirection.output) {
                    if (pin.isCanWriteValue) {
                        pin.setValue(pinFlow.value);
                    }
                    pinFlow.connectsOutput.forEach(id => {
                        const connected = pins.get(id);
                        pin.connect(connected);
                    })
                } else if (pinFlow.value) {
                    pin.setValue(pinFlow.value);
                }
            });
        });

        blocks.forEach(block => this.add(block));
    }
}