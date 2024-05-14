import numpy as np
from datetime import datetime, timedelta
import yfinance as yf
from scipy.optimize import minimize
from src.data_fetcher import fetch_historical_data
from src.fetch_exchange_rates import fetch_exchange_rates
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Portfolio:
    def __init__(self, assets=None):
        """
        Initialize a portfolio with given assets and weights.
        
        Args:
        - assets (list, optional): List of assets (e.g., [{"symbol": "AAPL", "name": "Apple Inc."}]).
        """
        self.assets = assets if assets else []

    def add_asset(self, asset):
        """
        Add an asset to the portfolio.
        
        Args:
        - asset (dict): Asset to add (e.g., {"symbol": "GOOGL", "name": "Alphabet Inc."}).
        """
        if not any(a['symbol'] == asset['symbol'] for a in self.assets):
            asset_info = yf.Ticker(asset['symbol']).info
            asset.update({
                'sector': asset_info.get('sector', 'N/A'),
                'industry': asset_info.get('industry', 'N/A'),
                'currency': asset_info.get('currency', 'USD')
            })
            self.assets.append(asset)
            self.recalculate_weights()
            logging.info(f"Added asset: {asset['symbol']}")
        else:
            logging.warning(f"Asset already in portfolio: {asset['symbol']}")

    def remove_asset(self, symbol):
        """
        Remove an asset from the portfolio by its symbol.
        
        Args:
        - symbol (str): The symbol of the asset to remove.
        
        Returns:
        - bool: True if an asset was removed, False otherwise.
        """
        original_count = len(self.assets)
        self.assets = [asset for asset in self.assets if asset['symbol'] != symbol]
        self.recalculate_weights()
        asset_removed = len(self.assets) < original_count
        logging.info(f"Removed asset: {symbol}" if asset_removed else f"Asset not found: {symbol}")
        return asset_removed
    
    def recalculate_weights(self):
        """
        Recalculate and equally distribute weights among all assets in the portfolio.
        """
        if self.assets:
            equal_weight = 1 / len(self.assets)
            for asset in self.assets:
                asset['weight'] = equal_weight
            logging.info("Recalculated weights.")

    def update_weights(self, updated_assets):
        """
        Update the weights of assets in the portfolio.
        
        Args:
        - updated_assets (list): List of assets with updated weights.
        
        Returns:
        - bool: True if weights were updated successfully, False otherwise.
        """
        try:
            for update in updated_assets:
                for asset in self.assets:
                    if asset['symbol'] == update['symbol']:
                        asset['weight'] = update['weight']
                        break
            logging.info("Weights updated successfully.")
            return True
        except Exception as e:
            logging.error(f"Failed to update asset weights: {e}")
            return False
        
    def isolate_close_prices(self, historical_data):
        """
        Isolate close prices from historical data.
        
        Args:
        - historical_data (pd.DataFrame): DataFrame containing historical data.
        
        Returns:
        - pd.Series or pd.DataFrame: Close prices.
        
        Raises:
        - ValueError: If close prices are not available.
        """
        if historical_data.empty:
            raise ValueError("No historical data available.")
        
        try:
            close_prices = historical_data['Close']
            return close_prices
        except KeyError:
            raise ValueError("Close prices not available in the historical data.")
        
    def calculate_daily_returns(self, close_prices):
        """
        Calculate daily returns from close prices.
        
        Args:
        - close_prices (pd.Series or pd.DataFrame): Close prices.
        
        Returns:
        - pd.Series or pd.DataFrame: Daily returns.
        """
        return close_prices.pct_change().dropna()
    
    def calculate_portfolio_returns(self, daily_returns):
        """
        Calculate portfolio returns from daily returns.
        
        Args:
        - daily_returns (pd.Series or pd.DataFrame): Daily returns.
        
        Returns:
        - pd.Series: Portfolio returns.
        """
        if len(self.assets) > 1:
            weights = np.array([asset['weight'] for asset in self.assets])
            return (daily_returns * weights).sum(axis=1)
        return daily_returns 
        
    def close_price_to_usd(self, close_prices):
        """
        Convert close prices to USD using exchange rates.
        
        Args:
        - close_prices (pd.Series or pd.DataFrame): Close prices.
        
        Returns:
        - pd.Series or pd.DataFrame: Close prices in USD.
        """
        currencies = [asset['currency'] for asset in self.assets]
        exchange_rates = fetch_exchange_rates(currencies)
        
        if len(self.assets) > 1:
            for asset in self.assets:
                exchange_rate = exchange_rates.get(asset['currency'], 1)  # Default to 1 if no rate found
                close_prices[asset['symbol']] *= (1 / exchange_rate)
        else:
            if currencies[0] != 'USD':
                exchange_rate = exchange_rates.get(currencies[0], 1)  # Default to 1 if no rate found
                close_prices *= (1 / exchange_rate)
        return close_prices

    def mean_variance_optimization(self, start_date, target_return=None):
        """
        Perform mean-variance optimization using historical returns.
        
        Args:
        - start_date (str): Start date for historical data.
        - target_return (float, optional): Target return for the portfolio.
        
        Raises:
        - ValueError: If optimization fails.
        """
        end_date = datetime.now().strftime('%Y-%m-%d')
        tickers = [asset['symbol'] for asset in self.assets]
        weights = np.array([asset['weight'] for asset in self.assets])

        historical_data = fetch_historical_data(tickers, start_date, end_date)
        close_prices = self.isolate_close_prices(historical_data)
        daily_returns = self.calculate_daily_returns(close_prices)

        def objective(weights):
            portfolio_return = np.sum(daily_returns.mean() * weights) * 252
            portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(daily_returns.cov() * 252, weights)))
            if target_return is None:
                return -portfolio_return / portfolio_volatility  # Maximize Sharpe Ratio
            else:
                return (portfolio_return - target_return) ** 2  # Minimize deviation from target return

        constraints = {'type': 'eq', 'fun': lambda weights: np.sum(weights) - 1}
        bounds = [(0, 1) for _ in tickers]
        initial_guess = weights if np.sum(weights) == 1 else np.array([1/len(tickers) for _ in tickers])

        result = minimize(objective, initial_guess, method='SLSQP', bounds=bounds, constraints=constraints)

        if result.success:
            for asset, weight in zip(self.assets, result.x):
                asset['weight'] = weight
            logging.info("Portfolio weights updated with optimized values.")
        else:
            raise ValueError(f"Optimization failed: {result.message}")

    def calculate_statistics(self):
        """
        Calculate and return portfolio statistics.
        
        Returns:
        - dict: Portfolio statistics.
        """
        if not self.assets:
            return {}

        tickers = [asset['symbol'] for asset in self.assets]
        weights = np.array([asset['weight'] for asset in self.assets])

        start_date = (datetime.now() - timedelta(days=365 * 3)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        historical_data = fetch_historical_data(tickers, start_date, end_date)
        close_prices = self.isolate_close_prices(historical_data)
        usd_close_prices = self.close_price_to_usd(close_prices)
        logging.info(usd_close_prices)

        daily_returns = self.calculate_daily_returns(close_prices)
        portfolio_returns = self.calculate_portfolio_returns(daily_returns)

        total_portfolio_values = usd_close_prices.to_numpy().dot(weights) if len(self.assets) > 1 else usd_close_prices.to_numpy()
        logging.info(total_portfolio_values)
        initial_value = total_portfolio_values[0]
        final_value = total_portfolio_values[-1]
        CAGR = ((final_value / initial_value) ** (1 / 3) - 1) * 100

        total_return = ((portfolio_returns + 1).prod() - 1) * 100
        volatility = np.sqrt(portfolio_returns.var() * 252)
        mean_return = portfolio_returns.mean() * 252
        sharpe_ratio = mean_return / volatility  # Assuming 0% risk-free rate

        statistics = {
            'Total Value': final_value,
            'Total Return': total_return,
            'Annual Volatility': volatility,
            'Sharpe Ratio': sharpe_ratio,
            'CAGR': CAGR
        }
        logging.info(f"Calculated portfolio statistics: {statistics}")

        return statistics
    
    def monte_carlo_simulation(self, n_simulations=1000, n_days=252):
        """
        Perform a Monte Carlo simulation of the portfolio's performance.
        
        Args:
        - n_simulations (int): Number of simulations to run.
        - n_days (int): Number of days to simulate.
        
        Returns:
        - list: Simulation results.
        """
        if not self.assets:
            return []

        tickers = [asset['symbol'] for asset in self.assets]
        weights = np.array([asset['weight'] for asset in self.assets])

        start_date = (datetime.now() - timedelta(days=365 * 3)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        historical_data = fetch_historical_data(tickers, start_date, end_date)
        close_prices = self.isolate_close_prices(historical_data)

        daily_returns = self.calculate_daily_returns(close_prices)
        mean_returns = daily_returns.mean()
        
        # Handle the case for a single asset
        if len(self.assets) == 1:
            std_dev = daily_returns.std()
            usd_close_prices = self.close_price_to_usd(close_prices)

            simulation_results = np.zeros((n_days, n_simulations))

            for sim in range(n_simulations):
                simulated_prices = usd_close_prices.iloc[-1]
                for day in range(n_days):
                    simulated_return = np.random.normal(mean_returns, std_dev)
                    simulated_prices = simulated_prices * (1 + simulated_return)
                    simulation_results[day, sim] = simulated_prices * weights[0]
                    
        # Handle the case for multiple assets
        else:
            cov_matrix = daily_returns.cov()
            usd_close_prices = self.close_price_to_usd(close_prices)

            simulation_results = np.zeros((n_days, n_simulations))

            for sim in range(n_simulations):
                simulated_prices = usd_close_prices.iloc[-1].values
                for day in range(n_days):
                    simulated_returns = np.random.multivariate_normal(mean_returns, cov_matrix)
                    simulated_prices = simulated_prices * (1 + simulated_returns)
                    simulation_results[day, sim] = np.dot(simulated_prices, weights)

        logging.info(f"Monte Carlo simulation completed with {n_simulations} simulations.")
        return simulation_results.tolist()
