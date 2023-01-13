import {promises as FS, readdirSync, statSync, mkdirSync} from "fs";
import {string} from "parsimmon";
import Path from "path";
import {parityGameParser} from "../parsing/parityGameParser";
import {
    createGainOrder,
    createGetPriorityOrderFromList,
    createGraphOrder,
    getGraphOrder,
} from "../solver";
import {getParityGame} from "../solver/getParityGame";
import {createInputOrder} from "../solver/orders/createInputOrder";
import {createRandomOrder} from "../solver/orders/createRandomOrder";
import {getAdaptiveOrderFromList} from "../solver/orders/orderStrategies/getAdaptiveOrderFromList";
import {getRepeatedOrderFromList} from "../solver/orders/orderStrategies/getRepeatedOrderFromList";
import {solveSmallProgressMeasures} from "../solver/solveSmallProgresMeasures";
import {IProgressOrder} from "../solver/_types/IProgressOrder";
import {IParityNode} from "../_types";

const getOutput = async (
    path: string,
    order: IProgressOrder = createInputOrder(getAdaptiveOrderFromList)
) => {
    const file = await FS.readFile(Path.join(process.cwd(), "games", path));
    const text = await file.toString();

    const parityGameAST = parityGameParser.parse(text);
    if (!parityGameAST.status) return;

    const parityGame = getParityGame(parityGameAST.value);
    const startTime = Date.now();
    const result = await solveSmallProgressMeasures(parityGame, order);
    return {...result, time: Date.now() - startTime};
};

// A fake "Test" that just generates data
describe("Gets all data", () => {
    if (0 == 0) return;

    // prettier-ignore
    const excludeFolders: string[] = [
        "dining", 
        "elevator",
        "own", 
        "cacheCoherence"
    ];
    const tooLarge = {
        "dining_7.invariantly_possibly_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_7.invariantly_plato_starves.gm": ["graph", "priority-grouped-repeated"],
        "dining_7.invariantly_inevitably_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_7.plato_infinitely_often_can_eat.gm": [
            "graph",
            "priority-grouped-repeated",
        ],
        "dining_8.invariantly_possibly_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_8.invariantly_plato_starves.gm": ["graph", "priority-grouped-repeated"],
        "dining_8.invariantly_inevitably_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_8.plato_infinitely_often_can_eat.gm": [
            "graph",
            "priority-grouped-repeated",
        ],
        "dining_9.invariantly_possibly_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_9.invariantly_plato_starves.gm": ["graph", "priority-grouped-repeated"],
        "dining_9.invariantly_inevitably_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_9.plato_infinitely_often_can_eat.gm": [
            "graph",
            "priority-grouped-repeated",
        ],
        "dining_10.invariantly_possibly_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_10.invariantly_plato_starves.gm": ["graph", "priority-grouped-repeated"],
        "dining_10.invariantly_inevitably_eat.gm": ["graph", "priority-grouped-repeated"],
        "dining_10.plato_infinitely_often_can_eat.gm": [
            "graph",
            "priority-grouped-repeated",
        ],
        "dining_11.invariantly_possibly_eat.gm": ["graph"],
        "dining_11.invariantly_plato_starves.gm": ["graph"],
        "dining_11.invariantly_inevitably_eat.gm": ["graph"],
        "dining_11.plato_infinitely_often_can_eat.gm": ["graph"],
        "elevator1_5.gm": ["graph"],
        "elevator1_6.gm": ["graph"],
        "elevator1_7.gm": [] as string[],
        "elevator2_5.gm": ["graph"],
        "elevator2_6.gm": ["graph"],
        "elevator2_7.gm": [] as string[],
    };

    const orders = [
        {name: "input", order: createInputOrder()},
        {name: "random", order: createRandomOrder()},
        {name: "gain", order: createGainOrder()},
        {
            name: "priority-grouped-repeated",
            order: createInputOrder(
                createGetPriorityOrderFromList(getRepeatedOrderFromList)
            ),
        },
        {name: "graph", order: createInputOrder(getGraphOrder)},
    ];

    const baseDirs = Path.join(process.cwd(), "games");
    const dirs = readdirSync(baseDirs);
    for (let dirName of dirs) {
        const dir = Path.join(process.cwd(), "games", dirName);
        if (!statSync(dir).isDirectory()) continue;

        const files = readdirSync(dir);

        const outDir = Path.join(process.cwd(), "output", dirName);
        mkdirSync(outDir, {recursive: true});
        if (excludeFolders.includes(dirName)) continue;

        for (let fileName of files) {
            it(`Should output ${fileName}`, async () => {
                let out: {
                    orderName: string;
                    data: {
                        0: IParityNode[];
                        1: IParityNode[];
                        iterations: number;
                        time: number;
                    };
                }[] = [];

                let applicableOrders = orders;
                if (fileName in tooLarge)
                    applicableOrders = orders.filter(({name}) =>
                        tooLarge[fileName as keyof typeof tooLarge].includes(name)
                    );
                if (applicableOrders.length == 0) return;

                for (let {name: orderName, order} of applicableOrders) {
                    const data = await getOutput(dirName + Path.sep + fileName, order);
                    if (!data) continue;
                    out.push({orderName, data});
                }

                const even = out[0].data[0];
                const odd = out[0].data[1];
                const text =
                    out
                        .map(
                            ({orderName, data: {iterations, time}}) =>
                                `${orderName} order: ${time}ms, ${iterations} iterations`
                        )
                        .join("\n") +
                    `\n
Even (${even.length}): ${even.map(({id}) => id).join(" ")}
Odd (${odd.length}): ${odd.map(({id}) => id).join(" ")}
                    `;

                await FS.writeFile(
                    Path.join(outDir, Path.basename(fileName) + ".txt"),
                    text
                );

                const ids = (nodes: IParityNode[]) => nodes.map(({id}) => id).sort();
                out.forEach(({data: {"0": nEven, "1": nOdd}}) => {
                    expect(ids(nEven)).toEqual(ids(even));
                    expect(ids(nOdd)).toEqual(ids(odd));
                });
            }, 36000000); // 10 hours
        }
    }
});
