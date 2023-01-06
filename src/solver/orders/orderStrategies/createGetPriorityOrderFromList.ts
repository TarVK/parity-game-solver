import {IParityNode} from "../../../_types";
import {IOrderFactory} from "../_types/IOrderFactory";
import {getOrderFromList} from "./getOrderFromList";

/**
 * Creates a function that creates an order generator given a fixed order list.
 * This order generator will apply the `withinPriorityOrder` exhaustively on the nodes with a given priority before moving on to the next priority. This will be done in a decreasing priority fashion
 * @param withinPriorityOrder The progress order to use within a given priority level
 * @returns The order order factory that applies the withinPriorityOrder per priority
 */
export const createGetPriorityOrderFromList = (
    withinPriorityOrder: IOrderFactory = getOrderFromList
) =>
    /**
     * Creates an order generator given a fixed order list
     * @param list The list defining the order
     * @returns The generator
     */
    function* getPriorityOrderFromList<T>(
        list: IParityNode[]
    ): Generator<IParityNode, void, boolean> {
        const maxPriority = list.reduce((m, node) => Math.max(m, node.priority), 0);
        const nodesPerPriority = list.reduce<IParityNode[][]>(
            (map, node) => [
                ...map.slice(0, node.priority),
                [...map[node.priority], node],
                ...map.slice(node.priority + 1),
            ],
            new Array(maxPriority + 1).fill(0).map(() => [])
        );
        const orderPerPriority = nodesPerPriority
            .filter(nodes => nodes.length > 0)
            .map(nodes => withinPriorityOrder(nodes))
            .reverse();

        const length = orderPerPriority.length;
        let failCount = 0;
        while (true)
            for (let order of orderPerPriority) {
                let changedAtLeastOnce = false;
                let changed = false;
                while (true) {
                    const next = order.next(changed);
                    if (next.done) break;
                    changed = yield next.value;
                    changedAtLeastOnce = true;
                }

                if (changedAtLeastOnce) failCount = 0;
                else {
                    failCount++;
                    if (failCount > length) return;
                }
            }
    };
