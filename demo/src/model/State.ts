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
    solveSmallProgressMeasures,
} from "parity-game-solver";
import {DataCacher, ExecutionState, Field, IDataHook} from "model-react";
import {drawGraph} from "../components/pg/graph/layout/drawGraph";
import {formatSyntaxError} from "../util/formatyntaxError";
import {IBoundingBox} from "../_types/IBoundingBox";
import {IPoint} from "../_types/IPoint";
import {ISyntaxError} from "../_types/ISyntaxError";
import {IOrderType} from "../_types/IOrderType";
import {IStrategyType} from "../_types/IStrategyType";
import {IOrderFactory} from "parity-game-solver/build/solver/orders/_types/IOrderFactory";
import {IProgressOrder} from "parity-game-solver/build/solver/_types/IProgressOrder";

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

    protected result = new Field<{
        0: IParityNode[];
        1: IParityNode[];
        iterations: number;
        duration: number;
    } | null>(null);
    protected orderType = new Field<IOrderType>("random");
    protected strategyType = new Field<IStrategyType>("adaptive");
    protected loadingResult = new ExecutionState();

    // PG text handling
    /**
     * Sets the text representing the PG
     * @param text The text of the PG
     */
    public setPG(text: string): void {
        this.PGText.set(text);
        this.result.set(null);
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

    // Parity game functions
    protected strategy = new DataCacher(h => {
        const createOrder = {
            input: createInputOrder,
            random: (f: IOrderFactory) => createRandomOrder(0, f),
        }[this.orderType.get(h)];
        const strategy = {
            adaptive: getAdaptiveOrderFromList,
            cycle: getOrderFromList,
            repeat: getRepeatedOrderFromList,
        }[this.strategyType.get(h)];

        return createOrder(strategy);
    });

    /**
     * Sets the strategy type to be used
     * @param type The strategy type
     */
    public setStrategyType(type: IStrategyType): void {
        this.result.set(null);
        this.strategyType.set(type);
    }

    /**
     * Retrieves the strategy type for the ordering
     * @param hook The hook to subscribe to changes
     * @returns The stategy type
     */
    public getStrategyType(hook?: IDataHook): IStrategyType {
        return this.strategyType.get(hook);
    }

    /**
     * Sets the base order type
     * @param type The base order
     */
    public setOrderType(type: IOrderType): void {
        this.result.set(null);
        this.orderType.set(type);
    }

    /**
     * Retrieves the base order type
     * @param hook The hook to subscribe to changes
     * @returns The base order type
     */
    public getOrderType(hook?: IDataHook): IOrderType {
        return this.orderType.get(hook);
    }

    /**
     * Retrieves the strategy
     * @param hook The hook to subscribe to changes
     * @returns The strategy to be used for the small progress measures algorithm
     */
    public getStrategy(hook?: IDataHook): IProgressOrder {
        return this.strategy.get(hook);
    }

    /**
     * Performs the small progress measures algorithm
     */
    public check(): Promise<void> {
        return this.loadingResult.add(async () => {
            const pg = this.getPG();
            const order = this.getStrategy();

            if (!pg) return;
            const startTime = Date.now();
            const result = await solveSmallProgressMeasures(pg, order);
            this.result.set({...result, duration: Date.now() - startTime});
        });
    }

    protected winners = new DataCacher(h => {
        const winners: Record<number, 0 | 1> = {};

        const nodes = this.getNodeWinners(h);
        if (!nodes) return winners;

        for (let wonByEven of nodes[0]) winners[wonByEven.id] = 0;
        for (let wonByOdd of nodes[1]) winners[wonByOdd.id] = 1;

        return winners;
    });

    /**
     * Retrieves the winners of every node
     * @param hook The hook to subscribe to changes
     * @returns The even and odd player's won nodes
     */
    public getNodeWinners(hook?: IDataHook): [IParityNode[], IParityNode[]] | null {
        const result = this.result.get(hook);
        if (!result) return null;

        return [result[0], result[1]];
    }

    /**
     * Retrieves who won the given node
     * @param node The node to check
     * @param hook The hook to subscribe to changes
     * @returns Either null if the check wasn't performed, or 0 or 1 if even or odd won respectively
     */
    public getNodeWinner(node: number | IParityNode, hook?: IDataHook): null | 0 | 1 {
        return this.winners.get(hook)[typeof node == "number" ? node : node.id] ?? null;
    }

    /**
     * Retrieves the verification process data
     * @param hook The hook to subscribe to changes
     * @returns The verification data
     */
    public getCheckData(hook?: IDataHook): {duration: number; iterations: number} | null {
        const result = this.result.get(hook);
        if (!result) return null;

        return {duration: result.duration, iterations: result.iterations};
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
