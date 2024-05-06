// PortfolioDisplay.js
import React, { useContext, useEffect, useState } from 'react';
import { PortfolioContext } from '../PortfolioContext';
import PriceChart from './PriceChart';
import './PortfolioDisplay.css';

const PortfolioDisplay = () => {
    const { portfolioAssets, removeAsset } = useContext(PortfolioContext);

    return (
        <div className="portfolio-display">
            <h3>Current Portfolio</h3>
            {portfolioAssets.map((asset, index) => (
                <div key={index} className="asset-container">
                    <div className="asset-details">
                        <p><strong>Ticker:</strong> {asset.symbol}</p>
                        <p><strong>Name:</strong> {asset.name}</p>
                    </div>
                    <button 
                        onClick={() => removeAsset(asset.symbol)}
                        className="remove-button"
                    >
                        X
                    </button>
                    <AssetPriceChart symbol={asset.symbol} /> {/* Add this line to include the price chart */}
                </div>
            ))}
        </div>
    );
};

export default PortfolioDisplay;

const AssetPriceChart = ({ symbol }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/historical-data/${symbol}`);
                const jsonData = await response.json();
                const formattedData = jsonData.map(item => ({
                    date: item.Date, // Assuming the API returns 'date'
                    price: item.Close // Assuming the API returns 'close' price
                }));
                setData(formattedData);
            } catch (error) {
                console.error("Failed to fetch price data", error);
            }
        };
        fetchData();
    }, [symbol]);

    return <PriceChart data={data} />;
};