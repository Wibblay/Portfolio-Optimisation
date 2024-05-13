import React, { useContext, useState, useEffect } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext';
import './PortfolioSummary.css';
import PriceChart from './PriceChart.js'; // Assume this is a component for the chart
import axios from 'axios'; // Using axios for HTTP requests

const PortfolioSummary = () => {
    const { portfolioAssets } = useContext(PortfolioContext);
    const [statistics, setStatistics] = useState(null);
    const [startDate, setStartDate] = useState(() => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return oneYearAgo.toISOString().split('T')[0]; // Formats to YYYY-MM-DD
    });

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
                        {Object.entries(statistics).map(([key, value]) => (
                            <div className="statistic" key={key}>
                                <h4>{key}:</h4>
                                <p>{typeof value === 'number' ? value.toFixed(2) : value}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>{portfolioAssets.length > 0 ? "Loading statistics..." : "No assets in portfolio."}</p>
                )}
            </div>
            {portfolioAssets.length > 0 && (
                <div className="summary-bottom">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                    <PortfolioReturnsChart startDate={startDate} />
                </div>
            )}
        </div>
    );
};

export default PortfolioSummary;

const PortfolioReturnsChart = ({ startDate }) => {
    const { portfolioAssets } = useContext(PortfolioContext); // Use context to access portfolio assets
    const [data, setData] = useState([]);

    useEffect(() => {
        // Define an async function inside the useEffect to fetch data
        const fetchData = async () => {
            if (portfolioAssets.length > 0) { // Ensure there are assets before fetching data
                try {
                    const response = await axios.get(`/api/portfolio-returns/${startDate}`);
                    if (response.status === 200) {
                        const jsonData = response.data;
                        const formattedData = jsonData.map(item => ({
                            date: item.Date, // Make sure these keys match your actual API response
                            price: item.Close // Make sure these keys match your actual API response
                        }));
                        setData(formattedData);
                    } else {
                        console.error("Failed to fetch price data: ", response.data);
                        setData([]); // Reset data on failure
                    }
                } catch (error) {
                    console.error("Failed to fetch price data", error);
                    setData([]); // Reset data on error
                }
            } else {
                setData([]); // Reset data if there are no assets
            }
        };

        fetchData();

        return () => {
            // Cleanup function if needed
        };
    }, [startDate, portfolioAssets]); // Include portfolioAssets as a dependency

    return data.length > 0 ? <PriceChart data={data} /> : <div>Loading chart...</div>;
};
