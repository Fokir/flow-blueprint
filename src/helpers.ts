import { Position } from './Position';

export function getMousePositionInElementByEvent(element: HTMLElement, event: MouseEvent): Position {
    const bound = element.getBoundingClientRect();
    return new Position(event.pageX - bound.left, event.pageY - bound.top);
}

export function getNormalizedRectanglesPoints(point1: Position, point2: Position) {
    let leftTop = new Position(0, 0);
    let rightBottom = new Position(0, 0);

    leftTop.extend(point1);
    rightBottom.extend(point2);
    if (point1.x < point2.x && point1.y > point2.y) {
        leftTop.set(point1.x, point2.y);
        rightBottom.set(point2.x, point1.y);
    } else if (point1.x > point2.x && point1.y > point2.y) {
        [leftTop, rightBottom] = [rightBottom, leftTop];
    } else if (point1.x > point2.x && point1.y < point2.y) {
        leftTop.set(point2.x, point1.y);
        rightBottom.set(point1.x, point2.y);
    }

    return [leftTop, rightBottom];
}

export function getWidthContent(content: string, size: string) {
    const buffer = document.createElement('div');
    buffer.style.position = 'absolute';
    buffer.style.left = `-10000px`;
    buffer.style.whiteSpace = 'nowrap';
    buffer.style.fontSize = `${size}`;
    buffer.innerHTML = content;
    document.body.appendChild(buffer);
    const width = buffer.clientWidth;
    document.body.removeChild(buffer);
    return width;
}

export function autoWidthInputByValue(input: HTMLInputElement, append: number = 0) {
    const size = window.getComputedStyle(input).fontSize;
    let width = getWidthContent(input.value || input.placeholder, size) + append;
    input.style.width = `${width}px`;

    input.addEventListener('input', () => {
        const size = window.getComputedStyle(input).fontSize;
        width = getWidthContent(input.value || input.placeholder, size) + append;
        input.style.width = `${width}px`;
    });
}