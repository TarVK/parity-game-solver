export type IParityGameAST = {
    maxParity?: number;
    nodes: IParityNodeAST[];
};

export type IParityNodeAST = {
    id: number;
    name?: string;
    owner: 0 | 1;
    priority: number;
    successors: number[];
};
