import {IParityGame, IParityNode} from "../../_types/IParityGame";
import {getOrderFromList} from "./orderStrategies/getOrderFromList";
import {IProgressOrder} from "../_types/IProgressOrder";
import {IOrderFactory} from "./_types/IOrderFactory";
import {LinkedList} from "../../utils/LinkedList";

/**
 * creates a small progress measure order, trying to order consecutive nodes in sequence
 * @param getOrder The order strategy type
 * @returns The order generator
 */
export const createGraphOrder =
    (getOrder: IOrderFactory = getOrderFromList) =>
    (game: IParityGame) => {
        const maxId = game.nodes.reduce((m, {id}) => Math.max(m, id), 0);
        const visited = new Array(maxId + 1).fill(false);

        const nodes: IParityNode[] = [];
        for (let node of game.nodes) {
            const queue = new LinkedList<IParityNode>([node]);
            while (queue.start) {
                const queueNode = queue.start;
                queue.remove(queueNode);

                const {value: node} = queueNode;
                if (visited[node.id]) continue;
                visited[node.id] = true;

                nodes.push(node);
                for (let successor of node.successors) queue.push(successor);
            }
        }

        return getOrder(nodes.reverse());
    };
