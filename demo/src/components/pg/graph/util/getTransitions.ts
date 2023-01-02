import {IParityGame} from "parity-game-solver";

/**
 * Retrieves the list of transitions of a parity game
 * @param pg The parity game to get the transition list for
 * @returns The list of transitions
 */
export function getTransitions(pg: IParityGame): {from: number; to: number}[] {
    return pg.nodes.flatMap(({id: from, successors}) =>
        successors.map(({id: to}) => ({from, to}))
    );
}
