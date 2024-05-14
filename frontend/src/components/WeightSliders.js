/* WeightSliders.js */
import React, { useState, useEffect, useMemo } from 'react';
import './WeightSliders.css';

/**
 * Component to render sliders for adjusting portfolio asset weights.
 * 
 * @param {Array} assets - Array of asset objects with `symbol` and `weight` properties.
 * @param {function} onWeightChange - Function to handle weight changes.
 * @returns {JSX.Element} The rendered WeightSliders component.
 */
const WeightSliders = ({ assets = [], onWeightChange }) => {  // Default to an empty array if assets is undefined
    // Calculate initial weights directly from assets using useMemo
    const initialWeights = useMemo(() => {
        if (!Array.isArray(assets)) return {}; // Ensure assets is an array

        return assets.reduce((acc, asset) => ({
            ...acc,
            [asset.symbol]: asset.weight * 100  // Convert decimal weights to percentage for slider representation
        }), {});
    }, [assets]);

    // State to hold the slider weights
    const [weights, setWeights] = useState(initialWeights);

    // Update weights whenever initialWeights changes
    useEffect(() => {
        setWeights(initialWeights);
    }, [initialWeights]);

    /**
     * Handles slider value changes.
     * 
     * @param {string} symbol - The symbol of the asset.
     * @param {number} newPercentage - The new weight percentage of the asset.
     */
    const handleSliderChange = (symbol, newPercentage) => {
        const newWeight = newPercentage / 100;  // Convert percentage back to decimal for consistent data handling

        // Update the parent component state
        onWeightChange(symbol, newWeight);

        // Update local state to immediately reflect new weight
        const updatedWeights = {
            ...weights,
            [symbol]: newPercentage
        };

        // Recalculate the remaining weights to ensure they sum up to 100%
        const totalWeightExcludingCurrent = assets.reduce(
            (total, asset) => total + (asset.symbol === symbol ? 0 : updatedWeights[asset.symbol] / 100),
            0
        );
        if (totalWeightExcludingCurrent > 0) {
            assets.forEach(asset => {
                if (asset.symbol !== symbol) {
                    updatedWeights[asset.symbol] = ((updatedWeights[asset.symbol] / 100) / totalWeightExcludingCurrent) * (1 - newWeight) * 100;
                    onWeightChange(asset.symbol, updatedWeights[asset.symbol] / 100);
                }
            });
        }

        setWeights(updatedWeights);
    };

    // Display a message if there are no assets to show
    if (assets.length === 0) {
        return <div>No assets to display.</div>;
    }

    return (
        <div>
            {assets.map(asset => (
                <div key={asset.symbol} className="slider-container">
                    <label htmlFor={`slider-${asset.symbol}`} className="slider-label" style={{ width: '100px' }}>{asset.symbol}</label>
                    <input
                        type="range"
                        id={`slider-${asset.symbol}`}
                        className="slider"
                        min="0"
                        max="100"
                        value={weights[asset.symbol] || 0} // Ensure value is defined
                        onChange={e => handleSliderChange(asset.symbol, parseFloat(e.target.value))}
                        disabled={assets.length === 1} // Disable the slider if there's only one asset
                    />
                </div>
            ))}
        </div>
    );
};

export default WeightSliders;
