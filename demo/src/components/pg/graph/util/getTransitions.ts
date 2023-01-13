import {IParityGame} from "parity-game-solver";

/**
 * Retrieves the list of transitions of a parity game
 * @param pg The parity game to get the transition list for
 * @returns The list of transitions
 */
export function getTransitions(pg: IParityGame): {from: number; to: number}[] {
    const ids = new Set<number>();
    return pg.nodes
        .filter(({id}) => {
            if (ids.has(id)) return false;
            ids.add(id);
            return true;
        })
        .flatMap(({id: from, successors}) => {
            const toIds = new Set<number>();
            return successors
                .filter(({id}) => {
                    if (toIds.has(id)) return false;
                    toIds.add(id);
                    return true;
                })
                .map(({id: to}) => ({from, to}));
        });
}
