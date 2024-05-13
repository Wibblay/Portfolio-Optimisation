// PortfolioDisplay.js
import React, { useContext, useEffect, useState } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext.js';
import PriceChart from './PriceChart.js';
import './PortfolioBuilder.css';

const PortfolioBuilder = () => {
    const { portfolioAssets, removeAsset } = useContext(PortfolioContext);

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
                                onClick={() => removeAsset(asset.symbol)}
                                className="remove-button"
                            >
                                X
                            </button>
                        </div>
                        <div className="price-chart-container">
                            <AssetPriceChart symbol={asset.symbol} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
    
};

export default PortfolioBuilder;

const AssetPriceChart = ({ symbol }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch(`/api/historical-data/${symbol}`);
                const jsonData = await response.json();
                const formattedData = jsonData.map(item => ({
                    date: item.Date, // Assuming the API returns 'date'
                    price: item.Close // Assuming the API returns 'close' price
                }));
                if (isMounted) setData(formattedData);
            } catch (error) {
                console.error("Failed to fetch price data", error);
            }
        };
        fetchData();

        return () => {
            isMounted = false; // Set it to false when the component unmounts
        };
    }, [symbol]);

    // Render PriceChart only if data is not empty
    return data.length > 0 ? <PriceChart data={data} /> : <div>Loading chart...</div>;
};
