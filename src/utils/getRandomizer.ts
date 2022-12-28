// Source: https://stackoverflow.com/a/19303725/8521718

/**
 * Creates a new randomizer with the given seed
 * @param seed The seed for the randomizer
 * @returns The pseudo random result
 */
export function getRandomizer(seed: number): () => number {
    return () => {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
}
