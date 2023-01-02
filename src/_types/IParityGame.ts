export type IParityGame = {
    /** The maximum priority of any node in the game */
    maxPriority: number;
    /** The nodes in the game */
    nodes: IParityNode[];
};

export type IParityNode = {
    /** The id of the node */
    id: number;
    /** The priority of this parity node */
    priority: number;
    /** Whether the priority is even */
    isEvenPriority: boolean;
    /** THe owner of the node */
    owner: 0 | 1;
    /** The list of successor nodes */
    successors: IParityNode[];
    /** The name of the node, if any */
    name?: string;
};
