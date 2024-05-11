import { useState, useEffect, useRef } from 'react';

export function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState({ width: null, height: null });

    useEffect(() => {
        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            // Assume only one entry is observed (the container itself)
            if (entries[0]) {
                setDimensions({
                    width: entries[0].contentRect.width,
                    height: entries[0].contentRect.height
                });
            }
        });

        if (observeTarget) {
            resizeObserver.observe(observeTarget);
        }

        return () => {
            if (observeTarget) {
                resizeObserver.unobserve(observeTarget);
            }
        };
    }, [ref]);

    return dimensions;
}

