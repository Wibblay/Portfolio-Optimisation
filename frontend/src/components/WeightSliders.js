import React, { useState, useEffect, useMemo } from 'react';
import './WeightSliders.css';

const WeightSliders = ({ assets, onWeightChange }) => {
    const [weights, setWeights] = useState({});

    // Memoize initial weights to prevent unnecessary reinitializations
    const initialWeights = useMemo(() => {
        return assets.reduce((acc, asset) => ({
            ...acc,
            [asset.symbol]: asset.weight * 100  // Convert to percentage for slider representation
        }), {});
    }, [assets]);

    useEffect(() => {
        // Only update weights if they are empty or if asset count changes
        if (Object.keys(weights).length === 0 || Object.keys(weights).length !== assets.length) {
            setWeights(initialWeights);
        }
    }, [initialWeights, assets.length]); // Depend on memoized weights and asset count

    const handleSliderChange = (symbol, newPercentage) => {
        const newWeight = newPercentage / 100;

        // Update parent component state immediately
        onWeightChange(symbol, newWeight);

        // Update local state to immediately reflect new weight
        const newWeights = {
            ...weights,
            [symbol]: newPercentage
        };

        // Recalculate and distribute remaining weight proportionally among other assets
        const totalWeightExcludingCurrent = assets.reduce(
            (total, asset) => total + (asset.symbol === symbol ? 0 : newWeights[asset.symbol] / 100),
            0
        );
        if (totalWeightExcludingCurrent > 0) {
            assets.forEach(asset => {
                if (asset.symbol !== symbol) {
                    newWeights[asset.symbol] = ((newWeights[asset.symbol] / 100) / totalWeightExcludingCurrent) * (1 - newWeight) * 100;
                    onWeightChange(asset.symbol, newWeights[asset.symbol] / 100);
                }
            });
        }

        setWeights(newWeights);
    };

    if (assets.length === 0) {
        return <div>No assets to display.</div>;
    }

    return (
        <div>
            {assets.map(asset => (
                <div key={asset.symbol} className="slider-container">
                    <div className="slider-label" style={{ width: '100px' }}>{asset.symbol}</div>
                    <input
                        type="range"
                        className="slider"
                        min="0"
                        max="100"
                        value={weights[asset.symbol] || 0} // Ensure value is defined
                        onChange={e => handleSliderChange(asset.symbol, parseFloat(e.target.value))}
                        disabled={assets.length === 1}
                    />
                </div>
            ))}
        </div>
    );
};

export default WeightSliders;
