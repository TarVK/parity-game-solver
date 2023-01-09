type ILinkedListNode<T> = {
    value: T;
    next: ILinkedListNode<T>;
    previous: ILinkedListNode<T>;
} | null;
export class LinkedList<T> {
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

    public clear(): void {
        this.start = null;
        this.end = null;
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
