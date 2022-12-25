import {IParityGame, IParityNode} from "../../_types/IParityGame";

/**
 * The function usable for ordering the node measure progressing
 */
export type IProgressOrder = (game: IParityGame) => Generator<IParityNode, void, boolean>;
