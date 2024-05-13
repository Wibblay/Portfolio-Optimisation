# backend/src/portfolio.py
import numpy as np
from datetime import datetime, timedelta
import yfinance as yf
from scipy.optimize import minimize
from src.data_fetcher import fetch_historical_data
from src.fetch_exchange_rates import fetch_exchange_rates

class Portfolio:
    def __init__(self, assets=None):
        """
        Initialize a portfolio with given assets and weights.
        
        Args:
        - tickers (list, optional): List of stock tickers (e.g., ["AAPL", "MSFT"]).
        - start_date (str, optional): Start date in the format "YYYY-MM-DD" (default: 1 year prior to current date).
        - end_date (str, optional): End date in the format "YYYY-MM-DD" (default: current date).
        - initial_weights (dict, optional): Initial weights for each asset (default: None).
        """
        if assets is None:
            self.assets = []
        else:
            self.assets = assets

    def add_asset(self, asset):
        """
        Add an asset to the portfolio.
        Args:
        - asset (dict): Asset to add (e.g., {"symbol": "GOOGL", "name": "Alphabet Inc."}).
        """
        if not any(a['symbol'] == asset['symbol'] for a in self.assets):
            assetTickerObject = yf.Ticker(asset['symbol'])
            asset['sector'] = assetTickerObject.info['sector']
            asset['industry'] = assetTickerObject.info['industry']
            asset['currency'] = assetTickerObject.info['currency']
            self.assets.append(asset)
            self.recalculate_weights()
        else:
            print("Asset already in portfolio.")

    def remove_asset(self, symbol):
        original_count = len(self.assets)
        self.assets = [asset for asset in self.assets if asset['symbol'] != symbol]
        self.recalculate_weights()
        return len(self.assets) < original_count
    
    def recalculate_weights(self):
        if self.assets:
            equal_weight = 1 / len(self.assets)
            for asset in self.assets:
                asset['weight'] = equal_weight

    def update_weights(self, updated_assets):
        try:
            for update in updated_assets:
                # Find the asset and update its weight
                for asset in self.assets:
                    if asset['symbol'] == update['symbol']:
                        asset['weight'] = update['weight']
                        break
            return True
        except Exception as e:
            print("Failed to update asset weights: %s", str(e))
            return False

    def mean_variance_optimization(self, start_date, target_return=None):
        """ Perform mean-variance optimization using historical returns. """
        end_date = datetime.now().strftime('%Y-%m-%d')  # Current date as end date
        tickers = [asset['symbol'] for asset in self.assets]
        weights = np.array([asset['weight'] for asset in self.assets])

        # Fetch historical data
        historical_data = fetch_historical_data(tickers, start_date, end_date)
        if historical_data.empty:
            raise ValueError("No historical data available for optimization.")
        
        try:
            close_prices = historical_data['Close']
        except KeyError:
            raise ValueError("Close prices not available in the historical data.")

        # Calculate daily returns
        daily_returns = close_prices.pct_change().dropna()

        # Define objective function
        def objective(weights):
            portfolio_return = np.sum(daily_returns.mean() * weights) * 252
            portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(daily_returns.cov() * 252, weights)))
            if target_return is None:
                return -portfolio_return / portfolio_volatility  # Maximize Sharpe Ratio
            else:
                return (portfolio_return - target_return) ** 2  # Minimize deviation from target return

        # Constraints to ensure all weights sum to 1
        constraints = ({'type': 'eq', 'fun': lambda weights: np.sum(weights) - 1})
        
        # Bounds to ensure weights are between 0 and 1
        bounds = [(0, 1) for _ in tickers]
        
        # Initial guess
        initial_guess = weights if np.sum(weights) == 1 else np.array([1/len(tickers) for _ in tickers])

        # Perform optimization
        result = minimize(objective, initial_guess, method='SLSQP', bounds=bounds, constraints=constraints)

        if result.success:
            # Update portfolio's assets with optimized weights
            for asset, weight in zip(self.assets, result.x):
                asset['weight'] = weight
            print("Portfolio weights updated with optimized values.")
        else:
            raise ValueError("Optimization failed: " + result.message)

    def calculate_statistics(self):
        if not self.assets:
            return {}

        tickers = [asset['symbol'] for asset in self.assets]
        weights = np.array([asset['weight'] for asset in self.assets])
        currencies = [asset['currency'] for asset in self.assets]

        # Assuming you have a function to fetch historical prices
        start_date = (datetime.now() - timedelta(days=365 * 3)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        historical_data = fetch_historical_data(tickers, start_date, end_date)

        if historical_data.empty:
            raise ValueError("No historical data available for calculations.")
        
        # Fetch exchange rates
        exchange_rates = fetch_exchange_rates(currencies)
        print(historical_data)

        try:
            close_prices = historical_data['Close']
        except KeyError:
            raise ValueError("Close prices not available in the historical data.")
        print(close_prices)
        
        # Normalize historical data to USD
        if len(self.assets) > 1:
            for asset in self.assets:
                exchange_rate = exchange_rates.get(asset['currency'], 1)  # Default to 1 if no rate found
                print("Exchange rate:, %s", exchange_rate)
                close_prices[asset['symbol']] *= (1 / exchange_rate)
        else:
            if currencies[0] != 'USD':
                exchange_rate = exchange_rates.get(currencies[0], 1)  # Default to 1 if no rate found
                print("Exchange rate:, %s", exchange_rate)
                close_prices *= (1 / exchange_rate)

        # Calculate daily returns
        daily_returns = close_prices.pct_change().dropna()
        if len(tickers) > 1:
            portfolio_returns = (daily_returns * weights).sum(axis=1)
        else:
            portfolio_returns = daily_returns

        if len(self.assets) > 1:
            total_portfolio_values = close_prices.to_numpy().dot(weights)
        else:
            total_portfolio_values = close_prices.to_numpy()
        print(total_portfolio_values)
        initial_value = total_portfolio_values[0]
        final_value = total_portfolio_values[-1]
        print(final_value)
        CAGR = ((final_value / initial_value) ** (1 / 3) - 1) * 100

        total_return = ((portfolio_returns + 1).prod() - 1) * 100
        volatility = np.sqrt((portfolio_returns.var() * 252))
        mean_return = portfolio_returns.mean() * 252
        sharpe_ratio = mean_return / volatility  # Assuming 0% risk-free rate

        statistics = {
            'Total Value': final_value,
            'Total Return': total_return,
            'Annual Volatility': volatility,
            'Sharpe Ratio': sharpe_ratio,
            'CAGR': CAGR
        }
        print(statistics)

        return statistics