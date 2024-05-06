import yfinance as yf
import pandas as pd

def fetch_historical_data(tickers, start_date, end_date):
    """
    Fetch historical stock prices for given tickers and date range.
    
    Args:
        tickers (list of str): List of stock tickers (e.g., ["AAPL", "MSFT"]).
        start_date (str): Start date in the format "YYYY-MM-DD".
        end_date (str): End date in the format "YYYY-MM-DD".
    
    Returns:
        data: A pandas DataFrame containing the historical stock prices.
    """
    try:
        data = yf.download(tickers, start=start_date, end=end_date)
        if not data.empty:
            data.dropna(inplace=True)
            return data
        else:
            raise ValueError("No data found for the given tickers and date range.")
    except Exception as e:
        print(f"An error occurred while fetching historical data: {e}")
        return pd.DataFrame()
