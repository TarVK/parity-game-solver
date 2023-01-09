import {LinkedList} from "../../../utils/LinkedList";

/**
 * Creates an order generator given a fixed order list, where it restarts from the start of the list every time a node fails to life, and puts the failed node at the end of the sequence
 * @param list The list defining the order
 * @returns The generator
 */
export function* getAdaptiveOrderFromList<T>(list: T[]): Generator<T, void, boolean> {
    const length = list.length;
    const order = new LinkedList(list);
    let failCount = 0;
    while (true) {
        let listNode = order.start;
        while (listNode) {
            let node = listNode.value;

            const changed = yield node;
            if (changed) {
                failCount = 0;
                listNode = listNode.next;
            } else {
                failCount++;
                if (failCount > length) return;

                // Move node to the back
                order.remove(listNode);
                order.push(node);

                // Start from scratch
                break;
            }
        }
    }
}
