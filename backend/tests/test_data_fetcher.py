import unittest
import pandas as pd
from unittest.mock import patch
from ..src.data_fetcher import fetch_historical_data  # Adjust the import based on your module structure

class TestFetchHistoricalData(unittest.TestCase):

    @patch('yfinance.download')
    def test_fetch_historical_data_valid_tickers(self, mock_download):
        # Mocking yfinance download return value for valid tickers
        mock_data = pd.DataFrame({
            'Date': pd.date_range(start='2022-01-01', end='2022-01-10'),
            'Close': [150, 152, 154, 156, 158, 160, 162, 164, 166, 168]
        })
        mock_download.return_value = mock_data.set_index('Date')

        tickers = ['AAPL']
        start_date = '2022-01-01'
        end_date = '2022-01-10'
        result = fetch_historical_data(tickers, start_date, end_date)

        self.assertFalse(result.empty)
        self.assertEqual(len(result), 10)
        self.assertIn('Close', result.columns)
        mock_download.assert_called_once_with(tickers, start=start_date, end=end_date)

    @patch('yfinance.download')
    def test_fetch_historical_data_invalid_ticker(self, mock_download):
        # Mocking yfinance download return value for an invalid ticker
        mock_download.return_value = pd.DataFrame()

        tickers = ['INVALID_TICKER']
        start_date = '2022-01-01'
        end_date = '2022-01-10'
        result = fetch_historical_data(tickers, start_date, end_date)

        self.assertTrue(result.empty)
        mock_download.assert_called_once_with(tickers, start=start_date, end=end_date)

    @patch('yfinance.download')
    def test_fetch_historical_data_empty_tickers(self, mock_download):
        # Mocking yfinance download return value for empty tickers list
        mock_download.return_value = pd.DataFrame()

        tickers = []
        start_date = '2022-01-01'
        end_date = '2022-01-10'
        result = fetch_historical_data(tickers, start_date, end_date)

        self.assertTrue(result.empty)
        mock_download.assert_not_called()

    @patch('yfinance.download')
    def test_fetch_historical_data_invalid_dates(self, mock_download):
        # Mocking yfinance download to raise an exception for invalid dates
        mock_download.side_effect = Exception("Invalid date format")

        tickers = ['AAPL']
        start_date = 'invalid-date'
        end_date = 'invalid-date'
        result = fetch_historical_data(tickers, start_date, end_date)

        self.assertTrue(result.empty)
        mock_download.assert_called_once_with(tickers, start=start_date, end=end_date)

    @patch('yfinance.download')
    def test_fetch_historical_data_no_data_found(self, mock_download):
        # Mocking yfinance download return value for no data found
        mock_download.return_value = pd.DataFrame()

        tickers = ['AAPL']
        start_date = '1800-01-01'
        end_date = '1800-01-10'
        result = fetch_historical_data(tickers, start_date, end_date)

        self.assertTrue(result.empty)
        mock_download.assert_called_once_with(tickers, start=start_date, end=end_date)

if __name__ == '__main__':
    unittest.main()
