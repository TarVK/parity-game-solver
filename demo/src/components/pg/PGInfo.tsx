import {getTheme, Label, Spinner, Stack, StackItem} from "@fluentui/react";
import {useDataHook, useMemoDataHook} from "model-react";
import React, {ChangeEventHandler, FC, useCallback, useMemo, useState} from "react";
import {State} from "../../model/State";
import {getTransitions} from "./graph/util/getTransitions";

export const PGInfo: FC<{state: State}> = ({state}) => {
    const theme = getTheme();
    const [h] = useDataHook();

    const pg = state.getPG(h);
    const transitionCount = useMemo(() => {
        if (!pg) return;
        return pg.nodes.reduce((count, node) => count + node.successors.length, 0);
    }, [pg]);

    const [loading, setLoading] = useState(false);
    const selectText = useCallback<ChangeEventHandler<HTMLInputElement>>(
        async e => {
            setLoading(true);
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const text = await file.text();
                state.clearPoses();
                state.setPG(text);
            } finally {
                setLoading(false);
            }
        },
        [state]
    );

    return (
        <div
            style={{padding: theme.spacing.m, maxWidth: "100%", boxSizing: "border-box"}}>
            {pg && (
                <div style={{width: 200}}>
                    <Stack horizontal>
                        <StackItem grow={1}>
                            {" "}
                            <Label>Node count</Label>{" "}
                        </StackItem>
                        {pg.nodes.length + ""}
                    </Stack>
                    <Stack horizontal>
                        <StackItem grow={1}>
                            {" "}
                            <Label>Transition count</Label>{" "}
                        </StackItem>
                        {transitionCount}
                    </Stack>
                    <Stack horizontal>
                        <StackItem grow={1}>
                            {" "}
                            <Label>Max priority</Label>{" "}
                        </StackItem>
                        {pg.maxPriority}
                    </Stack>
                </div>
            )}

            <div style={{marginTop: 20}}>
                <Label>Select file</Label>
                <div style={{display: "flex"}}>
                    <input type="file" accept="text" onChange={selectText} />{" "}
                    {loading && <Spinner style={{display: "inline"}} />}
                </div>
            </div>
        </div>
    );
};
