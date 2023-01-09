import React, {FC, Fragment, useCallback, useMemo, useState} from "react";
import {
    Stack,
    StackItem,
    getTheme,
    Dropdown,
    PrimaryButton,
    ActionButton,
    DefaultButton,
    Label,
    Toggle,
    Spinner,
    Checkbox,
} from "@fluentui/react";
import {State} from "../model/State";
import {useDataHook} from "model-react";
import {evenColor, oddColor} from "../colors";
import {formatTime} from "../util/formatTime";
import {IParityNode} from "parity-game-solver";
import {InfoText} from "./InfoText";

const theme = getTheme();
export const Sidebar: FC<{state: State}> = ({state}) => {
    const [h] = useDataHook();
    const winner = state.getNodeWinner(0, h);
    const winners = state.getNodeWinners(h);
    const stats = state.getCheckData(h);

    const [showingNodes, setShowingNodes] = useState(false);

    const order = state.getOrderType(h);
    const strategy = state.getStrategyType(h);

    const nodeIds = useMemo(() => {
        if (!showingNodes || !winners) return [[], []];

        const map = (nodes: IParityNode[]) =>
            nodes.map(({id}) => (
                <>
                    <code
                        key={id}
                        style={{
                            marginRight: theme.spacing.s1,
                            background: theme.palette.neutralLight,
                        }}>
                        {id}
                    </code>{" "}
                </>
            ));
        return [map(winners[0]), map(winners[1])];
    }, [showingNodes, winners]);

    const computationTime = stats && formatTime(stats?.duration);
    const checking = state.isChecking(h);
    return (
        <Stack
            style={{
                width: 400,
                height: "100%",
                background:
                    winner == 0
                        ? evenColor
                        : winner == 1
                        ? oddColor
                        : theme.palette.white,
                paddingTop: theme.spacing.s1,
                paddingLeft: theme.spacing.s1,
                paddingRight: theme.spacing.s1,
                boxShadow: "rgb(0 0 0 / 25%) 3px 0px 10px 0px",
                // Cut off the box shadow at the top
                clipPath: "polygon(0 0, 0px 10000px, 10000px 10000px, 10000px 0px)",
            }}>
            <StackItem
                style={{
                    marginBottom: theme.spacing.s1,
                }}>
                <Label>
                    <InfoText hover="The base order of the nodes to go through when lifting">
                        Base order
                    </InfoText>
                </Label>
                <Dropdown
                    placeholder="Select an option"
                    // label=""
                    options={[
                        {
                            key: "0",
                            data: "input" as const,
                            text: "Input order",
                            selected: order == "input",
                        },
                        {
                            key: "1",
                            data: "random" as const,
                            text: "Random order",
                            selected: order == "random",
                        },
                        {
                            key: "2",
                            data: "priority" as const,
                            text: "Priority order",
                            selected: order == "priority",
                        },
                        {
                            key: "3",
                            data: "graph" as const,
                            text: "Graph order",
                            selected: order == "graph",
                        },
                    ]}
                    notifyOnReselect
                    onChange={(e, option) => option && state.setOrderType(option.data)}
                />
            </StackItem>
            <StackItem
                style={{
                    marginBottom: theme.spacing.s1,
                }}>
                <Label>
                    <InfoText hover="The primary strategy used to choose the next node to attempt to lift">
                        Primary strategy
                    </InfoText>
                </Label>
                <Dropdown
                    placeholder="Select an option"
                    // label=""
                    options={[
                        {
                            key: "0",
                            data: "cycle" as const,
                            text: "Direct cycle",
                            selected: strategy == "cycle",
                        },
                        {
                            key: "1",
                            data: "repeat" as const,
                            text: "Repeat nodes",
                            selected: strategy == "repeat",
                        },
                        {
                            key: "2",
                            data: "adaptive" as const,
                            text: "Adaptive ordering",
                            selected: strategy == "adaptive",
                        },
                        {
                            key: "3",
                            data: "graph" as const,
                            text: "Graph ordering",
                            selected: strategy == "graph",
                        },
                    ]}
                    notifyOnReselect
                    onChange={(e, option) => option && state.setStrategyType(option.data)}
                />
            </StackItem>
            <Label>
                <InfoText hover="Whether to lift nodes iteratively per priority until no progress is made for that priority">
                    Lift per priority
                </InfoText>
            </Label>
            <Toggle
                checked={state.usesPerPriorityStrategy(h)}
                onChange={(e, v) => v != null && state.setUsesPerPriorityStrategy(v)}
            />
            <StackItem
                style={{
                    marginTop: theme.spacing.s1,
                    marginBottom: theme.spacing.l1,
                }}>
                <PrimaryButton
                    style={{width: "100%"}}
                    onClick={() => state.check()}
                    disabled={state.getNodeWinners(h) != null || checking}>
                    Check
                    {checking && <Spinner style={{marginLeft: theme.spacing.m}} />}
                </PrimaryButton>
            </StackItem>

            {winners != null && (
                <>
                    <StackItem>
                        <Stack
                            horizontal
                            verticalAlign="center"
                            tokens={{childrenGap: theme.spacing.m}}>
                            <StackItem grow={1}>
                                <Label>Iterations </Label>
                            </StackItem>
                            <StackItem>{stats?.iterations ?? null}</StackItem>
                        </Stack>
                    </StackItem>
                    <StackItem>
                        <Stack
                            horizontal
                            verticalAlign="center"
                            tokens={{childrenGap: theme.spacing.m}}>
                            <StackItem grow={1}>
                                <Label>Duration </Label>
                            </StackItem>
                            <StackItem>
                                {computationTime?.value} {computationTime?.unit}
                            </StackItem>
                        </Stack>
                    </StackItem>
                    <StackItem>
                        <Stack
                            horizontal
                            verticalAlign="center"
                            tokens={{childrenGap: theme.spacing.m}}>
                            <StackItem grow={1}>
                                <Label>Node 0 was won by</Label>
                            </StackItem>
                            <StackItem>
                                {" "}
                                {winner == 0 ? "even" : winner == 1 ? "odd" : ""}
                            </StackItem>
                        </Stack>
                    </StackItem>
                    <StackItem>
                        <Stack
                            horizontal
                            verticalAlign="center"
                            tokens={{childrenGap: theme.spacing.m}}>
                            <StackItem grow={1}>
                                <Label>Number of states won by even</Label>
                            </StackItem>
                            <StackItem>{winners[0].length}</StackItem>
                        </Stack>
                    </StackItem>
                    <StackItem>
                        <Stack
                            horizontal
                            verticalAlign="center"
                            tokens={{childrenGap: theme.spacing.m}}>
                            <StackItem grow={1}>
                                <Label>Number of states won by odd </Label>
                            </StackItem>
                            <StackItem>{winners[1].length}</StackItem>
                        </Stack>
                    </StackItem>

                    <StackItem grow={1}> </StackItem>
                    <StackItem
                        shrink={1}
                        style={{
                            minHeight: 0,
                            overflow: "auto",
                            marginBottom: theme.spacing.m,
                        }}>
                        <Toggle
                            label="Show nodes"
                            checked={showingNodes}
                            onChange={(e, v) => v != null && setShowingNodes(v)}
                        />
                        {showingNodes && (
                            <>
                                <Label>Nodes won by even</Label>
                                <div>{nodeIds[0]}</div>
                                <Label style={{marginTop: theme.spacing.s1}}>
                                    Nodes won by odd
                                </Label>
                                <div>{nodeIds[1]}</div>
                            </>
                        )}
                    </StackItem>
                </>
            )}
        </Stack>
    );
};
