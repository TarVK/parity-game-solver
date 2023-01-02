import {makeStyles} from "@fluentui/react-theme-provider";
import {loader, useMonaco} from "@monaco-editor/react";
import {languages, editor} from "monaco-editor/esm/vs/editor/editor.api";
import React, {FC, useRef, useEffect, useState, useCallback} from "react";

const useStyle = makeStyles({
    editorStyle: {
        ".error": {
            backgroundColor: "rgb(237, 155, 155)",
        },
        ".errorLine": {
            backgroundColor: "rgb(255, 239, 239)",
        },
        ".errorMargin": {
            backgroundColor: "rgb(248, 217, 217)",
        },
    },
});

let id = 0;

/**
 * Returns an editor element, and the editor that was created
 * @param config The configuration for the editor
 * @returns The element and editor ref
 */
export const useEditor = ({
    value,
    height,
    options,
}: {
    value: string;
    height: string;
    options: editor.IStandaloneEditorConstructionOptions;
}) => {
    const monaco = useMonaco();
    const elementRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor>();
    const {editorStyle} = useStyle();

    const [_, init] = useState(0);
    useEffect(() => {
        if (!monaco) return;

        if (elementRef.current) {
            const modelUri = monaco.Uri.parse(`a://b/smth${id++}.smth`); // a made up unique URI for our model
            const model = monaco.editor.createModel(value, options.language, modelUri);
            model.setEOL(monaco.editor.EndOfLineSequence.LF);
            const e = (editorRef.current = monaco.editor.create(elementRef.current, {
                value: value,
                folding: true,
                foldingStrategy: "auto",
                // showFoldingControls: "always",
                ...options,
                model,
            }));

            const resizeListener = () => e.layout();
            window.addEventListener("resize", resizeListener);
            init(x => x + 1);

            return () => {
                e.dispose();
                window.removeEventListener("resize", resizeListener);
            };
        }
    }, [monaco, elementRef.current]);
    const onMount = useCallback((el: HTMLDivElement) => {
        (elementRef as any).current = el;
        init(x => x + 1);
    }, []);

    return [
        <section
            className={editorStyle}
            style={{
                display: "flex",
                position: "relative",
                textAlign: "initial",
                height,
            }}>
            {monaco ? <div ref={onMount} style={{width: "100%"}} /> : "Loading..."}
        </section>,
        editorRef,
    ] as const;
};
