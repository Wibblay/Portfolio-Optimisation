import React, { useContext } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext';
import './PortfolioSummary.css';
import PriceChart from './PriceChart.js'; // Assume this is a component for the chart

const PortfolioSummary = () => {
    const { portfolioAssets } = useContext(PortfolioContext);

    return (
        <div className="portfolio-summary">
            <h2>Portfolio Summary</h2>
            <div className="summary-top">
                <div className="statistics">
                </div>
            </div>
            <div className="summary-bottom">
                {/* <PriceChart assets={portfolioAssets} /> */}
            </div>
        </div>
    );
}

export default PortfolioSummary;
