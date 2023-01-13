import {Link} from "@fluentui/react";
import React, {FC, useState} from "react";
import {InlineTex} from "react-tex";
import {Literal} from "./components/Literal";
import {StandardModal} from "./components/Modal";
import {Header} from "./Header";

export const Info: FC = () => {
    const [showStrategies, setShowStrategies] = useState(false);
    return (
        <>
            <p>
                This website provides simple min{" "}
                <Link href="https://en.wikipedia.org/wiki/Parity_game">Parity Game</Link>{" "}
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
                A minimum parity game is represented by a graph, where each node has two
                attributes:
                <ul>
                    <li>
                        An owner: Either <Literal>Even</Literal> or <Literal>Odd</Literal>{" "}
                        represented by a diamond and square shape respectively
                    </li>
                    <li>A priority: A number shown in the node itself</li>
                </ul>
                Additionally, each node in the graph must have at least one outgoing edge
                for it to be a valid parity game. On this website we also show the
                identifier/name below the node, but this has no real effect on the game.{" "}
                <br />
                To play the game, a token is placed on one of the nodes. The owner of the
                node can decide to move the token to one of the successor nodes. Since
                each node has at least one outgoing edge this process can continue
                indefinitely. Since the parity game itself is only finite, this means that
                certain nodes must be visited infinitely often. Between all nodes that are
                visited infinitely often, we consider the one with the lowest priority. If
                this priority is even, player <Literal>Even</Literal> wins the game,
                otherwise player odd wins the game. <br />
                For both player <Literal>Even</Literal> and player <Literal>Odd</Literal>{" "}
                an optimal strategy exists. This parity game solver can determine what
                player wins the game when the token starts in a certain node, assuming
                both players play optimally. After checking the game, each node is colored
                in accordance to what player wins the game starting at that node, blue for{" "}
                <Literal>Even</Literal> and pink for <Literal>Odd</Literal>
            </p>
            <p>
                The{" "}
                <Link href="https://www.win.tue.nl/~timw/teaching/amc/2009/college14.pdf">
                    Small Progress Measures algorithm
                </Link>{" "}
                describes an approach that always results in a correct output. It however
                leaves open certain details which can greatly affect the speed of the
                algorithm in the real world. The algorithm tells us to "Lift a node" as
                long as there's a node for which lifting changes the state, without
                describing what node to lift when there are multiple nodes that can
                successfully be lifted. Nor does it describe how to find a node that can
                be lifted successfully. This website provides several of approaches to
                pick such a node, in terms of the following attributes:{" "}
                <ul>
                    <li>The base order to check nodes in</li>
                    <li>A strategy of how to deviate from this base order</li>
                    <li>Whether lifting should be grouped by priority</li>
                </ul>
                These attributes can be combined in different ways, and which approach is
                most effective depends on the parity game at hand. The default
                configuration which uses the graph ordering strategy and does not lift per
                priority seems most generally effective. You can read more about the{" "}
                <Link href="#" onClick={() => setShowStrategies(true)}>
                    different approaches here
                </Link>
            </p>
            <p>
                This website was created using several libraries including{" "}
                <Link href="https://reactjs.org/">React</Link>,{" "}
                <Link href="https://microsoft.github.io/monaco-editor/">Monaco</Link>, and{" "}
                <Link href="https://developer.microsoft.com/en-us/fluentui#/">
                    Fluent-UI
                </Link>
                .
                <StandardModal
                    title="Lifting strategies"
                    visible={showStrategies}
                    onClose={() => setShowStrategies(false)}>
                    <h2>Base orderings</h2>
                    <ul>
                        <li>
                            Input order: Follows the order in which the nodes are defined
                            in the textual representation
                        </li>
                        <li>
                            Random order: Randomly shuffles the order of the nodes
                            according to a fixed seed
                        </li>
                        <li>
                            Priority order: Sorts the nodes from highest to lowest
                            priority
                        </li>
                        <li>
                            Graph order: Sorts the nodes according to predecessor
                            vertices, in an attempt to have more consecutive lifts enabled
                        </li>
                        <li>
                            Gain order: Sorts nodes in a lexicographical ordering of 3
                            aspects to maximize the possible gain to be made: odd priority
                            first, odd owner first, lower priority first
                        </li>
                    </ul>
                    <h2>Strategies</h2>
                    <ul>
                        <li>
                            Direct cycle: Simply iteratively goes through the base order,
                            until none of the nodes are successfully lifted
                        </li>
                        <li>
                            Repeat nodes: Goes iteratively through the base order, but
                            lifts each node repeatedly until it can no longer be lifted
                            (handles self loops well)
                        </li>
                        <li>
                            Adaptive ordering: Goes iteratively through the base order,
                            but whenever lifting fails, the node is moved to the back of
                            the list and the cycle restarts from the beginning of the list
                        </li>
                        <li>
                            Graph ordering: Goes iteratively through the base order.
                            Whenever lifting is successful, a breath for search is
                            performed on all nodes that lift successfully using the
                            predecessor relation. Whenever this search detects a cycle
                            that was successfully lifted,this cycle repeats until it can
                            no longer be lifted successfully
                        </li>
                    </ul>
                    <h2>Grouping</h2>
                    <ul>
                        <li>
                            No grouping: The selected strategy is applied on an ordering
                            involving all nodes at once
                        </li>
                        <li>
                            Lift per priority: The graph is partitioned into clusters of
                            the same priority, and the selected strategy and ordering is
                            applied per cluster. The lifting happens from highest to
                            lowest priority and loops around until no progress can be made
                            anymore. Each cluster repeats lifting within its cluster,
                            until no progress is made within the cluster anymore.
                        </li>
                    </ul>
                </StandardModal>
            </p>
        </>
    );
};
