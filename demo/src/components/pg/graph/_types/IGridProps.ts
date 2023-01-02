import {IPoint} from "../../../../_types/IPoint";

export type IGridProps = {
    gridSize: number;
    scale: number;
    offset: IPoint;
    type: "none" | "minor" | "major";
};
