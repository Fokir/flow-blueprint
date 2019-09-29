import { EventEmitter } from 'eventemitter3';
import { PinDraw } from './PinDraw';
import { Block } from "../Block";
import { PinDirection } from '../PinDirection';
import { FlowPin } from '../pins';

interface IBlockDrawEvents {
    select: [BlockDraw],
    dragstart: [BlockDraw],
    selectPin: [PinDraw],
    enterPin: [PinDraw],
    leavePin: [PinDraw],
    update: [PinDraw]
}

export class BlockDraw extends EventEmitter<IBlockDrawEvents> {

    pins: PinDraw[] = [];

    container = document.createElement('div');
    private headerElement = document.createElement('div');
    private pinsElement = document.createElement('div');
    private inputsElement = document.createElement('div');
    private outputsElement = document.createElement('div');

    blockHeight = 0;
    blockWidth = 0;

    get clientRect() {
        return this.container.getBoundingClientRect();
    }

    get position() {
        return this.block.position;
    }

    constructor(public block: Block) {
        super();
        this.container.appendChild(this.headerElement);
        this.container.appendChild(this.pinsElement);
        this.pinsElement.appendChild(this.inputsElement);
        this.pinsElement.appendChild(this.outputsElement);

        this.container.classList.add('flow-blueprint__block');
        this.headerElement.classList.add('flow-blueprint__header');
        this.pinsElement.classList.add('flow-blueprint__pins');
        this.inputsElement.classList.add('flow-blueprint__inputs');
        this.outputsElement.classList.add('flow-blueprint__outputs');

        const pins = this.block.entriesPins().map(([name, pin]) => pin);

        const existFlow = pins.some(pin => pin instanceof FlowPin);
        const singlePinsType = pins.every(pin => pin instanceof (pins[0] as any).constructor);
        const isOnlyOneInputAndOutput = pins.length === 2 && pins[0].direction !== pins[1].direction;
        const onlyOutput = pins.every(pin => pin.direction === PinDirection.output);

        if (onlyOutput && existFlow) {
            this.headerElement.style.backgroundColor = '#de3232';
        } else if (existFlow) {
            this.headerElement.style.backgroundColor = '#929292';
        } else if (singlePinsType) {
            this.headerElement.style.backgroundColor = pins[0].color;
        } else if (isOnlyOneInputAndOutput) {
            this.headerElement.style.backgroundImage =
                `linear-gradient(to right, ${pins[0].color} 0%, ${pins[1].color} 100%)`;
        }

        pins.forEach(pin => {
            const pinDraw = new PinDraw(pin);
            this.pins.push(pinDraw);
            if (pin.direction === PinDirection.input) {
                this.inputsElement.appendChild(pinDraw.container);
            } else {
                this.outputsElement.appendChild(pinDraw.container);
            }

            pinDraw.on('selectPin', pin => this.emit('selectPin', pin));
            pinDraw.on('enterPin', pin => this.emit('enterPin', pin));
            pinDraw.on('leavePin', pin => this.emit('leavePin', pin));
            pinDraw.on('update', pin => this.emit('update', pin));
        });

        this.headerElement.addEventListener('mousedown', e => {
            if (e.which === 1) {
                this.emit('dragstart', this);
            }
        });

        this.headerElement.addEventListener('click', e => {
            this.emit('select', this);
        });

        this.container['__instance'] = this;
    }

    update() {
        this.headerElement.innerHTML = this.block.title;
        this.container.style.left = `${this.block.position.x}px`;
        this.container.style.top = `${this.block.position.y}px`;

        const bound = this.clientRect;
        this.blockWidth = bound.width;
        this.blockHeight = bound.height;
    }

    destroy() {
        this.container.parentElement.removeChild(this.container);
        this.removeAllListeners();
    }

    select() {
        this.container.classList.add('active');
    }

    unselect() {
        this.container.classList.remove('active');
    }
}