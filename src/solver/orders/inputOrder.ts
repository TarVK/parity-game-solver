import {IParityGame, IParityNode} from "../../_types/IParityGame";
import {getOrderFromList} from "../getOrderFromList";
import {IProgressOrder} from "../_types/IProgressOrder";

/**
 * A small progress measure order, simply based on the node order in the game
 */
export function* inputOrder(game: IParityGame): Generator<IParityNode, void, boolean> {
    yield* getOrderFromList(game.nodes);
}
