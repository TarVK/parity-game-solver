import {IParityGame} from "../../_types/IParityGame";
import {getOrderFromList} from "./orderStrategies/getOrderFromList";
import {IOrderFactory} from "./_types/IOrderFactory";

/**
 * Creates a small progress measure order, based on the largest possible gain being first
 * @param getOrder The order strategy type
 * @returns The order generator
 */
export const createGainOrder =
    (getOrder: IOrderFactory = getOrderFromList) =>
    (game: IParityGame) =>
        getOrder(
            game.nodes.sort((a, b) => {
                if (!a.isEvenPriority && b.isEvenPriority) return -1;
                if (a.isEvenPriority && !b.isEvenPriority) return 1;
                if (a.owner == 1 && b.owner == 0) return -1;
                if (a.owner == 0 && b.owner == 1) return 1;
                return a.priority - b.priority;
            })
        );
