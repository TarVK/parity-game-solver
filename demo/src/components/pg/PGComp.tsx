import {Field, useDataHook} from "model-react";
import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {State} from "../../model/State";
import {getDistance} from "./graph/util/getDistance";
import {EditorPlane} from "./graph/grid/EditorPlane";
import {IInteractionHandler} from "./graph/grid/_types/IInteractionHandler";
import {PGGraphState} from "./graph/PGGraphState";
import {radius} from "./graph/drawing/Node";
import {Shapes} from "./graph/drawing/Shapes";
import {PGCodeEditor} from "./PGCodeEditor";
import {GraphEditorToolbar} from "./graph/toolbar/GraphEditorToolbar";
import {
    Dropdown,
    getTheme,
    IDropdown,
    ITextField,
    mergeStyles,
    TextField,
} from "@fluentui/react";
import {useLazyRef} from "../../util/useLazyRef";
import {IPoint} from "../../_types/IPoint";
import {StandardModal} from "../Modal";
import {Arc} from "./graph/drawing/Arc";
import {PGInfo} from "./PGInfo";

export const PGComp: FC<{editorState: PGGraphState}> = ({editorState}) => {
    const theme = getTheme();
    const [h] = useDataHook({debounce: -1});
    const {PGState: state} = editorState;

    const dragging = useRef(false);

    const arcStartNodeRef = useRef<null | number>(null);
    const [arcStartNode, setArcStartNode] = useState<null | number>(null);
    const mousePos = useRef(new Field<IPoint>({x: 0, y: 0}));

    const [nodePos, setNodePos] = useState<null | IPoint>(null);
    const [nodeName, setNodeName] = useState("");
    const [nodeOwner, setNodeOwner] = useState<0 | 1>(0);
    const [nodePriority, setNodePriority] = useState("");

    const movedAmount = useRef(0);

    const editingNode = editorState.getEditingNode(h);
    useEffect(() => {
        if (editingNode) {
            setNodeName(editingNode.name ?? "");
            if (editingNode.owner != undefined) setNodeOwner(editingNode.owner);
            if (editingNode.priority != undefined)
                setNodePriority(editingNode.priority + "");
        }
    }, [editingNode]);

    const nodeOwnerEl = useRef<IDropdown>(null);
    const nodeNameEl = useRef<ITextField>(null);
    const nodePriorityEl = useRef<ITextField>(null);

    const showModal = !!(editingNode || nodePos);
    useEffect(() => {
        if (showModal) setTimeout(() => nodeOwnerEl.current?.focus(), 100);
    }, [showModal]);

    const editingTool = editorState.getSelectedTool(h) == "select";
    useEffect(() => {
        if (!editingTool) editorState.setSelection(null);
    }, [editingTool]);

    const getNode = useCallback(
        (point: IPoint): number | null => {
            const nodes = state.getNodes();
            for (let s of nodes) {
                const dist = getDistance(point, state.getNodePos(s.id));
                if (dist < radius) return s.id;
            }
            return null;
        },
        [state]
    );
    const onMouseDown = useCallback<IInteractionHandler>(
        (evt, point) => {
            if (evt.button != 0) return;

            const tool = editorState.getSelectedTool();
            if (tool == "select") {
                const s = getNode(point);
                if (s != null) {
                    const selection = editorState.getSelection();
                    if (selection?.type == "node" && selection.node == s) {
                        movedAmount.current = 0;
                    } else {
                        editorState.setSelection({type: "node", node: s});
                        movedAmount.current = -1;
                    }
                    dragging.current = true;
                }
            } else if (tool == "add") {
                const snappedPoint = editorState.snap(point);
                setNodePos(snappedPoint);
            } else if (tool == "connect") {
                const s = getNode(point);
                arcStartNodeRef.current = s;
                setArcStartNode(s);
            }

            // evt.preventDefault();
            // evt.stopPropagation();
        },
        [state]
    );

    const onMouseUp = useCallback<IInteractionHandler>(
        (evt, point) => {
            dragging.current = false;

            const tool = editorState.getSelectedTool();
            if (tool == "connect") {
                const to = getNode(point);

                const from = arcStartNodeRef.current;
                if (from != null && to != null) state.addTransition(from, to);
            } else if (tool == "select") {
                if (movedAmount.current >= 5 || movedAmount.current < 0) return;

                const selection = editorState.getSelection();
                if (selection?.type == "node") {
                    const node = state.getNodeData(selection.node);
                    if (node) editorState.setEditingNode(node);
                }
            }
            setArcStartNode(null);
        },
        [state]
    );

    const onMouseMove = useCallback<IInteractionHandler>(
        (evt, point, delta) => {
            mousePos.current.set(point);
            const dx = evt.movementX;
            const dy = evt.movementY;

            if (movedAmount.current >= 0)
                movedAmount.current += Math.sqrt(dx * dx + dy * dy);
            if (dragging.current) {
                const selection = editorState.getSelection();
                if (selection?.type == "node") {
                    const snappedPoint = editorState.snap(point);
                    state.setNodePos(selection.node, snappedPoint);
                }
            }
            evt.preventDefault();
        },
        [state]
    );

    const onMouseLeave = useCallback(() => {
        dragging.current = false;
    }, [state]);

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key == "d" || event.key == "Delete") {
                const selection = editorState.getSelection();
                if (!selection) return;
                if (selection.type == "node") {
                    state.removeNode(selection.node);
                } else {
                    state.removeTransition(selection.from, selection.to);
                }
            }
            if (event.key == "e") editorState.setSelectedTool("select");
            if (event.key == "a") editorState.setSelectedTool("add");
            if (event.key == "c") editorState.setSelectedTool("connect");
        },
        [state]
    );

    const updateNode = () => {
        let priority = Number(nodePriority);
        if (isNaN(priority)) priority = 0;

        const name = nodeName == "" ? undefined : nodeName;

        setNodeName("");
        editorState.setEditingNode(null);
        setNodePos(null);

        if (editingNode) {
            state.setNodeData(editingNode.id, nodeOwner, priority, name);
        } else if (nodePos) {
            state.addNode(nodePos, nodeOwner, priority, name);
        }

        nodeOwnerEl.current?.focus();
    };
    const simplified = editorState.useSimplifiedView(h);

    return (
        <div
            className={style}
            style={{
                width: "100%",
                height: "100%",
                background: "white",
            }}>
            <GraphEditorToolbar state={editorState} />
            <div className="content">
                <PGCodeEditor state={editorState} />
                {!simplified ? (
                    <EditorPlane
                        width={"auto"}
                        height={"100%"}
                        state={editorState}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onKeyDown={onKeyDown}
                        onMouseLeave={onMouseLeave}>
                        <Shapes state={editorState}>
                            {arcStartNode != null && (
                                <Arc
                                    editorState={editorState}
                                    from={arcStartNode}
                                    to={mousePos.current}
                                    toDelta={0}
                                />
                            )}
                        </Shapes>
                    </EditorPlane>
                ) : (
                    <PGInfo state={state} />
                )}
            </div>

            <StandardModal title="Edit node" visible={showModal} onClose={updateNode}>
                <Dropdown
                    placeholder="Select an option"
                    componentRef={nodeOwnerEl}
                    label="Owner"
                    options={[
                        {
                            key: "0",
                            data: 0 as const,
                            text: "Even",
                            selected: nodeOwner == 0,
                        },
                        {
                            key: "1",
                            data: 1 as const,
                            text: "Odd",
                            selected: nodeOwner != 0,
                        },
                    ]}
                    notifyOnReselect
                    onChange={(e, option) => {
                        if (option) {
                            setNodeOwner(option.data);
                            nodePriorityEl.current?.focus();
                        }
                    }}
                />
                <TextField
                    componentRef={nodePriorityEl}
                    styles={{root: {marginTop: theme.spacing.m}}}
                    value={nodePriority}
                    onChange={(e, v) => v != null && setNodePriority(v)}
                    onKeyDown={evt => {
                        if (evt.key == "Enter") {
                            nodeNameEl.current?.focus();
                        }
                        evt.stopPropagation();
                    }}
                    label="Priority"
                />
                <TextField
                    componentRef={nodeNameEl}
                    styles={{root: {marginTop: theme.spacing.m}}}
                    value={nodeName}
                    onChange={(e, v) => v != null && setNodeName(v)}
                    onKeyDown={evt => {
                        if (evt.key == "Enter") updateNode();
                        evt.stopPropagation();
                    }}
                    label="Name (optional)"
                />
            </StandardModal>
        </div>
    );
};

const style = mergeStyles({
    display: "flex",
    flexDirection: "column",
    ".plane": {
        flexGrow: 1,
    },
    ".content": {
        display: "flex",
        flex: 1,
        minHeight: 0,
    },
    ".codeEditor": {
        boxShadow: "rgb(0 0 0 / 25%) 3px 0px 10px 0px",
        // Cut off the box shadow at the top
        clipPath: "polygon(0 0, 0px 10000px, 10000px 10000px, 10000px 0px)",
    },
    ".toolbar": {
        boxShadow: "rgb(0 0 0 / 25%) 0px 3px 10px 0px",
    },
});
