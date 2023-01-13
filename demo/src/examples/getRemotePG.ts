/**
 * Retrieves the contents from the given path to an PG
 * @param path The path to retrieve
 * @returns The contents of the file at this path
 */
export async function getRemotePG(path: string): Promise<string> {
    const data = await fetch("games/" + path);
    return await data.text();
}
