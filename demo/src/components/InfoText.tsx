import {
    DirectionalHint,
    ITooltipHostStyles,
    TooltipDelay,
    TooltipHost,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import React, {FC} from "react";

export const InfoText: FC<{
    hover: string | JSX.Element | JSX.Element[];
}> = ({hover, children}) => {
    const tooltipId = useId();
    return (
        <TooltipHost
            content={hover}
            id={tooltipId}
            calloutProps={calloutProps}
            directionalHint={DirectionalHint.topLeftEdge}
            delay={TooltipDelay.medium}
            styles={hostStyles}>
            {children}
        </TooltipHost>
    );
};

const calloutProps = {gapSpace: 0};
const hostStyles: Partial<ITooltipHostStyles> = {root: {display: "inline-block"}};
