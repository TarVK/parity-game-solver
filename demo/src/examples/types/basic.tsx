import {
    Dropdown,
    getTheme,
    Label,
    Stack,
    StackItem,
    TextField,
    Toggle,
} from "office-ui-fabric-react";
import React, {MutableRefObject, useCallback, useState} from "react";
import {InlineTex, Tex} from "react-tex";
import {genList} from "../../util/genList";
import {br} from "../latex";

const theme = getTheme();
export const basic = {
    name: "Basic",
    Comp: ({getCode}: {getCode: MutableRefObject<() => Promise<string>>}) => {
        getCode.current = useCallback(
            async () => `parity 22;
0 0 1 1;
1 0 1 2,3,11;
2 0 1 4,5,12;
3 0 1 5,6,13;
4 0 1 7,14;
5 0 1 15;
6 0 1 8,16;
7 0 1 9,17;
8 0 1 10,18;
9 0 1 1,19;
10 0 1 1,20;
11 1 0 22;
12 1 0 22;
13 1 0 22;
14 1 0 21;
15 1 0 22;
16 1 0 21;
17 1 0 22;
18 1 0 22;
19 1 0 22;
20 1 0 22;
21 2 0 21;
22 3 0 22;
`,
            []
        );

        return <>A simple parity game</>;
    },
};