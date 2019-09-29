import {
    FlowBlueprint,
    FlowBlueprintDraw,
    OnMessageEventBlock
} from '../src/index';

const blueprint = new FlowBlueprint();
const blueprintDraw = new FlowBlueprintDraw(blueprint, '.container');

if (localStorage.getItem('saved')) {
    blueprint.addScheme(JSON.parse(localStorage.getItem('saved')));
}

blueprintDraw.update();

document.querySelector<HTMLElement>('.save').addEventListener('click', () => {
    localStorage.setItem('saved', JSON.stringify(blueprint.json()));
});

document.querySelector<HTMLElement>('.add').addEventListener('click', () => {
    blueprint.addScheme(JSON.parse(localStorage.getItem('saved')));
});

document.querySelector<HTMLElement>('.log').addEventListener('click', () => {
    console.log(blueprint.json());    
});

document.querySelector<HTMLElement>('.run').addEventListener('click', () => {
    blueprint.blocks
        .forEach(block => {
            if(block instanceof OnMessageEventBlock) {
                block.setMessage('Test message')
                block.execute();
            }
        });
});

console.log(blueprint.json());

// console.log(JSON.stringify(blueprint.json(), undefined, 2));

