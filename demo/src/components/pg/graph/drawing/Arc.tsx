import {getTheme} from "@fluentui/react";
import {Field, useDataHook} from "model-react";
import React, {FC} from "react";
import {State} from "../../../../model/State";
import {getDistance} from "../util/getDistance";
import {PGGraphState} from "../PGGraphState";
import {radius} from "./Node";
import {IPoint} from "../../../../_types/IPoint";

const theme = getTheme();
export const Arc: FC<{
    editorState: PGGraphState;
    from: number;
    to: number | Field<IPoint>;
    toDelta?: number;
}> = ({editorState, from, to, toDelta}) => {
    const [h] = useDataHook();
    const {PGState} = editorState;

    const selection = editorState.getSelection(h);
    const arcSelected =
        selection?.type == "arc" && selection.from == from && selection.to == to;
    const stroke = arcSelected ? theme.palette.themePrimary : "#000";
    const head = arcSelected ? "url(#headSelected)" : "url(#head)";

    const select = () => {
        if (typeof to == "number") editorState.setSelection({type: "arc", from, to});
    };

    const fromEven = !!(PGState.getNodeData(from)?.owner == 0);
    const fromPos = PGState.getNodePos(from, h);
    const toPos = typeof to == "number" ? PGState.getNodePos(to, h) : to.get(h);
    const length = getDistance(fromPos, toPos);
    if (length == 0) {
        const offset = fromEven ? Math.sqrt(2) * radius : radius;

        const path = `M${
            offset + fromPos.x
        },${-fromPos.y} A ${offset},${offset} 270 1 0 ${toPos.x},${
            -(offset + 2) - toPos.y
        }`;
        return (
            <>
                <path
                    id={`${from}-${to}`}
                    markerEnd={head}
                    strokeWidth={2}
                    fill="none"
                    stroke={stroke}
                    d={path}
                />
                <path
                    id={`${from}-${to}-collider`}
                    strokeWidth={20}
                    stroke="transparent"
                    fill="none"
                    d={path}
                    onClick={select}
                />
            </>
        );
    }

    const dir = {
        x: (toPos.x - fromPos.x) / length,
        y: (toPos.y - fromPos.y) / length,
    };

    const fromOffsetAmount = getOffset(dir, fromEven ? Math.PI / 4 : 0, radius + 1);
    const fromOffset = {
        x: fromPos.x + dir.x * fromOffsetAmount,
        y: fromPos.y + dir.y * fromOffsetAmount,
    };

    const toEven = typeof to == "number" && !!(PGState.getNodeData(to)?.owner == 0);
    const toOffsetAmount = getOffset(
        dir,
        toEven ? Math.PI / 4 : 0,
        toDelta ?? radius + 2
    );
    const toOffset = {
        x: toPos.x - dir.x * toOffsetAmount,
        y: toPos.y - dir.y * toOffsetAmount,
    };

    const path = `M${fromOffset.x},${-fromOffset.y} ${toOffset.x},${-toOffset.y}`;
    return (
        <>
            <path
                id={`${from}-${to}`}
                markerEnd={head}
                strokeWidth={2}
                fill="none"
                stroke={stroke}
                d={path}
            />
            <path
                id={`${from}-${to}-collider`}
                strokeWidth={20}
                stroke="transparent"
                fill="none"
                d={path}
                onClick={select}
            />
        </>
    );
};

/**
 * Calcuates the distance to the center of a square, if its sides are the given radius away
 * @param direction The direction to get the distance for
 * @param rotation THe rotation of the shape
 * @param radius THe radius of the square
 * @returns The distance
 */
function getOffset(direction: IPoint, rotation: number, radius: number): number {
    const angle = Math.atan2(direction.y, direction.x) + rotation;
    const clampedAngle =
        ((angle + Math.PI / 4 + Math.PI * 2) % (Math.PI / 2)) - Math.PI / 4;
    const edgeOffset = Math.tan(clampedAngle);
    const dist = Math.sqrt(1 + edgeOffset * edgeOffset);

    return dist * radius;
}
