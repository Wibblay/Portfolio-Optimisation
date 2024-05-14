/* Summary.js */
import React, { useContext, useState, useEffect } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext.js';
import './Summary.css';
import PriceChart from './PriceChart.js';
import axios from 'axios';

/**
 * Fetches statistics data from the backend API.
 * 
 * @param {function} setStatistics - Function to update the statistics state.
 */
const fetchStatisticsData = async (setStatistics) => {
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

/**
 * Component to display the portfolio summary.
 * Shows portfolio statistics and a cumulative returns chart.
 */
const PortfolioSummary = () => {
    const { portfolioAssets } = useContext(PortfolioContext);
    const [statistics, setStatistics] = useState(null);
    const [startDate, setStartDate] = useState(() => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return oneYearAgo.toISOString().split('T')[0]; // Formats to YYYY-MM-DD
    });
    const [activeButton, setActiveButton] = useState('1Y');

    // Fetch statistics data when portfolio assets change
    useEffect(() => {
        if (portfolioAssets.length > 0) {
            fetchStatisticsData(setStatistics);
        } else {
            setStatistics(null); // Reset statistics if there are no assets
        }
    }, [portfolioAssets]);

    /**
     * Handles the button click to set the start date for the returns chart.
     * 
     * @param {string} period - The period for the start date (1M, 6M, 1Y).
     */
    const handleButtonClick = (period) => {
        const today = new Date();
        let newStartDate;
        switch (period) {
            case '1M':
                newStartDate = new Date(today.setMonth(today.getMonth() - 1));
                break;
            case '6M':
                newStartDate = new Date(today.setMonth(today.getMonth() - 6));
                break;
            case '1Y':
            default:
                newStartDate = new Date(today.setFullYear(today.getFullYear() - 1));
                break;
        }
        setStartDate(newStartDate.toISOString().split('T')[0]);
        setActiveButton(period);
    };

    const todayDate = new Date().toISOString().split('T')[0];

    return (
        <div className="portfolio-summary">
            <h2>Portfolio Summary</h2>
            <div className="summary-top">
                {statistics ? (
                    <StatisticsDisplay statistics={statistics} />
                ) : (
                    <p>{portfolioAssets.length > 0 ? "Loading statistics..." : "No assets in portfolio."}</p>
                )}
            </div>
            {portfolioAssets.length > 0 && (
                <div className="summary-bottom">
                    <h3>Cumulative Returns (%)</h3>
                    <div className="controls">
                        <div className="button-group">
                            <button 
                                className={activeButton === '1M' ? 'active' : ''}
                                onClick={() => handleButtonClick('1M')}
                            >
                                1M
                            </button>
                            <button 
                                className={activeButton === '6M' ? 'active' : ''}
                                onClick={() => handleButtonClick('6M')}
                            >
                                6M
                            </button>
                            <button 
                                className={activeButton === '1Y' ? 'active' : ''}
                                onClick={() => handleButtonClick('1Y')}
                            >
                                1Y
                            </button>
                        </div>
                        <div className="date-input-container">
                            <label htmlFor="custom-date">Set custom start date:</label>
                            <input
                                id="custom-date"
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="date-input"
                                max={todayDate}
                            />
                        </div>
                    </div>
                    <div className="returns-chart-container">
                        <PortfolioReturnsChart startDate={startDate} />
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Component to display formatted portfolio statistics.
 * 
 * @param {object} statistics - The statistics data to display.
 * @returns {JSX.Element} The rendered StatisticsDisplay component.
 */
const StatisticsDisplay = ({ statistics }) => {
    const formattedStatistics = [
        { key: 'Total Value', label: 'Total Value (USD)', value: `$${statistics['Total Value'].toFixed(2)}` },
        { key: 'Total Return', label: '3 Year Total Return (%)', value: `${statistics['Total Return'].toFixed(2)}%` },
        { key: 'Annual Volatility', label: 'Annual Volatility (%)', value: `${statistics['Annual Volatility'].toFixed(2)}%` },
        { key: 'Sharpe Ratio', label: 'Sharpe Ratio', value: statistics['Sharpe Ratio'].toFixed(2) },
        { key: 'CAGR', label: 'CAGR (3 Years)', value: `${statistics['CAGR'].toFixed(2)}%` },
    ];

    return (
        <div className="summary-statistics">
            {formattedStatistics.map(({ key, label, value }) => (
                <div className="statistic" key={key}>
                    <h4>{label}:</h4>
                    <p>{value}</p>
                </div>
            ))}
        </div>
    );
};

/**
 * Component to display the portfolio returns chart.
 * 
 * @param {string} startDate - The start date for the returns data.
 * @returns {JSX.Element} The rendered PortfolioReturnsChart component.
 */
const PortfolioReturnsChart = ({ startDate }) => {
    const { portfolioAssets } = useContext(PortfolioContext); // Use context to access portfolio assets
    const [data, setData] = useState([]);

    // Fetch returns data when the start date or portfolio assets change
    useEffect(() => {
        const fetchData = async () => {
            if (portfolioAssets.length > 0) {
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
    }, [startDate, portfolioAssets]);

    return data.length > 0 ? <PriceChart data={data} /> : <div>Loading chart...</div>;
};

export default PortfolioSummary;
