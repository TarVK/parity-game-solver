import {IParityNode} from "../../../_types";
import {LinkedList} from "../../../utils/LinkedList";

/**
 * Creates an order generator given a fixed order list, where a graph search is performed from each node in the list
 * @param list The list defining the order
 * @returns The generator
 */
export function* getGraphOrder(
    list: IParityNode[]
): Generator<IParityNode, void, boolean> {
    const nodes = createReverseNodes(list);

    const maxId = list.reduce((m, {id}) => Math.max(m, id), 0);
    const visited: number[] = new Array(maxId + 1).fill(0);

    const length = list.length;
    const queue = new LinkedList<INonEmptyPath>([]);
    let failCount = 0;
    let searchId = 0;
    while (true)
        for (let node of nodes) {
            const {node: initialNode, predecessors} = node;
            const changed = yield initialNode;
            if (changed) {
                failCount = 0;

                // successors[initialNode.id] = null;
                const root: IPath = {node, prev: null};
                queue.clear();
                searchId++;

                // If the first node lifted, perform a (looping) BFS of lifting from this node
                let loop: IPath = null;
                for (let predecessor of predecessors) {
                    const path = {node: predecessor, prev: root};
                    queue.push(path);
                }
                while (queue.start) {
                    const queueNode = queue.start;
                    queue.remove(queueNode);

                    const {
                        value: {
                            node: {node, predecessors},
                        },
                    } = queueNode;

                    if (node == initialNode) {
                        loop = queueNode.value;
                        break;
                    }
                    if (visited[node.id] == searchId) continue;
                    visited[node.id] = searchId;

                    const changed = yield node;
                    if (changed)
                        for (let predecessor of predecessors) {
                            const path = {node: predecessor, prev: queueNode.value};
                            queue.push(path);
                        }
                }

                // If a lift loop was found, continue the loop until no more progress is made
                if (loop) {
                    const loopNodes: IParityNode[] = [];
                    // let node = successors[initialNode.id];
                    // successors[initialNode.id] = null;
                    let node: IPath = loop;
                    while (node) {
                        loopNodes.push(node.node.node);
                        node = node.prev;
                    }
                    loopNodes.reverse();
                    loopNodes.pop();

                    loop: while (true) {
                        for (let node of loopNodes) {
                            const changed = yield node;
                            if (!changed) break loop;
                        }
                    }
                }
            } else {
                failCount++;
                if (failCount > length) return;
            }
        }
}

type IPath = INonEmptyPath | null;
type INonEmptyPath = {node: IReverseNode; prev: IPath};

type IReverseNode = {
    node: IParityNode;
    predecessors: IReverseNode[];
};

function createReverseNodes(nodes: IParityNode[]): IReverseNode[] {
    const reverseNodesMap: Map<IParityNode, IReverseNode> = new Map();
    const reverseNodes: IReverseNode[] = [];

    for (let node of nodes) {
        const reverseNode: IReverseNode = {
            node,
            predecessors: [],
        };
        reverseNodes.push(reverseNode);
        reverseNodesMap.set(node, reverseNode);
    }

    for (let node of nodes) {
        const reverseNode = reverseNodesMap.get(node);
        if (!reverseNode) continue;

        for (let successor of node.successors) {
            const reverseSuccessor = reverseNodesMap.get(successor);
            if (!reverseSuccessor) continue;
            reverseSuccessor.predecessors.push(reverseNode);
        }
    }

    return reverseNodes;
}
