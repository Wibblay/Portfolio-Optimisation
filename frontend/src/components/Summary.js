import React, { useContext, useState, useEffect } from 'react';
import { PortfolioContext } from '../hooks/PortfolioContext.js';
import './Summary.css';
import PriceChart from './PriceChart.js';
import axios from 'axios';

// Fetch statistics data from API
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

const PortfolioSummary = () => {
    const { portfolioAssets } = useContext(PortfolioContext);
    const [statistics, setStatistics] = useState(null);
    const [startDate, setStartDate] = useState(() => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return oneYearAgo.toISOString().split('T')[0]; // Formats to YYYY-MM-DD
    });
    const [activeButton, setActiveButton] = useState('1Y');

    useEffect(() => {
        if (portfolioAssets.length > 0) {
            fetchStatisticsData(setStatistics);
        } else {
            setStatistics(null); // Reset statistics if there are no assets
        }
    }, [portfolioAssets]);

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
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="date-input"
                            max={todayDate}
                        />
                    </div>
                    <h3>Cumulative Returns</h3>
                    <PortfolioReturnsChart startDate={startDate} />
                </div>
            )}
        </div>
    );
};

const StatisticsDisplay = ({ statistics }) => (
    <div className="statistics">
        {Object.entries(statistics).map(([key, value]) => (
            <div className="statistic" key={key}>
                <h4>{key}:</h4>
                <p>{typeof value === 'number' ? value.toFixed(2) : value}</p>
            </div>
        ))}
    </div>
);

const PortfolioReturnsChart = ({ startDate }) => {
    const { portfolioAssets } = useContext(PortfolioContext); // Use context to access portfolio assets
    const [data, setData] = useState([]);

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
