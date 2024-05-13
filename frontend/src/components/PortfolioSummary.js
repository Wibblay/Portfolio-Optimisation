import React, { useContext, useState, useEffect } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext';
import './PortfolioSummary.css';
import PriceChart from './PriceChart.js'; // Assume this is a component for the chart
import axios from 'axios'; // Using axios for HTTP requests

const PortfolioSummary = () => {
    const { portfolioAssets } = useContext(PortfolioContext);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        if (portfolioAssets.length > 0) { // Only fetch statistics if there are assets
            const fetchStatistics = async () => {
                try {
                    const response = await axios.get('/api/portfolio-statistics');
                    if (response.status === 200) {
                        setStatistics(response.data);
                    } else {
                        console.error("Failed to fetch statistics:", response.data);
                        setStatistics(null); // Reset statistics on failure
                    }
                } catch (error) {
                    console.error("Error fetching statistics:", error);
                    setStatistics(null); // Reset statistics on error
                }
            };

            fetchStatistics();
        } else {
            setStatistics(null); // Reset statistics if there are no assets
        }
    }, [portfolioAssets]); // Dependency on portfolioAssets to refetch when assets change

    return (
        <div className="portfolio-summary">
            <h2>Portfolio Summary</h2>
            <div className="summary-top">
                {statistics ? (
                    <div className="statistics">
                        {/* Ensure each statistic is checked for undefined before rendering */}
                        {statistics['Total Value'] !== undefined && (
                            <div className="statistic">
                                <h4>Total Portfolio Value:</h4>
                                <p>${statistics['Total Value'].toFixed(2)}</p>
                            </div>
                        )}
                        {statistics['Total Return'] !== undefined && (
                            <div className="statistic">
                                <h4>Total Return:</h4>
                                <p>{statistics['Total Return'].toFixed(2)}%</p>
                            </div>
                        )}
                        {statistics['Annual Volatility'] !== undefined && (
                            <div className="statistic">
                                <h4>Annual Volatility:</h4>
                                <p>{statistics['Annual Volatility'].toFixed(2)}%</p>
                            </div>
                        )}
                        {statistics['Sharpe Ratio'] !== undefined && (
                            <div className="statistic">
                                <h4>Sharpe Ratio:</h4>
                                <p>{statistics['Sharpe Ratio'].toFixed(2)}</p>
                            </div>
                        )}
                        {statistics['CAGR'] !== undefined && (
                            <div className="statistic">
                                <h4>CAGR:</h4>
                                <p>{statistics['CAGR'].toFixed(2)}%</p>
                            </div>
                        )}
                        {/* Additional checks and statistics */}
                    </div>
                ) : (
                    <p>{portfolioAssets.length > 0 ? "Loading statistics..." : "No assets in portfolio."}</p>
                )}
            </div>
            <div className="summary-bottom">
                {/* {portfolioAssets.length > 0 && <PriceChart assets={portfolioAssets} />} */}
            </div>
        </div>
    );
};

export default PortfolioSummary;
