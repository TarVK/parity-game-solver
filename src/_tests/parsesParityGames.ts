import {promises as FS, readdirSync} from "fs";
import Path from "path";
import {parityGameParser} from "../parsing/parityGameParser";

describe("parityGameParser", () => {
    describe("Loads dining philosophers", () => {
        const dir = Path.join(process.cwd(), "games", "dining");

        const files = readdirSync(dir)
            .filter(v => !v.match(/10|11/))
            .slice(0, 15);
        for (let fileName of files) {
            it(`Should load "${fileName}"`, async () => {
                const file = await FS.readFile(Path.join(dir, fileName));
                const text = await file.toString();

                const result = parityGameParser.parse(text);
                expect(result.status).toBe(true);

                if (result.status) {
                    expect(result.value.maxParity).toBeGreaterThan(0);
                    expect(result.value.nodes.length).toBeGreaterThan(5);
                }
            }, 100000);
        }
    });
});
