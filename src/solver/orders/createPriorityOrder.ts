import {IParityGame, IParityNode} from "../../_types/IParityGame";
import {getOrderFromList} from "./orderStrategies/getOrderFromList";
import {IProgressOrder} from "../_types/IProgressOrder";
import {IOrderFactory} from "./_types/IOrderFactory";

/**
 * creates a small progress measure order, based on the node priority (decreasing)
 * @param getOrder The order strategy type
 * @returns The order generator
 */
export const createPriorityOrder =
    (getOrder: IOrderFactory = getOrderFromList) =>
    (game: IParityGame) =>
        getOrder([...game.nodes].sort((a, b) => b.priority - a.priority));
