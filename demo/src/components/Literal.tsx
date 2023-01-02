import {useTheme} from "@fluentui/react-theme-provider";
import React, {FC} from "react";

export const Literal: FC = ({children}) => (
    <code style={{background: useTheme().palette.neutralLight}}>{children}</code>
);
