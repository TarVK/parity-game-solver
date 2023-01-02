import {
    DefaultButton,
    getTheme,
    Modal,
    Pivot,
    PivotItem,
    PrimaryButton,
    Stack,
    StackItem,
    Spinner,
    SpinnerSize,
} from "office-ui-fabric-react";
import React, {FC, useRef, useState} from "react";
import {useEffect} from "react";
import {basic} from "./types/basic";

const examples = [basic];
const theme = getTheme();
export const ExampleModal: FC<{onLoad: (model: string) => Promise<void>}> = ({
    onLoad,
}) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const getCode = useRef(async (): Promise<string> => "");
    useEffect(() => {
        if (visible) setLoading(false);
    }, [visible]);

    return (
        <>
            <DefaultButton onClick={() => setVisible(true)} text="Load example" />
            <Modal
                titleAriaId="Choose example"
                isOpen={visible}
                onDismiss={() => setVisible(false)}
                isBlocking={false}
                styles={{main: {overflow: "hidden"}}}>
                <Stack
                    style={{
                        minHeight: 200,
                        width: 800,
                        maxWidth: "100%",
                    }}>
                    <StackItem grow={1}>
                        <Pivot
                            aria-label="Example choice"
                            styles={{
                                itemContainer: {
                                    maxHeight: "calc(100vh - 150px)",
                                    overflow: "auto",
                                    fontSize: 13,
                                },
                            }}>
                            {examples.map(({name, Comp}, i) => (
                                <PivotItem
                                    headerText={name}
                                    key={i}
                                    itemKey={i + ""}
                                    style={{padding: theme.spacing.m}}>
                                    <Comp getCode={getCode} />
                                </PivotItem>
                            ))}
                        </Pivot>
                    </StackItem>

                    <StackItem>
                        <Stack
                            horizontal
                            tokens={{childrenGap: 10}}
                            style={{padding: theme.spacing.m}}
                            horizontalAlign="end">
                            <StackItem>
                                <DefaultButton
                                    onClick={() => setVisible(false)}
                                    text="Cancel"
                                />
                            </StackItem>
                            <StackItem>
                                <PrimaryButton
                                    onClick={async () => {
                                        setLoading(true);
                                        await onLoad(await getCode.current());
                                        setVisible(false);
                                    }}
                                    disabled={loading}>
                                    {loading && <Spinner size={SpinnerSize.small} />}Load
                                </PrimaryButton>
                            </StackItem>
                        </Stack>
                    </StackItem>
                </Stack>
            </Modal>
        </>
    );
};
