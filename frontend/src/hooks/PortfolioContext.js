import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    fetchAssetsApi,
    addAssetApi,
    removeAssetApi,
    updateAssetWeightsApi,
    optimizePortfolioApi
} from './Api';

export const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
    const [portfolioAssets, setPortfolioAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        fetchAssets();
    }, []);

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

export const usePortfolio = () => useContext(PortfolioContext);