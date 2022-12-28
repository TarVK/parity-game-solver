import {promises as FS, readdirSync} from "fs";
import Path from "path";
import {parityGameParser} from "../parsing/parityGameParser";
import {getParityGame} from "../solver/getParityGame";
import {createRandomOrder} from "../solver/orders/createRandomOrder";
import {createInputOrder} from "../solver/orders/createInputOrder";
import {solveSmallProgressMeasures} from "../solver/solveSmallProgresMeasures";
import {IProgressOrder} from "../solver/_types/IProgressOrder";
import {getRepeatedOrderFromList} from "../solver/orders/utils/getRepeatedOrderFromList";
import {getAdaptiveOrderFromList} from "../solver/orders/utils/getAdaptiveOrderFromList";

const createTest = (
    name: string,
    nodes: number[],
    order: IProgressOrder = createInputOrder(getRepeatedOrderFromList)
) => {
    it(`Should solve "${name}"`, async () => {
        const file = await FS.readFile(Path.join(process.cwd(), "games", "dining", name));
        const text = await file.toString();

        const parityGameAST = parityGameParser.parse(text);
        expect(parityGameAST.status).toBe(true);
        if (!parityGameAST.status) return;

        const parityGame = getParityGame(parityGameAST.value);
        const result = solveSmallProgressMeasures(parityGame, order);

        expect(result[0].map(node => node.id)).toEqual(nodes);
    });
};

describe("solveSmallProgressMeasures", () => {
    describe("Solves dining philosophers", () => {
        createTest("dining_2.invariantly_inevitably_eat.gm", [14, 16, 21]);
        createTest("dining_2.plato_infinitely_often_can_eat.gm", []);
    });
});
