import { useState, useEffect, useRef } from 'react';

export function useResizeObserver(ref) {
    const [width, setWidth] = useState(null);

    useEffect(() => {
        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            // Set width to the entry's contentRect width for the observed target
            entries.forEach(entry => {
                setWidth(entry.contentRect.width);
            });
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

    return width;
}
