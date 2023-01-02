import {Range, editor as Editor} from "monaco-editor";
import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {Header} from "./Header";
import {combineOptions} from "./util/combineOptions";
import {useAnnotationRemover} from "./components/editor/useAnnotationsRemover";
import {ExampleModal} from "./examples/ExampleModal";
import {useLazyRef} from "./util/useLazyRef";
import {State} from "./model/State";
import {Sidebar} from "./components/Sidebar";
import {PGComp} from "./components/pg/PGComp";
import {PGGraphState} from "./components/pg/graph/PGGraphState";
import {Info} from "./Info";

const theme = getTheme();
export const App: FC = () => {
    const editorState = useLazyRef(() => {
        const state = new State();
        state.setPG(`parity 1;
0 34 0 0,1 yes;
1 2 1  no;`);
        return new PGGraphState(state);
    }).current;
    const {PGState: state} = editorState;

    // Small hidden feature to aid with testing
    // useEffect(() => {
    //     const listener = (event: KeyboardEvent) => {
    //         if (event.key == "p")
    //             state
    //                 .getFormulas()
    //                 .forEach(formula =>
    //                     formula.setAlgoritm(
    //                         formula.getAlgoritm() == "EmersonLei" ? "naive" : "EmersonLei"
    //                     )
    //                 );
    //     };
    //     window.addEventListener("keydown", listener);
    //     return () => window.removeEventListener("keydown", listener);
    // }, [state]);

    return (
        <div>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css"
            />
            <Stack
                styles={{
                    root: {
                        height: "100%",
                        overflow: "hidden",
                        background: theme.palette.neutralLight,
                    },
                }}>
                <StackItem>
                    <Header info={<Info />}>
                        <ExampleModal
                            onLoad={async text => {
                                const simplified = text.split("\n").length > 20;
                                if (simplified) {
                                    editorState.enableSimplifiedView(true);
                                    editorState.setCodeEditorVisible(false);
                                }

                                await new Promise(res => setTimeout(res, 100)); // Add time for a rerender of the simplified view

                                state.setPG(text);
                                state.clearPoses();

                                if (!simplified) {
                                    await state.layout();
                                    editorState.autoPosition();
                                    editorState.enableSimplifiedView(false);
                                }
                            }}
                        />
                    </Header>
                </StackItem>
                <StackItem grow={1} style={{minHeight: 0, marginTop: theme.spacing.m}}>
                    <Stack horizontal styles={{root: {height: "100%"}}}>
                        <StackItem
                            align="stretch"
                            grow={1}
                            shrink={1}
                            styles={{root: {flexBasis: 0, minWidth: 0}}}>
                            <PGComp editorState={editorState} />
                        </StackItem>
                        <StackItem
                            style={{
                                marginLeft: theme.spacing.m,
                                minWidth: 200,
                                boxShadow: theme.effects.elevation8,
                                zIndex: 100,
                            }}>
                            <Sidebar state={state} />
                        </StackItem>
                    </Stack>
                </StackItem>
            </Stack>
        </div>
    );
};
