import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
    const [portfolioAssets, setPortfolioAssets] = useState([]);

    const fetchAssets = async () => {
        try {
            const response = await axios.get('/api/portfolio-tickers');
            console.log("Fetch reponse: ", response)
            if (response.status === 200 && Array.isArray(response.data.assets)) {
                setPortfolioAssets(response.data.assets);
            } else {
                throw new Error('Invalid format for portfolio assets');
            }
        } catch (error) {
            console.error("Failed to fetch assets: ", error);
            setPortfolioAssets([]); // Optionally, reset on error or maintain old state
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const addAsset = async (asset) => {
        if (!portfolioAssets.some(a => a.symbol === asset.symbol)) {
            try {
                const addResponse = await axios.post('/api/add-tickers', asset);
                if (addResponse.status === 200) {
                    fetchAssets(); // Refresh after a successful add
                } else {
                    throw new Error('Failed to add asset');
                }
            } catch (error) {
                console.error("Failed to add asset: ", error);
            }
        } else {
            console.log("Asset already in the portfolio: ", asset.symbol);
        }
    };

    const removeAsset = async (symbol) => {
        try {
            const removeResponse = await axios.delete(`/api/remove-ticker/${symbol}`);
            if (removeResponse.status === 200) {
                fetchAssets(); // Refresh after a successful remove
            } else {
                throw new Error('Failed to remove asset');
            }
        } catch (error) {
            console.error("Failed to remove asset: ", error);
        }
    };

    const updateAssetWeights = async (updatedWeights) => {
        try {
            const updateResponse = await axios.post('/api/update-weights', updatedWeights);
            if (updateResponse.status === 200) {
                console.log("Weights updated successfully");
                fetchAssets();  // Refresh the assets to reflect the updated weights
            } else {
                throw new Error('Failed to update weights');
            }
        } catch (error) {
            console.error("Failed to update asset weights: ", error);
        }
    };

    const optimizePortfolio = async (params) => {
        try {
            const optimizeResponse = await axios.post('/api/optimize-portfolio', params);
            if (optimizeResponse.status === 200) {
                console.log("Optimization successful")
            } else {
                console.error('Optimization failed:', optimizeResponse.data.error);
            }
        } catch (error) {
            console.error('Error during optimization:', error);
        }
    };

    return (
        <PortfolioContext.Provider value={{ 
            portfolioAssets, 
            addAsset, 
            removeAsset, 
            fetchAssets, 
            updateAssetWeights,
            optimizePortfolio 
        }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => useContext(PortfolioContext);

