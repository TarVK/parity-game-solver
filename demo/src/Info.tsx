import {Link} from "@fluentui/react";
import React, {FC, useState} from "react";
import {InlineTex} from "react-tex";
import {Literal} from "./components/Literal";
import {StandardModal} from "./components/Modal";

export const Info: FC = () => {
    return (
        <>
            <p>
                This website provides simple{" "}
                <Link href="https://en.wikipedia.org/wiki/Parity_game">
                    Parity Game (PG)
                </Link>{" "}
                solving tools using the{" "}
                <Link href="https://www.win.tue.nl/~timw/teaching/amc/2009/college14.pdf">
                    Small Progress Measures algorithm
                </Link>
                . The site was created for the Algorithms for Model Checking course
                (2IMF35) taught at{" "}
                <Link href="https://www.tue.nl/en/">
                    Eindhoven University of Technology
                </Link>
                .
            </p>
            <p>
                This website was created using several libraries including{" "}
                <Link href="https://reactjs.org/">React</Link>,{" "}
                <Link href="https://microsoft.github.io/monaco-editor/">Monaco</Link>, and{" "}
                <Link href="https://developer.microsoft.com/en-us/fluentui#/">
                    Fluent-UI
                </Link>
                .
            </p>
        </>
    );
};
