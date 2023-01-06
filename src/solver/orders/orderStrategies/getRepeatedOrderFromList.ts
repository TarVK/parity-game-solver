/**
 * Creates an order generator given a fixed order list, where it repeats lifting the same node until it fails and then moves on to the next
 * @param list The list defining the order
 * @returns The generator
 */
export function* getRepeatedOrderFromList<T>(list: T[]): Generator<T, void, boolean> {
    const length = list.length;
    let failCount = 0;
    while (true)
        for (let node of list) {
            let count = 0;
            while (yield node) count++;

            if (count > 0) failCount = 0;
            else {
                failCount++;
                if (failCount > length) return;
            }
        }
}
