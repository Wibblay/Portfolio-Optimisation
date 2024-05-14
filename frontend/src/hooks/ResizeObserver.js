/* ResizeObserver.js */
import { useState, useEffect } from 'react';

/**
 * Custom hook to observe the size of a DOM element.
 * 
 * @param {Object} ref - The React ref object pointing to the DOM element to be observed.
 * @returns {Object} An object containing the width and height of the observed element.
 */
export function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState({ width: null, height: null });

    useEffect(() => {
        const observeTarget = ref.current;
        if (!observeTarget) {
            console.log("No observeTarget found", observeTarget);
            return;
        }

        // Initialize a new ResizeObserver instance to observe changes in the target element's size
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                console.log("ResizeObserver: width:", width, "height:", height); // Debugging
                setDimensions({ width, height });
            }
        });

        // Start observing the target element
        resizeObserver.observe(observeTarget);

        // Cleanup function to unobserve the target element when the component unmounts or ref changes
        return () => {
            if (observeTarget) {
                resizeObserver.unobserve(observeTarget);
            }
        };
    }, [ref]);

    return dimensions;
}
