import p, {Parser} from "parsimmon";

export const optionally = <X>(parser: Parser<X>): Parser<X | undefined> =>
    parser.or(p.succeed(undefined));
