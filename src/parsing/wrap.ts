import p, {Parser} from "parsimmon";

export const _ = p.regexp(/[ \t\n\r]*/).desc("whitespace");
export const wrap = <T>(parser: Parser<T>): Parser<T> =>
    p.seq(_, parser, _).map(([_1, result, _2]) => result);
