import {IParityNode} from "../../_types/IParityGame";

export type IProgressMeasure = number[] | "T";
export type IProgressMeasures = Map<IParityNode, IProgressMeasure>;
