import {useEffect, useState} from "react";
/**
 * Returns the latest input value if it hasn't changed for the provided length of time
 * @param data The data to be returned
 * @param afterDelay The delay for which it should be stablee
 * @returns The latest value
 */
export function useSettledData<T>(data: T, afterDelay: number = 1000): T {
    const [settledData, setData] = useState<T>(data);

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            setData(data);
        }, afterDelay) as any;

        return () => clearTimeout(timeoutID);
    }, [data]);

    return settledData;
}
