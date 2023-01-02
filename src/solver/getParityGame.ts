import {IParityGame, IParityNode} from "../_types/IParityGame";
import {IParityGameAST} from "../_types/IParityGameAST";

/**
 * Retrieves the preprocessed parity game given the AST of a parity game
 * @param ast THe abstract syntax tree to further process
 * @returns The parity game in optimized format
 */
export function getParityGame(ast: IParityGameAST): IParityGame {
    const maxPriority = ast.nodes.reduce((m, {priority}) => Math.max(m, priority), 0);

    // Create a map of unlinked nodes
    const nodeMap = new Map<number, IParityNode>();
    ast.nodes.forEach(({id, owner, priority, name}) => {
        nodeMap.set(id, {
            id,
            owner,
            priority,
            isEvenPriority: priority % 2 == 0,
            successors: [],
            name,
        });
    });

    // Link the nodes
    ast.nodes.forEach(({id, successors}) => {
        nodeMap.get(id)!.successors = successors
            .map(id => nodeMap.get(id))
            .filter((v): v is IParityNode => !!v);
    });

    // Return the object
    return {
        maxPriority,
        nodes: ast.nodes.map(({id}) => nodeMap.get(id)!),
    };
}
