/* PortfolioBuilder.js */
import React, { useContext, useCallback, useState, useEffect } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext.js';
import PriceChart from './PriceChart.js';
import '../styles/PortfolioBuilder.css';

/**
 * Component to display the current portfolio.
 * It maps through the portfolio assets and displays their details along with a price chart and a remove button.
 */
const PortfolioBuilder = () => {
    const { portfolioAssets, removeAsset } = useContext(PortfolioContext);

    /**
     * Handler to remove an asset from the portfolio.
     * It calls the removeAsset function from the context.
     * 
     * @param {string} symbol - The symbol of the asset to remove.
     */
    const handleRemove = useCallback((symbol) => {
        removeAsset(symbol);
    }, [removeAsset]);

    return (
        <div className="portfolio-builder">
            <h3>Current Portfolio</h3>
            {portfolioAssets.map((asset, index) => (
                <div key={index} className="asset-container">
                    <div className="asset-details">
                        <p><strong>Ticker:</strong> {asset.symbol}</p>
                        <p><strong>Name:</strong> {asset.name}</p>
                        <p><strong>Sector:</strong> {asset.sector}</p>
                        <p><strong>Industry:</strong> {asset.industry}</p>
                    </div>
                    <div className="chart-and-remove">
                        <div className="remove-button-container">
                            <p><strong>Recent Closing Prices in {asset.currency}</strong></p>
                            <button 
                                onClick={() => handleRemove(asset.symbol)}
                                className="remove-button"
                            >
                                X
                            </button>
                        </div>
                        <div className="price-chart-container-container">
                            <AssetPriceChart symbol={asset.symbol} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PortfolioBuilder;

/**
 * Component to fetch and display the price chart for a given asset.
 * It fetches historical price data for the asset and displays it using the PriceChart component.
 * 
 * @param {string} symbol - The symbol of the asset to fetch price data for.
 */
const AssetPriceChart = ({ symbol }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        let isMounted = true;

        /**
         * Fetches historical price data for the asset.
         */
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/historical-data/${symbol}`);
                const jsonData = await response.json();
                const formattedData = jsonData.map(item => ({
                    date: item.Date, 
                    price: item.Close 
                }));
                if (isMounted) setData(formattedData);
            } catch (error) {
                console.error("Failed to fetch price data", error);
            }
        };
        fetchData();

        // Cleanup function to set isMounted to false when the component unmounts
        return () => {
            isMounted = false;
        };
    }, [symbol]);

    // Render PriceChart only if data is not empty
    return data.length > 0 ? <PriceChart data={data} /> : <div>Loading chart...</div>;
};
