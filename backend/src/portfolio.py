# backend/src/portfolio.py
from datetime import datetime, timedelta
from scipy.optimize import minimize

class Portfolio:
    def __init__(self, assets=None, start_date=None, end_date=None, initial_weights=None):
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
        
        if start_date is None:
            self.start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
        else:
            self.start_date = start_date
        
        if end_date is None:
            self.end_date = datetime.now().strftime('%Y-%m-%d')
        else:
            self.end_date = end_date
        
        if initial_weights is None:
            self.weights = {}
        else:
            self.weights = initial_weights
        
        # Initialize other attributes to None
        self.historical_data = None
        self.daily_returns = None
        self.portfolio_value = None
        self.statistics = None

    def add_asset(self, asset):
        """
        Add an asset to the portfolio.
        Args:
        - asset (dict): Asset to add (e.g., {"symbol": "GOOGL", "name": "Alphabet Inc."}).
        """
        if not any(a['symbol'] == asset['symbol'] for a in self.assets):
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
    
    def _retrieve_historical_data(self):
        """Retrieve historical stock prices for the portfolio assets."""
        tickers = [asset['symbol'] for asset in self.assets]
        data = yf.download(tickers, start=self.start_date, end=self.end_date)
        data.dropna(inplace=True)
        return data
    
    def _calculate_daily_returns(self):
        """Calculate daily returns for each asset."""
        # Calculate daily percentage change in prices
        daily_returns = self.historical_data['Adj Close'].pct_change()

        # Drop any NaN values
        self.historical_data.dropna(inplace=True)
        
        return daily_returns
    
    def _calculate_portfolio_value(self):
        """Calculate the portfolio value over time based on historical data and weights."""
        # Calculate daily portfolio values
        daily_portfolio_values = (self.historical_data['Adj Close'] * pd.Series(self.weights)).sum(axis=1)
        
        return daily_portfolio_values
    
    def _calculate_statistics(self):
        """Calculate portfolio statistics such as total return, volatility, and Sharpe ratio."""
        # Calculate total return
        total_return = (self.portfolio_value.iloc[-1] / self.portfolio_value.iloc[0]) - 1
        
        # Calculate annualized volatility (standard deviation of daily returns)
        annualized_volatility = self.daily_returns.std() * np.sqrt(252)
        
        # Calculate annualized Sharpe ratio
        risk_free_rate = 0.02  # Example risk-free rate
        excess_returns = self.daily_returns - risk_free_rate / 252
        annualized_sharpe_ratio = excess_returns.mean() / excess_returns.std() * np.sqrt(252)
        
        statistics = {
            "Total Return": total_return,
            "Annualized Volatility": annualized_volatility,
            "Annualized Sharpe Ratio": annualized_sharpe_ratio
        }
        
        return statistics

    def mean_variance_optimization(self, target_return=None):
        """Perform mean-variance optimization to find optimal portfolio weights."""
        # Define objective function
        def objective(weights):
            portfolio_return = (self.daily_returns * weights).sum(axis=1).mean() * 252
            portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(self.daily_returns.cov() * 252, weights)))
            if target_return is None:
                return -portfolio_return / portfolio_volatility  # Minimize negative Sharpe ratio
            else:
                return (portfolio_return - target_return) ** 2  # Minimize deviation from target return
        
        # Define constraints
        constraints = ({'type': 'eq', 'fun': lambda weights: np.sum(weights) - 1})
        
        # Define bounds (optional)
        bounds = [(0, 1) for _ in range(len(self.tickers))]  # Bounds for weights between 0 and 1
        
        # Initial guess (optional)
        if self.weights is not None:
            initial_guess = list(self.weights.values())
        else:
            initial_guess = [1/len(self.tickers) for _ in range(len(self.tickers))]
        
        # Perform optimization
        result = minimize(objective, initial_guess, method='SLSQP', constraints=constraints, bounds=bounds)
        
        if result.success:
            optimal_weights = {ticker: weight for ticker, weight in zip(self.tickers, result.x)}
            return optimal_weights
        else:
            raise ValueError("Optimization failed.")
