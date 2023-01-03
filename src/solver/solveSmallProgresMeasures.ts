import {IParityGame, IParityNode} from "../_types/IParityGame";
import {IProgressMeasure, IProgressMeasures} from "./_types/IProgressMeasures";
import {IProgressOrder} from "./_types/IProgressOrder";

/**
 * Performs the small progress measures parity solving algorithm
 * @param game The game to be solved
 * @param orderGenerator The factory for the node order to apply the algorithm in
 * @param asyncInterval The number of iterations after which to async wait for a ms
 * @returns The nodes won by each of the players
 */
export async function solveSmallProgressMeasures(
    game: IParityGame,
    orderGenerator: IProgressOrder,
    asyncInterval: number = 5000
): Promise<{0: IParityNode[]; 1: IParityNode[]; iterations: number}> {
    // Initialize the data structures
    const measures = new Map<IParityNode, IProgressMeasure>();
    const minMeasure = new Array(game.maxPriority + 1).fill(0);
    for (let node of game.nodes) measures.set(node, minMeasure);

    // Initialize the order factory
    const order = orderGenerator(game);

    // Perform the updates
    let next: IteratorResult<IParityNode, void>;
    let success = false;
    let i = Number.MAX_SAFE_INTEGER; // A safety net to handle inproper orders
    let waitCount = asyncInterval;
    while ((next = order.next(success)) && next?.value && --i > 0) {
        success = lift(measures, next.value, game.maxPriority, minMeasure);

        // Prevent long loops without pauses to keep the program responsive
        if (waitCount-- < 0) {
            waitCount = asyncInterval;
            await new Promise(res => setTimeout(res, 0));
        }
    }

    if (i <= 0)
        throw "Game did not resolve, it's either extremely large, or the order generator doesn't properly handle the stop condition";

    // Obtain the nodes that each player one
    return {
        0: game.nodes.filter(v => measures.get(v) != "T"),
        1: game.nodes.filter(v => measures.get(v) == "T"),
        iterations: Number.MAX_SAFE_INTEGER - i,
    };
}

/**
 * Lifts the value of the progress measures up
 * @param measures The measures to be lifted
 * @param v The whose progress measure to be lifted
 * @param maxPriority The maximum priority in the game
 * @param minMeasure The minimum measure that's possible
 * @returns Whether progress was made
 */
function lift(
    measures: IProgressMeasures,
    v: IParityNode,
    maxPriority: number,
    minMeasure: IProgressMeasure
): boolean {
    const progressions = v.successors.map(w => progress(measures, v, w, maxPriority));

    const oldMeasure = measures.get(v)!;
    const newMeasure =
        v.owner == 0
            ? progressions.reduce((m, n) => (compare(m, n) == -1 ? m : n), "T")
            : progressions.reduce((m, n) => (compare(m, n) == 1 ? m : n), minMeasure);

    measures.set(v, newMeasure);

    return compare(oldMeasure, newMeasure) != 0;
}

/**
 * Retrieves the progress for v
 * @param measures The current measures of all nodes
 * @param v The node to make progress with
 * @param w The dependent node
 * @param maxPriority The maximum priority of any node
 * @returns The new progress measure
 */
function progress(
    measures: IProgressMeasures,
    v: IParityNode,
    w: IParityNode,
    maxPriority: number
): IProgressMeasure {
    const measureW = measures.get(w)!;
    if (measureW == "T") return "T";

    // Set the result to be equal up to the priority
    const result = [...measureW];
    for (let i = v.priority + 1; i < result.length; i++) result[i] = 0;

    if (v.isEvenPriority) return result;

    // If the priority is odd, increased the measure by one
    for (let i = v.priority; i >= 0; i--) {
        const val = measureW[i];
        if (val == maxPriority) result[i] = 0;
        else {
            result[i] = val + 1;
            return result;
        }
    }

    // If we carried all the way to the left, return top
    return "T";
}

/**
 * Compares the progress measures a and b, returning 1 if a is greater, 0 if they are equal, or -1 otherwise
 * @param a Progress measure a
 * @param b Progress measure b
 * @returns How a and b relate to eachother
 */
function compare(a: IProgressMeasure, b: IProgressMeasure): -1 | 0 | 1 {
    if (a == "T" || b == "T") return a == "T" ? (b == "T" ? 0 : 1) : -1;

    const l = a.length;
    for (let i = 0; i < l; i++) {
        const av = a[i];
        const bv = b[i];
        if (av < bv) return -1;
        if (av > bv) return 1;
    }
    return 0;
}
