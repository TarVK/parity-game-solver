import {ISyntaxError} from "../../_types/ISyntaxError";
import {Range, editor as Editor} from "monaco-editor";
import {useEffect, useState} from "react";

/**
 * Highlights the given error in the editor
 * @param getError A function to retrieve the current errors
 * @param editorRef A reference to the editor
 * @param afterDelay The number of milliseconds of inactivity in the editor after which errors will be highlighted
 */
export function useErrorHighlighter(
    getError: () => ISyntaxError | null,
    editorRef: React.MutableRefObject<Editor.IStandaloneCodeEditor | undefined>,
    afterDelay: number = 1000
) {
    const [error, setError] = useState<ISyntaxError | null>(null);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            let prev = 0;
            const disposable = editor.onDidChangeModelContent(() => {
                clearTimeout(prev);
                prev = setTimeout(() => {
                    setError(getError());
                }, afterDelay) as any;
            });

            return () => disposable.dispose();
        }
    }, [editorRef.current]);

    useEffect(() => {
        const editor = editorRef.current;

        // // Resize the editor on changes (sidebar may have changed size)
        // if (editor) editor.layout();

        // Highlight syntax errors in the editor
        if (error && editor) {
            const index = error.index;
            const text = editor.getValue();
            const range = new Range(
                index.line,
                index.column,
                index.line,
                index.column + 1
            );

            const decorations = editor.deltaDecorations(
                [],
                [
                    {
                        range,
                        options: {
                            // Fixes the issue of there not being a character to highlight at the end of a line
                            before:
                                index.offset == text.length
                                    ? {inlineClassName: "error", content: " "}
                                    : undefined,
                            marginClassName: "errorMargin",
                            inlineClassName: "error",
                            overviewRuler: {
                                color: "rgb(179, 82, 82)",
                                position: Editor.OverviewRulerLane.Left,
                            },
                            hoverMessage: {value: error.message},
                        },
                    },
                    {
                        range,
                        options: {
                            className: "errorLine",
                            isWholeLine: true,
                        },
                    },
                ]
            );
            return () => void editor.deltaDecorations(decorations, []);
        }
    }, [error]);
}
