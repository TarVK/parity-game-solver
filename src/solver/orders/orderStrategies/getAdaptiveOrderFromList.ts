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

type ILinkedListNode<T> = {
    value: T;
    next: ILinkedListNode<T>;
    previous: ILinkedListNode<T>;
} | null;
class LinkedList<T> {
    public start: ILinkedListNode<T>;
    public end: ILinkedListNode<T>;

    public constructor(list: T[]) {
        const {start, end} = list.reduceRight<{
            start: ILinkedListNode<T>;
            end: ILinkedListNode<T>;
        }>(
            ({start: next, end}, value) => {
                const node = {next, previous: null, value};
                if (next) next.previous = node;
                return {start: node, end: end ?? node};
            },
            {start: null, end: null}
        );
        this.start = start;
        this.end = end;
    }

    public push(val: T): void {
        if (!this.start) {
            this.start = {value: val, next: null, previous: null};
            this.end = this.start;
        } else {
            this.end!.next = {value: val, next: null, previous: this.end};
            this.end = this.end!.next;
        }
    }

    public remove(node: ILinkedListNode<T>): void {
        if (!node) return;
        if (node.previous) node.previous.next = node.next;
        if (node.next) node.next.previous = node.previous;

        if (node == this.start) this.start = node.next;
        if (node == this.end) this.end = node.previous;
    }
}
