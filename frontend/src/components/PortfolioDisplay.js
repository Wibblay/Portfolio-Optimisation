// PortfolioDisplay.js
import React, { useContext } from 'react';
import { PortfolioContext } from '../PortfolioContext';
import './PortfolioDisplay.css';

const PortfolioDisplay = () => {
    const { portfolioAssets, removeAsset } = useContext(PortfolioContext);

    const handleRemoveAsset = (symbol) => {
        removeAsset(symbol);  // Call the context function to remove the asset
    };

    return (
        <div className="portfolio-display">
            <h3>Current Portfolio</h3>
            {Array.isArray(portfolioAssets) ? (
                portfolioAssets.map((asset, index) => (
                    <div key={index} className="asset-container">
                        <p><strong>Ticker:</strong> {asset.symbol}</p>
                        <p><strong>Name:</strong> {asset.name}</p>
                        <button onClick={() => handleRemoveAsset(asset.symbol)} className="remove-button">
                            X
                        </button>
                    </div>
                ))
            ) : (
                <p>No assets to display or data is not loaded yet.</p>
            )}
        </div>
    );
};

export default PortfolioDisplay;

