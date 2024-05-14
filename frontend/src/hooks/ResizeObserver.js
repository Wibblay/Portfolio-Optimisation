import { useState, useEffect } from 'react';

export function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState({ width: null, height: null });

    useEffect(() => {
        const observeTarget = ref.current;
        if (!observeTarget) {
            console.log("No observeTarget found", observeTarget);
            return;
        }

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                console.log("ResizeObserver: width:", width, "height:", height); // Debugging
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(observeTarget);

        return () => {
            if (observeTarget) {
                resizeObserver.unobserve(observeTarget);
            }
        };
    }, [ref]);

    return dimensions;
}
