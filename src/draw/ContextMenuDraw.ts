import { Block } from "../Block";
import { FlowBlueprintDraw } from "../FlowBlueprintDraw";
import { Position } from "../Position";
import { Pin } from "../Pin";

class ContextGroupItem {

    items: ContextMenuItem[] = [];

    container = document.createElement('div');
    private header = document.createElement('div');
    private container_list = document.createElement('div');

    constructor(public title: string) {

        this.container.appendChild(this.header);
        this.container.appendChild(this.container_list);

        this.container.classList.add('flow-blueprint__context-group');
        this.header.classList.add('flow-blueprint__context-group-header');
        this.container_list.classList.add('flow-blueprint__context-group-list');
    }

    add(item: ContextMenuItem) {
        this.items.push(item);
        this.container_list.appendChild(item.container);
    }

    update() {
        this.header.innerHTML = this.title;
        const isSuitItem = this.items.some(i => i.show);
        if (isSuitItem) {
            this.container.style.display = 'block';
        } else {
            this.container.style.display = 'none';
        }
    }
}

class ContextMenuItem {

    container = document.createElement('div');
    block: Block;

    constructor(
        public show = true,
        private factory: () => Block,
        private addCallback: (block: Block) => void
    ) {
        this.container.classList.add('flow-blueprint__context-item');

        this.container.addEventListener('click', (e) => {
            this.addCallback(this.factory());
        });

        this.block = this.factory();
        this.container.innerHTML = this.block.title;
    }

    update() {
        if (this.show) {
            this.container.style.display = 'block';
        } else {
            this.container.style.display = 'none';
        }
    }
}

export class ContextMenuDraw {

    container: HTMLDivElement;

    visable = false;
    timeLastOpened = 0;

    private input = document.createElement('input');
    private list = document.createElement('div');

    private groups: ContextGroupItem[] = [];

    onHide: () => void = () => {};

    constructor(private flow: FlowBlueprintDraw, private parent: HTMLElement) {
        this.container = document.createElement('div');

        this.container.classList.add('flow-blueprint__context-menu');
        this.input.classList.add('flow-blueprint__context-input');
        this.list.classList.add('flow-blueprint__context-items');

        this.container.appendChild(this.input);
        this.container.appendChild(this.list);

        this.input.addEventListener('input', e => {
            if (this.input.value) {
                this.filterByName(this.input.value);
            } else {
                this.resetFilters();
            }
        });

        this.parent.addEventListener('contextmenu', e => {
            e.preventDefault();
            const bound = this.parent.getBoundingClientRect();
            this.position(new Position(e.pageX - bound.left, e.pageY - bound.top));
            this.show();
        });

        document.addEventListener('click', e => {
            if(new Date().valueOf() - this.timeLastOpened < 200) {
                return;
            }
            const el = e.target as HTMLElement;

            if (!this.container.contains(el)) {
                this.hide();
            }
        });

        this.update();
    }

    show() {
        this.timeLastOpened = new Date().valueOf();
        this.visable = true;
        this.input.value = '';
        this.resetFilters();
        this.parent.appendChild(this.container);
        this.input.focus();
    }

    hide() {
        this.visable = false;
        if (this.container.parentElement)
            this.container.parentElement.removeChild(this.container);
        this.onHide();
    }

    update() {

        const groupNames = Array.from(this.flow.flow.blockNames.values())
            .map((block: any): string => {
                return block.group || 'Other';
            })
            .filter((n, i, l) => l.indexOf(n) === i)
            .sort();

        this.groups.forEach(g => g.container.parentElement.removeChild(g.container));
        this.groups = groupNames.map(name => {
            const group = new ContextGroupItem(name);
            this.list.appendChild(group.container);
            return group;
        });

        Array.from(this.flow.flow.blockNames.values())
            .forEach((block: Type<Block>) => {
                const groupName = (block as any).group || 'Other';
                const group = this.groups.find(g => g.title === groupName);

                group.add(new ContextMenuItem(
                    true,
                    () => new block(),
                    (instance) => {                        
                        instance.position.set(this.flow.lastMousePosition.x, this.flow.lastMousePosition.y);
                        this.flow.flow.add(instance);
                        this.hide();
                    }
                ));
            });

        this.groups.forEach(g => g.update());
    }

    position(position: Position) {
        this.container.style.left = `${position.x}px`;
        this.container.style.top = `${position.y}px`;
    }

    filterByName(name: string) {
        name = name.toLocaleLowerCase();
        this.groups.forEach(group => {
            const groupSuit = group.title.toLocaleLowerCase().includes(name);
            group.items.forEach(item => {
                item.show = groupSuit || item.block.title.toLocaleLowerCase().includes(name);
                item.update();
            });
            group.update();
        });
    }

    filterByPin(pin: Pin<any>) {
        this.groups.forEach(group => {
            group.items.forEach(item => {
                const avaliablePinConnect = item.block
                    .entriesPins().map(([n, p]) => p)
                    .some(p => pin.avaliableConnect(p))

                item.show = avaliablePinConnect;
                item.update();
            });
            group.update();
        });
    }

    resetFilters() {
        this.groups.forEach(group => {
            group.items.forEach(item => {
                item.show = true;
                item.update();
            });
            group.update();
        });
    }
}