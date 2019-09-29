import { FlowBlueprint } from './FlowBlueprint';
import { Block } from './Block';
import { BlockDraw } from './draw/BlockDraw';
import { PinDraw } from './draw/PinDraw';
import { PinDirection } from './PinDirection';
import { Position } from './Position';
import { ContextMenuDraw } from './draw/ContextMenuDraw';
import { getMousePositionInElementByEvent, getNormalizedRectanglesPoints } from './helpers';

export class FlowBlueprintDraw {

    private container = document.createElement('div');
    private selecterContainer = document.createElement('div');
    private canvas = document.createElement('canvas');
    private context = this.canvas.getContext('2d');
    private blocks: BlockDraw[] = [];

    private availablePins: PinDraw[] = [];
    private connectedOutputsPins: PinDraw[] = [];

    private containerBound: ClientRect;

    private requestAnimationsFrameEnabled = false;

    private draggableBlock: BlockDraw;
    private selectedBlocks: BlockDraw[] = [];

    private selectedPin: PinDraw;
    private hoveredPin: PinDraw;

    private contextMenu: ContextMenuDraw;

    private selectedRectangleStart: Position;

    lastMousePosition = new Position(0, 0);

    constructor(public flow: FlowBlueprint, container: string | HTMLElement) {

        if (typeof container === 'string') {
            container = document.querySelector<HTMLElement>(container);
        }

        container.appendChild(this.container);
        this.container.appendChild(this.canvas);
        this.container.appendChild(this.selecterContainer);

        this.hideSelectorContainer();

        this.container.classList.add('flow-blueprint');
        this.selecterContainer.classList.add('flow-blueprint__selector');

        this.flow.blocks.forEach(block => this.add(block));

        this.flow.addListener('add', block => this.add(block));
        this.flow.addListener('remove', block => this.remove(block));
        this.update();
        this.requestAnimationsFrameCheck();

        this.container.addEventListener('mousedown', e => {
            if (e.target === this.container || e.target === this.canvas && e.which === 1 && !this.contextMenu.visable) {
                this.selectedRectangleStart = getMousePositionInElementByEvent(this.container, e);
                this.showSelectorContainer();
                this.updateSelectorContainer(this.selectedRectangleStart);
            }
        })

        this.container.addEventListener('mouseup', e => {
            this.draggableBlock = undefined;

            if (!this.contextMenu.visable) {
                if (this.selectedPin && this.hoveredPin) {
                    this.selectedPin.pin.connect(this.hoveredPin.pin);
                    this.selectedPin = undefined;
                } else if (this.selectedPin) {
                    const pin = this.selectedPin.pin;
                    this.contextMenu.position(this.lastMousePosition);
                    this.contextMenu.show();
                    this.contextMenu.filterByPin(pin);
                    this.contextMenu.onHide = () => {
                        this.selectedPin = undefined
                        this.drawConnects();
                    };
                } else if (this.selectedRectangleStart) {
                    e.preventDefault();

                    const [startPosition, endPosition] = getNormalizedRectanglesPoints(
                        this.selectedRectangleStart,
                        getMousePositionInElementByEvent(this.container, e)
                    );

                    this.updateSelectedBlocks(this.getOverlapsBlocks(startPosition, endPosition));
                    this.selectedRectangleStart = undefined;
                    this.hideSelectorContainer();
                }
            }

            this.drawConnects();
            this.requestAnimationsFrameEnabled = false;
        });

        this.container.addEventListener('mousedown', (e) => {
            this.lastMousePosition.set(e.pageX - this.containerBound.left, e.pageY - this.containerBound.top);
        });

        this.container.addEventListener('mousemove', e => {
            const x = e.pageX - this.containerBound.left;
            const y = e.pageY - this.containerBound.top;

            if (this.draggableBlock) {
                this.draggableBlock.block.position.x += x - this.lastMousePosition.x;
                this.draggableBlock.block.position.y += y - this.lastMousePosition.y;

                this.draggableBlock.update();
            } else if (this.selectedRectangleStart) {
                const endPosition = getMousePositionInElementByEvent(this.container, e);
                this.updateSelectorContainer(endPosition);
            }

            this.lastMousePosition.set(x, y);
        });

        this.contextMenu = new ContextMenuDraw(this, this.container);

        document.addEventListener('keydown', (e) => {
            if (e.which === 8 && this.selectedBlocks.length &&
                 !this.contextMenu.visable && document.activeElement.tagName.toLocaleLowerCase() !== 'input') {
                this.selectedBlocks.forEach(draw => {
                    this.flow.remove(draw.block);
                });
                this.selectedBlocks = [];
            }
        });

        this.container.addEventListener('scroll', () => {
            this.update();
        });
    }

    private add(block: Block) {
        const draw = new BlockDraw(block);
        this.container.appendChild(draw.container);
        this.fastJoinBlockByPin(block);
        draw.update();
        this.blocks.push(draw);
        this.updatePins();

        draw.on('dragstart', () => this.onDragBlockStart(draw));
        draw.on('select', () => this.onSelectBlock(draw));
        draw.on('selectPin', pin => this.onSelectPin(pin));
        draw.on('enterPin', pin => this.onHoverPin(pin));
        draw.on('leavePin', pin => this.onBlurPin(pin));
        draw.on('update', () => this.updatePins());
    }

    private remove(block: Block) {
        const index = this.blocks.findIndex(draw => draw.block === block);
        if (index > -1) {
            this.blocks[index].destroy();
            this.blocks.splice(index, 1);
            this.updatePins();
        }
    }

    private onSelectBlock(draw: BlockDraw) {
        this.updateSelectedBlocks([
            draw
        ]);
    }

    private onDragBlockStart(draw: BlockDraw) {
        this.draggableBlock = draw;
        this.requestAnimationsFrameEnabled = draw.pins.some(d => d.pin.connects.length > 0);
    }

    private onSelectPin(pin: PinDraw) {
        this.selectedPin = pin;
        this.requestAnimationsFrameEnabled = true;
    }

    private onHoverPin(pin: PinDraw) {
        this.hoveredPin = pin;
    }

    private onBlurPin(pin: PinDraw) {
        this.hoveredPin = undefined;
    }

    private fastJoinBlockByPin(block: Block) {
        if (this.selectedPin) {
            const pin = this.selectedPin.pin;
            const avaliablePinConnect = block
                .entriesPins().map(([n, p]) => p)
                .filter(p => pin.avaliableConnect(p))
                .shift();
            if (avaliablePinConnect) {
                pin.connect(avaliablePinConnect);
            }
        }
    }


    private getAvailablePins() {
        return this.blocks.reduce((pins, block) => {
            pins.push(...block.pins);
            return pins;
        }, []);
    }

    private getConnectedOutputsPins() {
        return this.availablePins.filter(pin => {
            return pin.pin.direction === PinDirection.output && pin.pin.connects.length > 0;
        });
    }

    private updatePins() {
        this.availablePins = this.getAvailablePins();
        this.connectedOutputsPins = this.getConnectedOutputsPins();
        this.drawConnects();
    }

    private getCurvePointByPosition(first: Position, second: Position, revert = false) {
        if (revert) {
            return new Position(
                Math.floor(first.x - Math.abs(first.x - second.x) / 2),
                Math.floor(first.y)
            )
        } else {
            return new Position(
                Math.floor(first.x + Math.abs(first.x - second.x) / 2),
                Math.floor(first.y)
            )
        }

    }

    private drawConnects() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.lineWidth = 5;

        this.context.shadowOffsetX = 4;
        this.context.shadowOffsetY = 4;
        this.context.shadowBlur = 7;
        this.context.shadowColor = "rgba(0,0,0,0.2)";

        const offset = new Position(this.container.scrollLeft - this.containerBound.left,
            this.container.scrollTop - this.containerBound.top);

        this.connectedOutputsPins.forEach(draw => {
            const positionStart = draw.positionCenterCircle(offset);
            this.context.strokeStyle = draw.pin.color;

            draw.pin.connects.forEach(secondPin => {
                const secondDraw = this.availablePins.find(d => d.pin === secondPin);
                if (secondDraw) {
                    const positionEnd = secondDraw.positionCenterCircle(offset);
                    this.drawCurve(positionStart, positionEnd);
                }
            });
        });

        if (this.selectedPin) {
            this.context.strokeStyle = this.selectedPin.pin.color;
            const positionStart = this.selectedPin.positionCenterCircle(offset);
            const positionEnd = this.hoveredPin ? this.hoveredPin.positionCenterCircle(offset) : this.lastMousePosition;
            if (this.selectedPin.pin.direction === PinDirection.output) {
                this.drawCurve(positionStart, positionEnd);
            } else {
                this.drawCurve(positionEnd, positionStart);
            }
        }
    }

    private drawCurve(positionStart: Position, positionEnd: Position) {
        const point1 = this.getCurvePointByPosition(positionStart, positionEnd);
        const point2 = this.getCurvePointByPosition(positionEnd, positionStart, true);

        this.context.beginPath();
        this.context.moveTo(positionStart.x, positionStart.y);
        this.context.bezierCurveTo(point1.x, point1.y, point2.x, point2.y, positionEnd.x, positionEnd.y);
        this.context.stroke();
    }

    private drawPoint(position: Position, color: string) {
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(position.x, position.y, 5, 0, 2 * Math.PI);
        this.context.fill();
    }

    private requestAnimationsFrameCheck() {
        requestAnimationFrame(() => {
            if (this.requestAnimationsFrameEnabled) {
                this.canvas.width = this.container.scrollWidth;
                this.canvas.height = this.container.scrollHeight;
                this.drawConnects();
            }
            this.requestAnimationsFrameCheck();
        })
    }

    private updateSelectedBlocks(draw: BlockDraw[]) {
        this.selectedBlocks.forEach(draw => draw.unselect());
        draw.forEach(draw => draw.select());
        this.selectedBlocks = draw;

        // console.log('updateBlocks', this.selectedBlocks);

    }

    private getOverlapsBlocks(l1: Position, r1: Position) {
        return this.blocks.filter(block => {
            return this.doOverlap(l1, r1, block.position,
                new Position(block.position.x + block.blockWidth, block.position.y + block.blockHeight));
        });
    }

    private doOverlap(l1: Position, r1: Position, l2: Position, r2: Position) {
        if (l1.x > r2.x || l2.x > r1.x) {
            return false;
        }
        if (l1.y > r2.y || l2.y > r1.y) {
            return false;
        }
        return true;
    }

    private showSelectorContainer() {
        this.selecterContainer.style.display = 'block';
    }

    private hideSelectorContainer() {
        this.selecterContainer.style.display = 'none';
    }

    private updateSelectorContainer(mousePosition: Position) {
        const [startPosition, endPosition] = getNormalizedRectanglesPoints(this.selectedRectangleStart, mousePosition);

        const width = endPosition.x - startPosition.x;
        const height = endPosition.y - startPosition.y;

        this.selecterContainer.style.height = `${Math.abs(height)}px`;
        this.selecterContainer.style.width = `${Math.abs(width)}px`;
        this.selecterContainer.style.left = `${startPosition.x}px`;
        this.selecterContainer.style.top = `${startPosition.y}px`;

        this.updateSelectedBlocks(this.getOverlapsBlocks(startPosition, endPosition));
    }


    update() {
        this.containerBound = this.container.getBoundingClientRect();

        const maxBlockPosition = this.blocks.reduce<number>((res, block) => {
            if (block.position.x + block.blockHeight > res) {
                return block.position.x + block.blockHeight;
            }
            return res;
        }, this.blocks.length > 0 ? this.blocks[0].position.x + this.blocks[0].blockHeight : 0);

        const canvasHeight = maxBlockPosition > this.container.clientHeight ?
            maxBlockPosition + 200 : this.container.clientHeight;

        this.canvas.width = this.container.scrollWidth;
        this.canvas.height = canvasHeight;
        this.updatePins();
    }
}