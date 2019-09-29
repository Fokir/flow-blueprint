import { EventEmitter } from 'eventemitter3';
import { Pin } from './../Pin';
import { PinDirection } from '../PinDirection';
import { Position } from '../Position';
import { BooleanPin, NumberPin, StringPin } from '../pins';
import { autoWidthInputByValue } from '../helpers';

interface IPinDrawEvents {
    selectPin: [PinDraw],
    enterPin: [PinDraw]
    leavePin: [PinDraw],
    update: [PinDraw]
}

export class PinDraw extends EventEmitter<IPinDrawEvents> {

    container = document.createElement('div');
    private circle = document.createElement('div');
    private text = document.createElement('div');
    private controls = document.createElement('div');
    private enabledDefaultsControls = false;

    constructor(public pin: Pin<any>) {
        super();
        this.container.appendChild(this.circle);
        this.container.appendChild(this.controls);
        this.container.appendChild(this.text);

        this.container.classList.add('flow-blueprint__pin');
        this.circle.classList.add('flow-blueprint__circle');
        this.text.classList.add('flow-blueprint__pin-text');
        this.controls.classList.add('flow-blueprint__pin-controls');

        if (pin.direction === PinDirection.input) {
            this.container.classList.add('flow-blueprint__pin-input');
        } else {
            this.container.classList.add('flow-blueprint__pin-output');
        }

        this.circle.style.backgroundColor = this.pin.color;

        this.update();

        this.circle.addEventListener('mousedown', e => {
            if (e.which === 1) {
                this.emit('selectPin', this);
            }
        });

        this.circle.addEventListener('mouseenter', e => {
            this.emit('enterPin', this);
        });

        this.circle.addEventListener('mouseleave', e => {
            this.emit('leavePin', this);
        });

        this.circle.addEventListener('dblclick', () => {
            this.pin.disconnectAll();
        })

        this.pin.on('update', () => {
            this.emit('update', this);
            this.checkNeedUpdateDefaultsControls();
        });

        this.checkNeedUpdateDefaultsControls();
    }

    update() {
        this.text.innerHTML = this.pin.title;
    }

    positionCenterCircle(offset = new Position(0, 0)) {
        const bound = this.circle.getBoundingClientRect();

        return new Position((bound.left + bound.width / 2) + offset.x, (bound.top + bound.height / 2) + offset.y);
    }

    enableDefaultsControls() {
        this.enabledDefaultsControls = true;
        this.updateDefaultsControls();
    }

    disableDefaultsControls() {
        this.enabledDefaultsControls = false;
        this.updateDefaultsControls();
    }

    checkNeedUpdateDefaultsControls() {
        if (this.pin.direction === PinDirection.input) {
            if (this.pin.connects.length > 0) {
                this.disableDefaultsControls();
            } else {
                this.enableDefaultsControls();
            }
        } else if (this.pin.direction === PinDirection.output && this.pin.isCanWriteValue) {
            this.enableDefaultsControls();
        }
    }

    updateDefaultsControls() {
        this.controls.classList.forEach(val => this.controls.classList.remove(val));
        this.controls.classList.add('flow-blueprint__pin-controls');

        while (this.controls.firstChild) {
            this.controls.removeChild(this.controls.firstChild);
        }

        if (this.enabledDefaultsControls) {
            let input: HTMLInputElement = document.createElement('input');

            if (this.pin instanceof BooleanPin) {
                this.controls.classList.add('flow-blueprint__pin-controls--checkbox');
                input.type = 'checkbox';
                input.checked = this.pin.value || false;
                input.addEventListener('change', () => {
                    this.pin.setValue(input.checked);
                });
            } else if (this.pin instanceof NumberPin) {
                this.controls.classList.add('flow-blueprint__pin-controls--number');
                input.type = 'number';
                input.value = `${this.pin.value || 0}`;
                input.addEventListener('blur', () => {
                    this.pin.setValue(parseInt(input.value) || 0);
                    input.value = this.pin.value;
                });
                autoWidthInputByValue(input, 30);
                input.addEventListener('input', () => {
                    this.emit('update', this);
                });
            } else if (this.pin instanceof StringPin) {
                this.controls.classList.add('flow-blueprint__pin-controls--text');
                input.type = 'text';
                input.value = this.pin.value || '';
                input.placeholder = '';
                input.addEventListener('blur', () => {
                    this.pin.setValue(input.value);
                });
                autoWidthInputByValue(input, 8);
                input.addEventListener('input', () => {
                    this.emit('update', this);
                });
            } else {
                input = undefined;
            }

            if (input)
                this.controls.appendChild(input);

        }
    }

}