/* Api.js */
import axios from 'axios';

/**
 * Fetches the current portfolio assets from the backend API.
 * 
 * @returns {Array} An array of asset objects.
 * @throws {Error} If the request fails.
 */
export const fetchAssetsApi = async () => {
    const response = await axios.get('/api/portfolio-tickers');
    return response.data.assets;
};

/**
 * Adds a new asset to the portfolio via the backend API.
 * 
 * @param {Object} asset - The asset to add, with properties such as symbol and name.
 * @returns {number} The HTTP status code from the response.
 * @throws {Error} If the request fails.
 */
export const addAssetApi = async (asset) => {
    const response = await axios.post('/api/add-tickers', asset);
    return response.status;
};

/**
 * Removes an asset from the portfolio via the backend API.
 * 
 * @param {string} symbol - The symbol of the asset to remove.
 * @returns {number} The HTTP status code from the response.
 * @throws {Error} If the request fails.
 */
export const removeAssetApi = async (symbol) => {
    const response = await axios.delete(`/api/remove-ticker/${symbol}`);
    return response.status;
};

/**
 * Updates the weights of the assets in the portfolio via the backend API.
 * 
 * @param {Array} updatedWeights - An array of objects with updated weights for each asset.
 * @returns {number} The HTTP status code from the response.
 * @throws {Error} If the request fails.
 */
export const updateAssetWeightsApi = async (updatedWeights) => {
    const response = await axios.post('/api/update-weights', updatedWeights);
    return response.status;
};

/**
 * Optimizes the portfolio based on provided parameters via the backend API.
 * 
 * @param {Object} params - The parameters for the optimization, such as start date and desired return.
 * @returns {number} The HTTP status code from the response.
 * @throws {Error} If the request fails.
 */
export const optimizePortfolioApi = async (params) => {
    const response = await axios.post('/api/optimize-portfolio', params);
    return response.status;
};
