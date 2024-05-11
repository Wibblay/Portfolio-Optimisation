import React, { useState, useEffect } from 'react';

const WeightSliders = ({ assets }) => {
    const [weights, setWeights] = useState({});

    useEffect(() => {
        // Initialize or re-initialize weights when assets change
        const initialWeights = {};
        const perAsset = 100 / assets.length;
        assets.forEach(asset => {
            initialWeights[asset.symbol] = perAsset;
        });
        setWeights(initialWeights);
    }, [assets]);

    const handleSliderChange = (symbol, newValue) => {
        const totalOtherWeights = Object.keys(weights).reduce(
            (total, key) => total + (key === symbol ? 0 : weights[key]),
            0
        );
        const newWeights = {};
        const remainingWeight = 100 - newValue;

        // Scale other weights to fit the remaining percentage
        Object.keys(weights).forEach(key => {
            if (key === symbol) {
                newWeights[key] = newValue;
            } else {
                newWeights[key] = (weights[key] / totalOtherWeights) * remainingWeight;
            }
        });

        setWeights(newWeights);
    };

    return (
        <div>
            {assets.map(asset => (
                <div key={asset.symbol}>
                    <label>{asset.name}: {weights[asset.symbol].toFixed(2)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={weights[asset.symbol]}
                        onChange={e => handleSliderChange(asset.symbol, parseFloat(e.target.value))}
                    />
                </div>
            ))}
        </div>
    );
};

export default WeightSliders;
