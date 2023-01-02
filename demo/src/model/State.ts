import {
    parityGameParser,
    getParityGame,
    createInputOrder,
    createRandomOrder,
    getAdaptiveOrderFromList,
    getOrderFromList,
    getRepeatedOrderFromList,
    IParityGame,
    IParityNode,
    IParityNodeAST,
    IParityGameAST,
    stringifyParityGame,
} from "parity-game-solver";
import {DataCacher, Field, IDataHook} from "model-react";
import {drawGraph} from "../components/pg/graph/layout/drawGraph";
import {formatSyntaxError} from "../util/formatyntaxError";
import {IBoundingBox} from "../_types/IBoundingBox";
import {IPoint} from "../_types/IPoint";
import {ISyntaxError} from "../_types/ISyntaxError";

/**
 * A class to store the application node
 */
export class State {
    protected PGText = new Field("");
    protected PGPoses = new Field<Record<number, Field<IPoint>>>({});

    protected parsed = new DataCacher(hook =>
        parityGameParser.parse(this.PGText.get(hook))
    );
    protected parityGame = new DataCacher(hook => {
        const val = this.parsed.get(hook);
        if (val.status) return getParityGame(val.value);
        return null;
    });
    protected errors = new DataCacher(hook => {
        const val = this.parsed.get(hook);
        if (!val.status) return formatSyntaxError(val);
        return null;
    });

    // PG text handling
    /**
     * Sets the text representing the PG
     * @param text The text of the PG
     */
    public setPG(text: string): void {
        this.PGText.set(text);
    }

    /**
     * Retrieves the text representing the PG
     * @param hook The hook to subscribe to changes
     * @returns The current text representing the PG
     */
    public getPGText(hook?: IDataHook): string {
        return this.PGText.get(hook);
    }

    /**
     * Retrieves the current PG
     * @param hook The hook to subscribe to changes
     * @returns The current PG
     */
    public getPG(hook?: IDataHook): IParityGame | null {
        return this.parityGame.get(hook);
    }

    /**
     * Retrieves the current syntax errors
     * @param hook The hook to subscribe to changes
     * @returns The current syntax errors
     */
    public getPGErrors(hook?: IDataHook): ISyntaxError | null {
        return this.errors.get(hook);
    }

    // PG visual handling
    /**
     * Retrieves the position of the node in space
     * @param node The node for which to get the position
     * @param hook The hook to subscribe to changes
     * @returns The position of the node
     */
    public getNodePos(node: number, hook?: IDataHook): IPoint {
        const poses = this.PGPoses.get(hook);
        const pos = poses[node];
        return pos?.get(hook) || {x: 0, y: 0};
    }

    /**
     * Sets the position for a given node
     * @param node The node to set the position for
     * @param pos The position to be set
     */
    public setNodePos(node: number, pos: IPoint): void {
        let poses = this.PGPoses.get();
        if (!poses[node]) {
            poses = {...poses, [node]: new Field({x: 0, y: 0})};
            this.PGPoses.set(poses);
        }
        poses[node].set(pos);
    }

    /**
     * Clears all node poses
     */
    public clearPoses(): void {
        this.PGPoses.set({});
    }

    /**
     * Retrieves all nodes in the parity game
     * @param hook The hook to subscribe to changes
     */
    public getNodes(hook?: IDataHook): IParityNode[] {
        return this.parityGame.get(hook)?.nodes || [];
    }

    /**
     * Retrieves the data associated to a node in the parity game
     * @param id The id of the node
     * @param hook The hook to subscribe to changes
     * @returns The node if it exists
     */
    public getNodeData(id: number, hook?: IDataHook): IParityNode | undefined {
        return this.getNodes(hook).find(node => node.id == id);
    }

    /**
     * Adds a node at the given position
     * @param pos The position to add the node at
     * @param owner The owner of the node (even or odd)
     * @param priority The priority of the node
     * @param name The name of the new node
     * @returns The id of the node
     */
    public addNode(
        pos: IPoint,
        owner: 0 | 1,
        priority: number,
        name?: string
    ): number | null {
        const p = this.parsed.get();
        if (p.status) {
            const newNodeID =
                p.value.nodes.reduce((highest, {id}) => Math.max(highest, id), -1) + 1;
            const newNode: IParityNodeAST = {
                id: newNodeID,
                owner,
                priority,
                successors: [],
                name,
            };
            this.setNodePos(newNodeID, pos);
            const pg: IParityGameAST = {
                maxParity: Math.max(newNodeID, p.value.maxParity ?? 0),
                nodes: [...p.value.nodes, newNode],
            };
            this.setPG(stringifyParityGame(pg));
            return newNodeID;
        }
        return null;
    }

    /**
     * Removes a node with the given ID
     * @param id The ID of the node to be removed
     */
    public removeNode(id: number): void {
        const poses = {...this.PGPoses.get()};
        delete poses[id];
        this.PGPoses.set(poses);

        const p = this.parsed.get();
        if (p.status) {
            const pg: IParityGameAST = {
                maxParity:
                    p.value.nodes.reduce((highest, {id}) => Math.max(highest, id), -1) +
                    1,
                nodes: p.value.nodes.filter(({id: i}) => id != i),
            };
            this.setPG(stringifyParityGame(pg));
        }
    }

    /**
     * Updates the data of the node
     * @param id The identifier of the node
     * @param owner The owner of the node, even or odd
     * @param priority The priority of the node
     * @param name The name of the node
     */
    public setNodeData(
        id: number,
        owner?: 0 | 1,
        priority?: number,
        name?: string
    ): void {
        const p = this.parsed.get();
        if (p.status) {
            const pg: IParityGameAST = {
                maxParity: p.value.maxParity,
                nodes: p.value.nodes.map(node => {
                    if (node.id != id) return node;
                    return {
                        id,
                        owner: owner ?? node.owner,
                        priority: priority ?? node.priority,
                        name: name ?? node.name,
                        successors: node.successors,
                    };
                }),
            };
            this.setPG(stringifyParityGame(pg));
        }
    }

    /**
     * Adds a transition between the two given nodes, for the given action
     * @param from The node that the transition is from
     * @param to The node that the transition is to
     */
    public addTransition(from: number, to: number): void {
        const p = this.parsed.get();
        if (p.status) {
            const pg: IParityGameAST = {
                maxParity: p.value.maxParity,
                nodes: p.value.nodes.map(node => {
                    if (node.id != from) return node;
                    return {
                        ...node,
                        successors: [...new Set([...node.successors, to])],
                    };
                }),
            };
            this.setPG(stringifyParityGame(pg));
        }
    }

    /**
     * Removes a transition between the two given nodes, for the given action
     * @param from The node that the transition is from
     * @param to The node that the transition is to
     */
    public removeTransition(from: number, to: number): void {
        const p = this.parsed.get();
        if (p.status) {
            const pg: IParityGameAST = {
                maxParity: p.value.maxParity,
                nodes: p.value.nodes.map(node => {
                    if (node.id != from) return node;
                    return {
                        ...node,
                        successors: node.successors.filter(s => s == to),
                    };
                }),
            };
            this.setPG(stringifyParityGame(pg));
        }
    }

    /**
     * Performs automatic node placement of the graph
     */
    public async layout(): Promise<void> {
        const lts = this.getPG();
        if (!lts) return;
        const positions = await drawGraph(lts);
        Object.entries(positions).forEach(([key, pos]) =>
            this.setNodePos(Number(key), pos)
        );
    }

    protected boundingBox = new DataCacher<IBoundingBox>(hook => {
        const boundingBox = {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
        };
        for (let pos of Object.values(this.PGPoses.get(hook))) {
            const {x, y} = pos.get(hook);
            if (x < boundingBox.minX) boundingBox.minX = x;
            if (x > boundingBox.maxX) boundingBox.maxX = x;
            if (y < boundingBox.minY) boundingBox.minY = y;
            if (y > boundingBox.maxY) boundingBox.maxY = y;
        }
        return boundingBox;
    });
    /**
     * Retrieves the bounding box of the current drawing (for 0 sized nodes)
     * @param hook The hook to subscribe to changes
     * @returns The bounding box that contains the drawing
     */
    public getBoundingBox(hook?: IDataHook): IBoundingBox {
        return this.boundingBox.get(hook);
    }
}
