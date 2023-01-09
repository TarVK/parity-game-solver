import {getRandomizer} from "../../utils/getRandomizer";
import {IParityGame, IParityNode} from "../../_types/IParityGame";
import {getOrderFromList} from "./orderStrategies/getOrderFromList";
import {IOrderFactory} from "./_types/IOrderFactory";

/**
 * Creates a new random order according to the given seed
 * @param seed The seed for the random order
 * @param getOrder The order strategy type
 * @returns An order generator that creates a random order
 */
export const createRandomOrder =
    (seed: number = 0, getOrder: IOrderFactory = getOrderFromList) =>
    (game: IParityGame) => {
        const order = [...game.nodes];
        shuffleArray(order, getRandomizer(seed));
        return getOrder(order);
    };

// Source: https://stackoverflow.com/a/12646864/8521718
function shuffleArray(array: any[], random: () => number = getRandomizer(0)) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
