import {Failure} from "parsimmon";
import {ISyntaxError} from "../_types/ISyntaxError";
import {combineOptions} from "./combineOptions";

/**
 * Creates a syntax error given a parsimmon failure
 * @param error The parsimon error/failure
 * @returns The formatted error
 */
export function formatSyntaxError(error: Failure): ISyntaxError {
    return {
        ...error,
        message: `Syntax error, expected ${combineOptions(error.expected)}`,
    };
}
