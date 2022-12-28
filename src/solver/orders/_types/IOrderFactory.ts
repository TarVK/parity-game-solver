/**
 * A factory for order generators
 */
export type IOrderFactory = <T>(list: T[]) => Generator<T, void, boolean>;
