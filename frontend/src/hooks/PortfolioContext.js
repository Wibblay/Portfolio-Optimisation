/* PortfolioContext.js */
import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    fetchAssetsApi,
    addAssetApi,
    removeAssetApi,
    updateAssetWeightsApi,
    optimizePortfolioApi
} from './Api';

// Create a context for the portfolio
export const PortfolioContext = createContext();

/**
 * Provider component for the PortfolioContext.
 * It manages the state and functions related to the portfolio and provides them to its children.
 * 
 * @param {Object} children - The child components that will consume the context.
 * @returns {JSX.Element} The provider component.
 */
export const PortfolioProvider = ({ children }) => {
    // State to hold portfolio assets
    const [portfolioAssets, setPortfolioAssets] = useState([]);
    // State to indicate loading status
    const [loading, setLoading] = useState(false);
    // State to hold error messages
    const [error, setError] = useState(null);

    /**
     * Fetches assets from the backend API and updates the state.
     */
    const fetchAssets = async () => {
        setLoading(true);
        try {
            const assets = await fetchAssetsApi();
            setPortfolioAssets(assets);
        } catch (error) {
            setError('Failed to fetch assets');
            console.error("Failed to fetch assets: ", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch assets when the component mounts
    useEffect(() => {
        fetchAssets();
    }, []);

    /**
     * Adds a new asset to the portfolio.
     * 
     * @param {Object} asset - The asset to add.
     */
    const addAsset = async (asset) => {
        if (!portfolioAssets.some(a => a.symbol === asset.symbol)) {
            setLoading(true);
            try {
                const status = await addAssetApi(asset);
                if (status === 200) {
                    fetchAssets();
                } else {
                    setError('Failed to add asset');
                }
            } catch (error) {
                setError('Failed to add asset');
                console.error("Failed to add asset: ", error);
            } finally {
                setLoading(false);
            }
        } else {
            console.log("Asset already in the portfolio: ", asset.symbol);
        }
    };

    /**
     * Removes an asset from the portfolio.
     * 
     * @param {string} symbol - The symbol of the asset to remove.
     */
    const removeAsset = async (symbol) => {
        setLoading(true);
        try {
            const status = await removeAssetApi(symbol);
            if (status === 200) {
                fetchAssets();
            } else {
                setError('Failed to remove asset');
            }
        } catch (error) {
            setError('Failed to remove asset');
            console.error("Failed to remove asset: ", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Updates the weights of the assets in the portfolio.
     * 
     * @param {Array} updatedWeights - The new weights for the assets.
     */
    const updateAssetWeights = async (updatedWeights) => {
        setLoading(true);
        try {
            const status = await updateAssetWeightsApi(updatedWeights);
            if (status === 200) {
                fetchAssets();
            } else {
                setError('Failed to update weights');
            }
        } catch (error) {
            setError('Failed to update weights');
            console.error("Failed to update asset weights: ", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Optimizes the portfolio based on the provided parameters.
     * 
     * @param {Object} params - The parameters for the optimization.
     */
    const optimizePortfolio = async (params) => {
        setLoading(true);
        try {
            const status = await optimizePortfolioApi(params);
            if (status === 200) {
                console.log("Optimization successful");
            } else {
                setError('Optimization failed');
                console.error('Optimization failed');
            }
        } catch (error) {
            setError('Error during optimization');
            console.error('Error during optimization:', error);
        } finally {
            setLoading(false);
        }
    };

    // Provide the portfolio context to child components
    return (
        <PortfolioContext.Provider value={{
            portfolioAssets,
            addAsset,
            removeAsset,
            fetchAssets,
            updateAssetWeights,
            optimizePortfolio,
            loading,
            error
        }}>
            {children}
        </PortfolioContext.Provider>
    );
};

// Custom hook to use the PortfolioContext
export const usePortfolio = () => useContext(PortfolioContext);
