import {promises as FS, readdirSync} from "fs";
import {string} from "parsimmon";
import Path from "path";
import {parityGameParser} from "../parsing/parityGameParser";
import {getParityGame} from "../solver/getParityGame";
import {createInputOrder} from "../solver/orders/createInputOrder";
import {createRandomOrder} from "../solver/orders/createRandomOrder";
import {getAdaptiveOrderFromList} from "../solver/orders/utils/getAdaptiveOrderFromList";
import {getRepeatedOrderFromList} from "../solver/orders/utils/getRepeatedOrderFromList";
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
it("Gets all data", async () => {
    if (0 == 0) return;

    const orders = [
        {name: "input", order: createInputOrder()},
        {name: "random", order: createRandomOrder()},
        {name: "input-repeated", order: createInputOrder(getRepeatedOrderFromList)},
        {
            name: "random-repeated",
            order: createRandomOrder(0, getRepeatedOrderFromList),
        },
        {name: "input-adjusted", order: createInputOrder(getAdaptiveOrderFromList)},
        {
            name: "random-adjusted",
            order: createRandomOrder(0, getAdaptiveOrderFromList),
        },
    ];

    const baseDirs = Path.join(process.cwd(), "games");
    const dirs = await FS.readdir(baseDirs);
    for (let dirName of dirs) {
        const dir = Path.join(process.cwd(), "games", dirName);
        const files = await FS.readdir(dir);

        const outDir = Path.join(process.cwd(), "output", dirName);
        await FS.mkdir(outDir, {recursive: true});

        for (let fileName of files) {
            let out: {
                orderName: string;
                data: {
                    0: IParityNode[];
                    1: IParityNode[];
                    iterations: number;
                    time: number;
                };
            }[] = [];
            for (let {name: orderName, order} of orders) {
                const data = await getOutput(dirName + Path.sep + fileName, order);
                if (!data) continue;
                out.push({orderName, data});
            }

            const text = out
                .map(
                    ({
                        orderName,
                        data: {"0": even, "1": odd, iterations, time},
                    }) => `${orderName} order: ${time}ms, ${iterations} iterations
Even (${even.length}): ${even.map(({id}) => id).join(" ")}
Odd (${odd.length}): ${odd.map(({id}) => id).join(" ")}

`
                )
                .join("");
            await FS.writeFile(Path.join(outDir, Path.basename(fileName) + ".txt"), text);
        }
    }
}, 36000000); // 10 hours
