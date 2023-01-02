import {IPoint} from "../../../../_types/IPoint";

/**
 * Gets the distance between two points
 * @param start The start position
 * @param end The end position
 * @returns The distance
 */
export function getDistance(start: IPoint, end: IPoint): number {
    const dx = start.x - end.x;
    const dy = start.y - end.y;
    return Math.sqrt(dx * dx + dy * dy);
}
