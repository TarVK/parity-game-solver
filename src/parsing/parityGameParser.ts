import p, {Parser} from "parsimmon";
import {IParityGameAST, IParityNodeAST} from "../_types/IParityGameAST";
import {optionally} from "./optionally";
import {wrap} from "./wrap";

const number = wrap(p.regex(/[0-9]+/))
    .map(val => Number(val))
    .desc("number");
const name = wrap(
    p.seq(p.string('"'), p.regex(/[^"]*/), p.string('"')).map(([_, v, _2]) => v)
).desc("name");

const nodeParser: Parser<IParityNodeAST> = p
    .seq(
        number,
        number,
        wrap(p.string("0").or(p.string("1"))).map(val => Number(val) as 0 | 1),
        number.sepBy(p.string(",")),
        optionally(name),
        wrap(p.string(";"))
    )
    .map(([identifier, priority, owner, successors, name, _]) => ({
        id: identifier,
        owner,
        name,
        priority,
        successors,
    }));
const parityParser = p.seq(wrap(p.string("parity")), number, p.string(";"));

export const parityGameParser: Parser<IParityGameAST> = p
    .seq(optionally(parityParser), nodeParser.many())
    .map(([[_, parity] = ["", undefined], nodes]) => ({
        maxParity: parity,
        nodes,
    }));

export const stringifyParityGame = (pg: IParityGameAST) =>
    (pg.maxParity ? `parity ${pg.maxParity};\n` : "") +
    pg.nodes
        .map(
            ({id, owner, name, priority, successors}) =>
                `${id} ${priority} ${owner} ${successors.join(",")}${
                    name ? " " + name : ""
                };`
        )
        .join("\n");
