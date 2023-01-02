import {loader, useMonaco} from "@monaco-editor/react";

export const DESLanguage = "DES";
export const formulaLanguage = "Formula";
export const customTheme = "theme";

loader.init().then(m => {
    m.languages.register({id: DESLanguage});
    m.languages.setMonarchTokensProvider(DESLanguage, {
        tokenizer: {
            root: [
                [/des/, {token: "keyword", next: "metadata"}],
                [/(\(|\))+/, "bracket"],
                [/(\||\&|\!|\=|\<|\>)+/, "operator"],
                [/(\w|\d|-)+/, "variable"],
                [/(\"\w*\")/, "string"],
            ],
            metadata: [
                [/\(/, {token: "keyword"}],
                [/\)/, {token: "keyword", next: "root"}],
                [/(\w|\d|-)+/, "variable"],
            ],
        },
    });

    m.languages.register({id: formulaLanguage});
    m.languages.setMonarchTokensProvider(formulaLanguage, {
        tokenizer: {
            root: [
                [/(mu|nu|true|false)+/, "keyword"],
                [/(\(|\))+/, "bracket"],
                [/(\||\&|\!|\[|\]|\<|\>)+/, "operator"],
                [/\w+/, "variable"],
            ],
        },
    });

    m.editor.defineTheme(customTheme, {
        base: "vs",
        inherit: false,
        rules: [
            {token: "bracket", foreground: "000000"},
            {token: "operator", foreground: "2299cc", fontStyle: "bold"},
            {token: "variable", foreground: "497c9c"},
            {token: "keyword", foreground: "2299cc"},
            {token: "string", foreground: "0078d4"},
        ],
        colors: {},
    });
});
