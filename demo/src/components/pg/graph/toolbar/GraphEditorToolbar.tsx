import {DirectionalHint, FontIcon, getTheme, Slider} from "@fluentui/react";
import {Field, useDataHook} from "model-react";
import {config} from "process";
import React, {FC, useCallback, useEffect} from "react";
import {drawGraph} from "../layout/drawGraph";
import {PGGraphState} from "../PGGraphState";
import {IGraphEditorConfig} from "../_types/IGraphEditorConfig";
import {EditorSettings} from "./EditorSettings";
import {ExpandableSidebarButton} from "./ExpandableSidebarButton";
import {SidebarButton} from "./SidebarButton";
import {SnapControls} from "./SnapControls";

export const GraphEditorToolbar: FC<{
    state: PGGraphState;
}> = ({state}) => {
    const [h] = useDataHook();
    const updateConfig = useCallback(
        (getNewConfig: (cfg: IGraphEditorConfig) => IGraphEditorConfig) => {
            const config = state.getConfig();
            state.setConfig(getNewConfig(config));
        },
        [state]
    );

    const onDelete = useCallback(() => {
        const {PGState: LTSState} = state;
        const selected = state.getSelection();
        if (selected?.type == "node") LTSState.removeNode(selected.node);
        else if (selected?.type == "arc")
            LTSState.removeTransition(selected.from, selected.to);
    }, [state]);

    const cfg = state.getConfig(h);
    return (
        <div
            className="toolbar"
            style={{
                zIndex: 1,
                display: "flex",
                position: "relative",
            }}>
            <SidebarButton
                icon="Edit"
                hover="Edit node positions and arc labels (E)"
                title="Edit positions"
                onClick={() => state.setSelectedTool("select")}
                selected={state.getSelectedTool(h) == "select"}
            />
            <SidebarButton
                icon="Add"
                hover="Add nodes (A)"
                title="Add nodes"
                onClick={() => state.setSelectedTool("add")}
                selected={state.getSelectedTool(h) == "add"}
            />
            <SidebarButton
                icon="Line"
                hover="Connect nodes with arcs, drag from one node to another (C)"
                title="Connect nodes"
                onClick={() => state.setSelectedTool("connect")}
                selected={state.getSelectedTool(h) == "connect"}
            />
            <div style={{width: 50}} />

            {/* Actions */}
            <SidebarButton
                icon="Delete"
                hover="Delete the selected node or arc (D)"
                title="Delete item"
                onClick={onDelete}
            />
            <SidebarButton
                icon="GitGraph"
                hover="Auto format layout"
                title="Auto layout"
                onClick={async () => {
                    await state.PGState.layout();
                    state.autoPosition();
                }}
            />

            {/* Extra visual settings */}
            <div style={{flex: 1}} />
            <SidebarButton
                icon="Code"
                hover="Show text editor"
                title="Show text editor"
                onClick={() => state.setCodeEditorVisible(!state.isCodeEditorVisible())}
                selected={state.isCodeEditorVisible(h)}
            />
            <SidebarButton
                icon="Info"
                hover="Show PG info instead of graph"
                title="Show info"
                onClick={() => state.enableSimplifiedView(!state.useSimplifiedView())}
                selected={state.useSimplifiedView(h)}
            />
            <div style={{width: 20}} />
            <SnapControls state={state} />
            <SidebarButton
                icon={
                    {
                        none: "GridViewLarge",
                        major: "GridViewMedium",
                        minor: "GridViewSmall",
                    }[cfg.grid]
                }
                hover="Grid display options"
                title="Grid display"
                onClick={() => {
                    const options = ["none", "major", "minor"] as const;
                    const index = options.indexOf(cfg.grid);
                    updateConfig(cfg => ({
                        ...cfg,
                        grid: options[(index + 1) % options.length],
                    }));
                }}
                selected={cfg.grid != "none"}
            />
            <SidebarButton
                icon="Add"
                hover="Show axis"
                title="Show axis"
                onClick={() => updateConfig(cfg => ({...cfg, showAxis: !cfg.showAxis}))}
                selected={cfg.showAxis}
            />
            {/* <EditorSettings state={state} /> */}
        </div>
    );
};
