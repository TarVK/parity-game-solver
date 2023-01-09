import {IParityGame, IParityNode} from "../../_types/IParityGame";
import {getOrderFromList} from "./orderStrategies/getOrderFromList";
import {IProgressOrder} from "../_types/IProgressOrder";
import {IOrderFactory} from "./_types/IOrderFactory";

/**
 * creates a small progress measure order, simply based on the node order in the game
 * @param getOrder The order strategy type
 * @returns The order generator
 */
export const createInputOrder =
    (getOrder: IOrderFactory = getOrderFromList) =>
    (game: IParityGame) =>
        getOrder(game.nodes);
