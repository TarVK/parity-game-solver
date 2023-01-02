import {
    DirectionalHint,
    FontWeights,
    getTheme,
    IButtonStyles,
    IconButton,
    IIconProps,
    ITooltipHostStyles,
    Label,
    mergeStyleSets,
    Modal,
    Slider,
    TooltipDelay,
    TooltipHost,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import {useDataHook} from "model-react";
import React, {FC, useCallback, useState} from "react";
import {StandardModal} from "../../../Modal";
import {PGGraphState} from "../PGGraphState";
import {IGraphEditorConfig} from "../_types/IGraphEditorConfig";
import {SidebarButton} from "./SidebarButton";

export const EditorSettings: FC<{state: PGGraphState}> = ({state}) => {
    const titleId = useId("title");
    const [modalVisible, setModalVisible] = useState(false);
    const updateConfig = useCallback(
        (getNewConfig: (cfg: IGraphEditorConfig) => IGraphEditorConfig) => {
            const config = state.getConfig();
            state.setConfig(getNewConfig(config));
        },
        [state]
    );

    const [h] = useDataHook();
    const cfg = state.getConfig(h);
    return (
        <>
            <SidebarButton
                icon="Settings"
                hover="Open settings"
                title="Open settings"
                onClick={() => setModalVisible(v => !v)}
            />
            <StandardModal
                title="Editor settings"
                visible={modalVisible}
                onClose={() => setModalVisible(false)}>
                <div style={{height: 50}} />
                <TooltipHost
                    content="Edit zoom speed"
                    id={useId("zoom")}
                    calloutProps={calloutProps}
                    delay={TooltipDelay.long}
                    directionalHint={DirectionalHint.topCenter}
                    styles={hostStyles}>
                    <Label>Zoom sensitivity</Label>
                </TooltipHost>
                <div style={{display: "flex"}}>
                    <Slider
                        styles={{root: {flexGrow: 1}}}
                        min={0.01}
                        max={0.2}
                        step={0.01}
                        value={cfg.zoomSpeed}
                        onChange={value =>
                            updateConfig(cfg => ({
                                ...cfg,
                                zoomSpeed: value,
                            }))
                        }
                        showValue
                        snapToStep
                    />
                </div>
                <TooltipHost
                    content="Edit distance from cursor at which a point is selectable"
                    id={useId("point snap")}
                    calloutProps={calloutProps}
                    delay={TooltipDelay.long}
                    directionalHint={DirectionalHint.topCenter}
                    styles={hostStyles}>
                    <Label>Point selection sensitivity</Label>
                </TooltipHost>
                <div style={{display: "flex"}}>
                    <Slider
                        styles={{root: {flexGrow: 1}}}
                        min={0}
                        max={40}
                        step={1}
                        value={cfg.selectPointDistance}
                        onChange={value =>
                            updateConfig(cfg => ({
                                ...cfg,
                                selectPointDistance: value,
                            }))
                        }
                        showValue
                        snapToStep
                    />
                </div>
            </StandardModal>
        </>
    );
};

const calloutProps = {gapSpace: 0};
const hostStyles: Partial<ITooltipHostStyles> = {root: {display: "inline-block"}};
