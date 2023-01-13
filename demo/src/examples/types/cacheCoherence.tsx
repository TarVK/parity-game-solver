import {
    Dropdown,
    getTheme,
    Label,
    Stack,
    StackItem,
    TextField,
    Toggle,
} from "office-ui-fabric-react";
import React, {FC, MutableRefObject, useCallback, useState} from "react";
import {InlineTex, Tex} from "react-tex";
import {Literal} from "../../components/Literal";
import {genList} from "../../util/genList";
import {getRemotePG} from "../getRemotePG";
import {br} from "../latex";

export const cacheCoherence = {
    name: "Cache coherence",
    Comp: ({getCode}: {getCode: MutableRefObject<() => Promise<string>>}) => {
        const [count, setCount] = useState(2);
        const [type, setType] = useState(0);
        const types = [
            {
                name: "infinite_run_no_access",
                text: "Infinite run no access",
            },
            {
                name: "invariantly_eventually_fair_shared_access",
                text: "Invariantly eventually fair shared access",
            },
        ];

        getCode.current = useCallback(
            async () =>
                await getRemotePG(
                    `cacheCoherence/german_linear_${count}.${types[type].name}.gm`
                ),
            [count, type]
        );

        return (
            <>
                Cache coherence is the problem of dealing with caching in a setting where
                multiple clients modify the same resource, and have layers of cache on top
                of the resource. Data may accidentally (temporarily) be written to cache
                only and not be available to the other clients. Steven German specified a
                protocol that deals with this problem, which can be modelled using a LTS.
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
                    <Dropdown
                        placeholder="Client count"
                        label="Client count"
                        options={new Array(4).fill(null).map((_, i) => {
                            const v = i + 2;
                            return {
                                key: v,
                                text: v + "",
                                data: v,
                                selected: count == v,
                            };
                        })}
                        onChange={(e, option) => {
                            option && setCount(option.data);
                        }}
                    />
                </p>
            </>
        );
    },
};
