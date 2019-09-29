export interface IPin {
    id: string;
    connectsOutput: string[];
    value: any;
}

export interface IBlock {
    id: string;
    type: string;
    position: {x: number, y: number};
    pins: {
        [name: string]: IPin;
    }
}

export interface IFlow {
    blocks: IBlock[];
}