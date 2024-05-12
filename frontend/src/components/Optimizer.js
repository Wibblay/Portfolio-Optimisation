import React, { useContext, useState, useEffect, useReducer } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext';
import WeightPieChart from './WeightPieChart';
import PortfolioTable from './PortfolioTable';
import WeightSliders from './WeightSliders';
import './Optimizer.css';

// Reducer function to handle state updates in a controlled manner
function assetReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload.map(asset => ({
        ...asset,
        weight: asset.weight || 0 // Ensure proper initialization
      }));
    case 'UPDATE_WEIGHT':
      return state.map(asset =>
        asset.symbol === action.payload.symbol
          ? { ...asset, weight: action.payload.newWeight }
          : asset
      );
    case 'SET_OPTIMIZED_WEIGHTS':
      return action.payload; 
    default:
      return state;
  }
}

const Optimizer = () => {
    const { portfolioAssets, fetchAssets, updateAssetWeights, optimizePortfolio } = useContext(PortfolioContext);
    const [assets, dispatch] = useReducer(assetReducer, []);
    const [startDate, setStartDate] = useState('');
    const [desiredReturn, setDesiredReturn] = useState('');

    // Initialize or update assets when portfolioAssets changes
    useEffect(() => {
        dispatch({ type: 'INIT', payload: portfolioAssets });
    }, [portfolioAssets]);

    // Handle weight changes and propagate them to all children
    const handleWeightChange = (symbol, newWeight) => {
        dispatch({ type: 'UPDATE_WEIGHT', payload: { symbol, newWeight } });
    };

    const handleCommitChanges = async () => {
        // Here you would typically send a POST request to your API
        const payload = assets.map(asset => ({
            symbol: asset.symbol,
            weight: asset.weight
        }));
        await updateAssetWeights(payload);  // Your method to update weights in the backend
    };

    const handleReset = async () => {
        console.log("Resetting assets to previous values")
        await fetchAssets();  // Re-fetch assets from the backend to reset state
    };

    const handleOptimizeClick = async () => {
        try {
            await optimizePortfolio({ startDate, desiredReturn });
            await fetchAssets();  // Fetch the updated weights after optimization
        } catch (error) {
            console.error("Optimization failed: ", error);
        }
    };

    return (
        <div className="optimizer-section">
            <h2>Optimization Environment</h2>
            <div className="weight-display">
                <div className="weight-display-header">
                    <h3>Weight Distribution</h3>
                </div>
                <div className="weight-display-content">
                    <div className="pie-chart-container">
                        <WeightPieChart data={assets} />
                    </div>
                    <div className="table-container">
                        <h3>Portfolio Details</h3>
                        <PortfolioTable assets={assets} />
                    </div>
                </div>
                <div className="sliders-container">
                        <h3>Adjust Portfolio Weights</h3>
                        <WeightSliders assets={assets} onWeightChange={handleWeightChange} />
                        <div className="controls">
                            <button onClick={handleCommitChanges}>Commit Changes</button>
                            <button onClick={handleReset}>Reset</button>
                        </div>
                    </div>
            </div>
            <div className="optimization-tools">
                <h3>Optimization Tools</h3>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="number" placeholder="Desired return (%)" value={desiredReturn} onChange={e => setDesiredReturn(e.target.value)} />
                <button onClick={handleOptimizeClick}>Optimize Portfolio</button>
            </div>
        </div>
    );
}

export default Optimizer;
