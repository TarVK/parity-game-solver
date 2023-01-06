import React, {FC, useEffect, useRef} from "react";
import {getTheme, Stack, StackItem} from "@fluentui/react";
import {State} from "../../model/State";
import {useEditor} from "../editor/useEditor";
import {useAnnotationRemover} from "../editor/useAnnotationsRemover";
import {useDataHook} from "model-react";
import {useErrorHighlighter} from "../editor/useErrorHighlighter";
import {useLazyRef} from "../../util/useLazyRef";
import {PGGraphState} from "./graph/PGGraphState";
import {PGComp} from "./PGComp";
import {customTheme, DESLanguage} from "../editor/CustomLanguageMonacoDefinition";

const theme = getTheme();
export const PGCodeEditor: FC<{state: PGGraphState}> = ({state}) => {
    const {PGState} = state;

    const [editor, editorRef] = useEditor({
        value: PGState.getPGText(),
        height: "100%",
        options: {
            minimap: {enabled: false},
            scrollbar: {useShadows: false},
            scrollBeyondLastLine: false,
            language: DESLanguage,
            theme: customTheme,
        },
    });

    useAnnotationRemover(editorRef.current);
    useErrorHighlighter(() => PGState.getPGErrors(), editorRef);

    useEffect(() => {
        const editor = editorRef.current;
        const model = editor?.getModel();
        if (editor && model) {
            const disposable = editor.onDidChangeModelContent(() => {
                versionRef.current = model.getVersionId();
                PGState.setPG(editor.getValue());
            });

            return () => disposable?.dispose();
        }
    }, [editorRef.current]);

    const [h] = useDataHook();
    const pgText = PGState.getPGText(h);
    const versionRef = useRef(0);
    useEffect(() => {
        const editor = editorRef.current;
        const model = editor?.getModel();
        if (editor && editor.getValue() != pgText && model) {
            const current = editor.getValue();
            if (current.trim() == pgText.trim()) return;

            // editor.setValue(ltsText);
            const fullRange = model.getFullModelRange();
            versionRef.current++;
            editor.executeEdits("graphical", [
                {
                    text: pgText,
                    range: fullRange,
                },
            ]);
        }
    }, [pgText]);

    const shown = state.isCodeEditorVisible(h);
    useEffect(() => {
        const editor = editorRef.current;
        if (editor) editor.layout();
    }, [shown]);

    return (
        <Stack
            horizontal
            styles={{
                root: {
                    height: "100%",
                    flex: shown ? 0.4 : 0,
                    width: shown ? "auto" : 0,
                    overflow: "hidden",
                },
            }}>
            <StackItem
                align="stretch"
                grow={1}
                shrink={1}
                styles={{root: {flexBasis: 0, minWidth: 0}}}>
                {editor}
            </StackItem>
        </Stack>
    );
};
