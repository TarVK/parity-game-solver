import {Link} from "@fluentui/react";
import React, {FC, useState} from "react";
import {InlineTex} from "react-tex";
import {Literal} from "./components/Literal";
import {StandardModal} from "./components/Modal";

export const Info: FC = () => {
    const [showActionFormula, setShowActionFormula] = useState(false);
    return (
        <>
            <p>
                This website provides simple Labeled Transition System (LTS) model
                checking capabilities created for the Algorithms for Model Checking course
                (2IMF35) taught at{" "}
                <Link href="https://www.tue.nl/en/">
                    Eindhoven University of Technology
                </Link>
                .
            </p>
            <p>
                The course required us to implement a simple fixpoint formula checker for
                a given LTS. I additionally designed this website around the base
                functionality, using some of my previous projects as a template. On this
                site you can edit a LTS in text (
                <Link href="https://www.mcrl2.org/web/user_manual/language_reference/lts.html#aldebaran-format">
                    aldebran format
                </Link>
                ) or visual form, and create multiple formulas. These formulas are based
                on{" "}
                <Link href="https://en.wikipedia.org/wiki/Modal_%CE%BC-calculus">
                    modal mu-calculus
                </Link>{" "}
                and are constructed with the following grammar: <br />
                <InlineTex
                    texContent={`$$f,g ::= false \\mid true \\mid X \\mid (f) \\mid\\; !f \\mid f \\&\\& g \\mid f || g \\mid f\\text{=>}g \\mid [a]f \\mid \\text{<}a\\text{>} f \\mid mu \\; X.f \\mid nu \\; X.f \\mid (f)$$
                `}
                />{" "}
                <br />
                <Literal>X</Literal> can be replaced by any valid variable name, and{" "}
                <Literal>a</Literal> can be replaced by any transition in the LTS. The
                formula constructions have the following interpretation for a given state{" "}
                <Literal>s</Literal>:
                <ul>
                    <li>
                        <Literal>false</Literal>: does not hold for <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal>true</Literal>: holds for <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal>X</Literal>: holds for <Literal>s</Literal> if the
                        fixpoint that declared this variable holds for{" "}
                        <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal>!f</Literal>: holds for <Literal>s</Literal> if{" "}
                        <Literal>f</Literal> does not hold for <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal>{`f&&g`}</Literal>: holds for <Literal>s</Literal> if{" "}
                        <Literal>f</Literal> holds for <Literal>s</Literal> and{" "}
                        <Literal>g</Literal> holds for <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal> {`f||g`}</Literal>: holds for <Literal>s</Literal> if{" "}
                        <Literal>f</Literal> holds for <Literal>s</Literal> or{" "}
                        <Literal>g</Literal> holds for <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal> {`f=>g`}</Literal>: holds for <Literal>s</Literal> if
                        when <Literal>f</Literal> holds for <Literal>s</Literal> or{" "}
                        <Literal>g</Literal> also holds for <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal> {`[a]f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                        <Literal>f</Literal> holds for all states <Literal>q</Literal>{" "}
                        that are reachable from <Literal>s</Literal> using a single{" "}
                        <Literal>a</Literal> transition
                    </li>
                    <li>
                        <Literal> {`<a>f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                        <Literal>f</Literal> holds for some state <Literal>q</Literal>{" "}
                        that's reachable from <Literal>s</Literal> using a single{" "}
                        <Literal>a</Literal> transition
                    </li>
                    <li>
                        <Literal> {`mu X.f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                        <Literal>f</Literal> holds for <Literal>s</Literal>, where{" "}
                        <Literal>X</Literal> may occur in <Literal>f</Literal>, but
                        "recurses" only finitely often
                    </li>
                    <li>
                        <Literal> {`nu X.f`}</Literal>: holds for <Literal>s</Literal> if{" "}
                        <Literal>f</Literal> holds for <Literal>s</Literal>, where{" "}
                        <Literal>X</Literal> may occur in <Literal>f</Literal>, and may
                        "recurse" infinitely often
                    </li>
                </ul>
                A formula holds for a LTS, if it holds for the initial state of the LTS
                (usually state 0). Note that instead of specifying a single action, a
                regular expression may also be specified in accordance with{" "}
                <Link href="https://www.mcrl2.org/web/user_manual/articles/basic_modelling.html?highlight=formula#regular-hml">
                    regular HML syntax
                </Link>
                . You can read more about{" "}
                <Link href="#" onClick={() => setShowActionFormula(true)}>
                    action expressions here
                </Link>
                . Many constructs - like these regular HML paths, negation, and
                implications - are transformed out of the formula that the model checker
                eventually operates on. They only serve as syntactic sugar to more easily
                write formulas. The final formula that's verified by the model checker can
                be found in the "stats" tab of the formula editor.
            </p>
            <StandardModal
                title="Action formula"
                visible={showActionFormula}
                onClose={() => setShowActionFormula(false)}>
                A regular action expression <Literal>r</Literal> is made constructed from
                the following grammar: <br />
                <InlineTex
                    texContent={`$$r,s ::= A \\mid (r) \\mid r + s \\mid r . s \\mid r* \\mid r+$$
                `}
                />
                <br />
                <InlineTex
                    texContent={`$$A,B ::= false \\mid true \\mid a \\mid (A) \\mid\\; !A \\mid A \\&\\& B \\mid A || B$$
                `}
                />
                <br />
                The symbols <Literal>A</Literal> and <Literal>B</Literal> represent action
                sets. <Literal>r</Literal> forms a regular expression using these sets.
                Literal <Literal>a</Literal> may be replaced by any single action name.
                The constructs have the following interpretation:
                <ul>
                    <li>
                        <Literal>false</Literal>: The empty set of actions
                    </li>
                    <li>
                        <Literal>true</Literal>: The set of all used actions in the LTS
                    </li>
                    <li>
                        <Literal>a</Literal>: The singleton set containing the action{" "}
                        <Literal>a</Literal>
                    </li>
                    <li>
                        <Literal>!A</Literal>: The complement of <Literal>A</Literal> with
                        respect to all available actions in the LTS
                    </li>
                    <li>
                        <Literal>{`A && B`}</Literal>: The intersection of sets{" "}
                        <Literal>A</Literal> and <Literal>B</Literal>
                    </li>
                    <li>
                        <Literal>{`A || B`}</Literal>: The union of sets{" "}
                        <Literal>A</Literal> and <Literal>B</Literal>
                    </li>
                    <li>
                        <Literal>{`A`}</Literal>: Matches any sequence consisting of a
                        single action <Literal>a</Literal>, if <Literal>a</Literal> occurs
                        in set <Literal>A</Literal>
                    </li>
                    <li>
                        <Literal>{`r + s`}</Literal>: Matches any sequence of actions
                        constructable from <Literal>r</Literal> or from{" "}
                        <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal>{`r . s`}</Literal>: Matches any sequence of actions
                        constructable as the concatenation of a sequence constructable by{" "}
                        <Literal>r</Literal> followed by a sequence constructable by{" "}
                        <Literal>s</Literal>
                    </li>
                    <li>
                        <Literal>{`r*`}</Literal>: Matches any sequence of actions
                        constructable by concatenating 0 or more sequences constructable
                        from <Literal>r</Literal> together
                    </li>
                    <li>
                        <Literal>{`r+`}</Literal>: Matches any sequence of actions
                        constructable by concatenating 1 or more sequences constructable
                        from <Literal>r</Literal> together
                    </li>
                </ul>
            </StandardModal>
            <p>
                The fixpoints (<Literal>mu</Literal> and <Literal>nu</Literal>) sound
                rather confusing, but behave similar to a recursive function. Consider the
                formula <Literal>{"nu X. <a>X"}</Literal>. This formula holds for a state{" "}
                <Literal>s</Literal> if there is a successor state <Literal>q</Literal>{" "}
                for which the same formula holds, that is reachable by an{" "}
                <Literal>a</Literal> transition from <Literal>s</Literal>. This formula
                always recurses, hence it can only hold for an infinite path. Since our
                LTS is finite, this means it detects <Literal>a</Literal> paths to{" "}
                <Literal>a</Literal> cycles. Meanwhile <Literal>{"mu X. <a>X"}</Literal>{" "}
                won't ever hold because the formula can only ever hold for an infinite
                path, and <Literal>mu</Literal> only allows finite recursion.
            </p>
            <p>
                The code for the model-checker itself and this website (under demo) is
                visible on{" "}
                <Link href="https://github.com/TarVK/model-checker">
                    Github.com/TarVK/model-checker
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
