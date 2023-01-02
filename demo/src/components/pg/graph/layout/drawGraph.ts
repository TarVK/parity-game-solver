import ELK, {ElkNode} from "elkjs/lib/elk.bundled";
import {IPoint} from "../../../../_types/IPoint";
import {getTransitions} from "../util/getTransitions";
import {radius} from "../drawing/Node";
import {IParityGame} from "parity-game-solver";

const elk = new ELK();
const s = <T>(v: T) => v + "";

/**
 * Creates node positioning for the given parity game
 * @param pg The graph to layout
 * @returns The positions for each node
 */
export async function drawGraph(pg: IParityGame): Promise<Record<number, IPoint>> {
    const graph: ElkNode = {
        id: "root",
        // layoutOptions: {
        //     "elk.algorithm": "force",
        //     "elk.force.iterations": "500",
        //     "elk.spacing.nodeNode": "160",
        //     "elk.layered.priority.straightness": "100",
        //     "or.eclipse.elk.force.repulsivePower": "10",
        // },
        layoutOptions: {
            "elk.algorithm": "stress",
        },
        children: [...pg.nodes].map(state => ({
            id: s(state.id),
            width: radius,
            height: radius,
        })),
        edges: getTransitions(pg).map(({from, to}) => ({
            id: `${from}-${to}`,
            labels: [],
            sources: [s(from)],
            targets: [s(to)],
        })),
    };

    const layout = await elk.layout(graph);
    return Object.fromEntries(
        layout.children!.map(({id, x, y}) => [Number(id), {x: x!, y: y!}])
    );
}
