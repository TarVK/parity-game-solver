import {
    Stack,
    StackItem,
    getTheme,
    Link,
    CommandBarButton,
    FontIcon,
} from "office-ui-fabric-react";
import React, {FC, useState} from "react";
import {StandardModal} from "./components/Modal";

const theme = getTheme();
export const Header: FC<{info?: React.ReactNode}> = ({children, info}) => {
    const [showInfo, setShowInfo] = useState(true);
    return (
        <Stack
            horizontal
            horizontalAlign="space-between"
            styles={{
                root: {
                    background: theme.palette.white,
                    boxShadow: theme.effects.elevation16,
                    paddingLeft: theme.spacing.m,
                    zIndex: 100,
                    position: "relative",
                },
            }}>
            <StackItem align="center">
                <h1 style={{margin: 0}}>Parity game solver</h1>
            </StackItem>
            <StackItem align="center">{children}</StackItem>
            <StackItem align="center" style={{width: 300}}>
                <Stack
                    horizontal
                    style={{justifyContent: "end"}}
                    horizontalAlign="space-between">
                    {info && (
                        <StackItem align="stretch">
                            <StandardModal
                                title="Info"
                                visible={showInfo}
                                onClose={() => setShowInfo(false)}>
                                {info}
                            </StandardModal>
                            <CommandBarButton
                                onClick={() => setShowInfo(true)}
                                styles={{root: {height: "100%"}}}>
                                <FontIcon
                                    aria-label="Deselect"
                                    iconName="StatusCircleQuestionMark"
                                    style={{fontSize: 25}}
                                />
                            </CommandBarButton>
                        </StackItem>
                    )}
                    <StackItem align="center">
                        <Link href="https://github.com/TarVK/parity-game-solver">
                            <CommandBarButton
                                styles={{root: {padding: theme.spacing.l1}}}>
                                Github
                            </CommandBarButton>
                        </Link>
                    </StackItem>
                </Stack>
            </StackItem>
        </Stack>
    );
};
