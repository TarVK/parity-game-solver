import {useRef} from "react";

/**
 * A reference with a lazy initializer
 * @param init The initialization function to call the first time
 * @returns The initialized reference
 */
export function useLazyRef<T>(init: () => T): React.MutableRefObject<T> {
    const ref = useRef<T>();
    const first = useRef(true);
    if (first.current) {
        first.current = false;
        ref.current = init();
    }
    return ref as any;
}
