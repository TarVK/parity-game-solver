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
import {getRemotePG} from "../getRemotePG";
import {br} from "../latex";

const theme = getTheme();
export const basic = {
    name: "Basic",
    Comp: ({getCode}: {getCode: MutableRefObject<() => Promise<string>>}) => {
        const [type, setType] = useState(0);
        const types = [
            {
                name: "carry",
                text: "Carry",
            },
            {
                name: "cases",
                text: "Cases",
            },
            {
                name: "funnel",
                text: "Funnel",
            },
            {
                name: "t1",
                text: "T1",
            },
            {
                name: "t2",
                text: "T2",
            },
            {
                name: "t3",
                text: "T3",
            },
            {
                name: "two-cycles",
                text: "Two cycles",
            },
            {
                name: "wiki",
                text: "Wiki",
            },
        ];

        getCode.current = useCallback(
            async () => await getRemotePG(`own/${types[type].name}.gm`),
            [type]
        );

        return (
            <>
                Some simple test parity games, not necessarily modeling anything from the
                real world.
                <p style={{clear: "both"}}>
                    <Dropdown
                        placeholder="Formula"
                        label="Formula"
                        options={types.map(({text}, i) => ({
                            key: i,
                            text,
                            data: i,
                            selected: type == i,
                        }))}
                        onChange={(e, option) => {
                            option && setType(option.data);
                        }}
                    />
                </p>
            </>
        );
    },
};
