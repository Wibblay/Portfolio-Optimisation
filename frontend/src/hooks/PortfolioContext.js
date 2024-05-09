import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Axios is commonly used for HTTP requests

// Create the context
export const PortfolioContext = createContext();

// Provider component that wraps your app and provides state to components
export const PortfolioProvider = ({ children }) => {
    const [portfolioAssets, setPortfolioAssets] = useState([]);

    // Load initial data
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const response = await axios.get('/api/portfolio-tickers');
                // Ensure that response.data or its correct key is always an array
                setPortfolioAssets(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to fetch assets: ", error);
                setPortfolioAssets([]); // Set to empty array on error
            }
        };
    
        fetchAssets();
    }, []);

    // Function to add an asset to the portfolio
    const addAsset = async (asset) => {
        if (!portfolioAssets.some(a => a.symbol === asset.symbol)) {
            try {
                const response = await axios.post('/api/add-tickers', asset);
                // Ensure the response contains the asset data in the expected format
                setPortfolioAssets(prevAssets => [...prevAssets, response.data.asset || asset]); // Adjust based on actual response
            } catch (error) {
                console.error("Failed to add asset: ", error);
            }
        } else {
            console.log("Asset already in the portfolio: ", asset.symbol);
        }
    };

    // Function to remove an asset from the portfolio
    const removeAsset = async (symbol) => {
        try {
            await axios.delete(`/api/remove-ticker/${symbol}`);
            setPortfolioAssets(prevAssets => prevAssets.filter(a => a.symbol !== symbol));
        } catch (error) {
            console.error("Failed to remove asset: ", error);
        }
    };

    return (
        <PortfolioContext.Provider value={{ portfolioAssets, addAsset, removeAsset }}>
            {children}
        </PortfolioContext.Provider>
    );
};

// Custom hook for easier context consumption
export const usePortfolio = () => useContext(PortfolioContext);
