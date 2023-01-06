import {IParityNode} from "../../../_types";

/**
 * A factory for order generators
 */
export type IOrderFactory = (
    list: IParityNode[]
) => Generator<IParityNode, void, boolean>;
