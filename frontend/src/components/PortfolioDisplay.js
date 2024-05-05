// PortfolioDisplay.js
import React, { useContext } from 'react';
import { PortfolioContext } from '../PortfolioContext';

const PortfolioDisplay = () => {
    const { portfolioTickers } = useContext(PortfolioContext);

    return (
        <div className="portfolio-display">
            <h3>Current Portfolio</h3>
            <ul>
                {portfolioTickers.map((ticker, index) => (
                    <li key={index}>{ticker}</li>
                ))}
            </ul>
        </div>
    );
};

export default PortfolioDisplay;

