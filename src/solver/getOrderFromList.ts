/**
 * Creates an order generator given a fixed order list
 * @param list The list defining the order
 * @returns The generator
 */
export function* getOrderFromList<T>(list: T[]): Generator<T, void, boolean> {
    const length = list.length;
    let failCount = 0;
    while (true)
        for (let node of list)
            if (yield node) {
                failCount = 0;
            } else {
                failCount++;
                if (failCount > length) return;
            }
}
