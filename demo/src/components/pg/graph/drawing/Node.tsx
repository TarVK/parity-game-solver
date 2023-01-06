import {getTheme} from "@fluentui/react";
import {useDataHook} from "model-react";
import React, {FC} from "react";
import {oddColor, evenColor} from "../../../../colors";
import {State} from "../../../../model/State";
import {PGGraphState} from "../PGGraphState";

export const radius = 14;
export const Node: FC<{editorState: PGGraphState; node: number}> = ({
    editorState,
    node,
}) => {
    const theme = getTheme();
    const [h] = useDataHook();
    const {PGState} = editorState;
    const pos = PGState.getNodePos(node, h);

    const selection = editorState.getSelection(h);
    const selected = selection?.type == "node" && selection.node == node;

    const winner = PGState.getNodeWinner(node, h);
    const wonByEven = winner == 0;
    const wonByOdd = winner == 1;

    const isMainNode = node == 0;

    const nodeData = PGState.getNodeData(node, h);
    const ownedByEven = nodeData?.owner == 0;

    return (
        <g id={`${node}`}>
            <rect
                style={{
                    fill: wonByEven ? evenColor : wonByOdd ? oddColor : "white",
                    stroke: selected ? theme.palette.themePrimary : "#000",
                    strokeWidth: isMainNode ? 3 : 1,
                    strokeMiterlimit: 40,
                    cursor:
                        editorState.getSelectedTool(h) != "add" ? "pointer" : "default",
                }}
                x={-radius}
                y={-radius}
                width={radius * 2}
                height={radius * 2}
                transform={`translate(${pos.x}, ${-pos.y}) ${
                    ownedByEven ? "rotate(45 0 0)" : ""
                }`}
            />
            <text
                style={{
                    cursor:
                        editorState.getSelectedTool(h) != "add" ? "pointer" : "default",
                }}
                x={pos.x}
                y={-pos.y}
                fontSize={15}
                textAnchor="middle"
                dy=".3em">
                {nodeData?.priority ?? 0}
            </text>
            <text
                x={pos.x}
                y={-pos.y + radius * (1 + (ownedByEven ? Math.sqrt(2) : 1))}
                fontSize={15}
                textAnchor="middle"
                dy=".3em"
                style={{
                    paintOrder: "stroke",
                    stroke: "white",
                    strokeWidth: 4,
                    strokeLinecap: "butt",
                    strokeLinejoin: "miter",
                }}>
                {nodeData?.name ?? node}
            </text>
        </g>
    );
};
