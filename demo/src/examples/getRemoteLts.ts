/**
 * Retrieves the contents from the given path to an LTS
 * @param path The path to retrieve
 * @returns The contents of the file at this path
 */
export async function getRemoteLTS(path: string): Promise<string> {
    const data = await fetch("LTSes/" + path);
    return await data.text();
}
