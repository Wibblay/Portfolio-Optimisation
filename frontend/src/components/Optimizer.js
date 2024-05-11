// components/Optimizer.js
import React, { useContext } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext'; // Adjust path as needed
import DraggablePieChart from './WeightPieChart'; 
import PortfolioTable from './PortfolioTable';
import WeightSliders from './WeightSliders'; // Import the WeightSliders component
import './Optimizer.css'; 

const Optimizer = () => {
    const { portfolioAssets } = useContext(PortfolioContext);
    
    // Transform assets into suitable data for the pie chart and sliders
    const pieChartData = portfolioAssets.map(asset => ({
        symbol: asset.symbol, // Assuming each asset has a 'symbol' and 'weight'
        weight: asset.weight
    }));

    return (
        <div className="optimizer-section">
            <h2>Optimization Environment</h2>
            <div className="weight-display">
                <div className="weight-display-header">
                    <h3>Weight Distribution</h3>
                </div>
                <div className="weight-display-content">
                    <div className="pie-chart-container">
                        <DraggablePieChart data={pieChartData} />
                    </div>
                    <div className="table-container">
                        <h3>Portfolio Details</h3>
                        <PortfolioTable assets={portfolioAssets} />
                    </div>
                </div>
                {/* Slider container for weight adjustments */}
                <div className="sliders-container">
                    <h3>Adjust Portfolio Weights</h3>
                    {/* <WeightSliders assets={portfolioAssets} /> */}
                </div>
            </div>
            <div className="optimization-tools">
                <h3>Optimization Tools</h3>
                {/* Placeholder for future optimization tools */}
            </div>
        </div>
    );
}

export default Optimizer;
