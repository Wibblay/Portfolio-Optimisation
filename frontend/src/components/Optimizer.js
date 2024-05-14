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
  const [optimizationMessage, setOptimizationMessage] = useState('');

  // Initialize or update assets when portfolioAssets changes
  useEffect(() => {
    dispatch({ type: 'INIT', payload: portfolioAssets });
  }, [portfolioAssets]);

  // Handle weight changes and propagate them to all children
  const handleWeightChange = (symbol, newWeight) => {
    dispatch({ type: 'UPDATE_WEIGHT', payload: { symbol, newWeight } });
  };

  // Commit changes to backend
  const handleCommitChanges = async () => {
    const payload = assets.map(asset => ({
      symbol: asset.symbol,
      weight: asset.weight
    }));
    await updateAssetWeights(payload);  // Your method to update weights in the backend
  };

  // Reset to previous values by re-fetching assets
  const handleReset = async () => {
    console.log("Resetting assets to previous values");
    await fetchAssets();  // Re-fetch assets from the backend to reset state
  };

  // Optimize portfolio
  const handleOptimizeClick = async () => {
    try {
      await optimizePortfolio({ startDate, desiredReturn });
      await fetchAssets();  // Fetch the updated weights after optimization
      setOptimizationMessage('Optimization completed successfully!');
      setTimeout(() => setOptimizationMessage(''), 3000);  // Clear message after 3 seconds
    } catch (error) {
      console.error("Optimization failed: ", error);
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="optimizer-section">
      <h2>Current Portfolio Weights</h2>
      <div className="weight-display">
        <div className="weight-display-content">
          <div className="pie-chart-container">
            <WeightPieChart data={assets} />
          </div>
          <div className="table-container">
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
        <h3>Markowitz Optimizer</h3>
        <p>Optimize your portfolio weights automatically with this tool.</p>
        <div className="optimization-inputs">
          <label>
            Enter desired start date (default: 1 year ago):
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              max={todayDate} // Restrict to past dates
              className="date-input"
            />
          </label>
          <label>
            Enter desired level of return (default: auto-calculated):
            <input 
              type="number" 
              placeholder="Desired return (%)" 
              value={desiredReturn} 
              onChange={e => setDesiredReturn(e.target.value)} 
              className="return-input"
            />
          </label>
        </div>
        <button onClick={handleOptimizeClick}>Run Optimizer</button>
        {optimizationMessage && <p className="optimization-message">{optimizationMessage}</p>}
      </div>
    </div>
  );
}

export default Optimizer;
