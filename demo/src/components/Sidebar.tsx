import React, {FC, Fragment, useCallback, useState} from "react";
import {
    Stack,
    StackItem,
    getTheme,
    Dropdown,
    PrimaryButton,
    ActionButton,
    DefaultButton,
} from "@fluentui/react";
import {State} from "../model/State";
import {useDataHook} from "model-react";

const theme = getTheme();
export const Sidebar: FC<{state: State}> = ({state}) => {
    return (
        <Stack
            style={{
                width: 400,
                height: "100%",
                background: theme.palette.white,
                paddingTop: theme.spacing.s1,
                boxShadow: "rgb(0 0 0 / 25%) 3px 0px 10px 0px",
                // Cut off the box shadow at the top
                clipPath: "polygon(0 0, 0px 10000px, 10000px 10000px, 10000px 0px)",
            }}>
            <StackItem
                style={{
                    marginBottom: theme.spacing.s1,
                    paddingLeft: theme.spacing.s1,
                    paddingRight: theme.spacing.s1,
                }}>
                hoi
            </StackItem>
        </Stack>
    );
};
