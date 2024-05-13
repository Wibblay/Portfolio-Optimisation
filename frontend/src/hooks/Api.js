import axios from 'axios';

export const fetchAssetsApi = async () => {
    const response = await axios.get('/api/portfolio-tickers');
    return response.data.assets;
};

export const addAssetApi = async (asset) => {
    const response = await axios.post('/api/add-tickers', asset);
    return response.status;
};

export const removeAssetApi = async (symbol) => {
    const response = await axios.delete(`/api/remove-ticker/${symbol}`);
    return response.status;
};

export const updateAssetWeightsApi = async (updatedWeights) => {
    const response = await axios.post('/api/update-weights', updatedWeights);
    return response.status;
};

export const optimizePortfolioApi = async (params) => {
    const response = await axios.post('/api/optimize-portfolio', params);
    return response.status;
};
