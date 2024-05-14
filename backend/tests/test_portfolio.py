import unittest
from unittest.mock import patch, MagicMock
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from ..src.portfolio import Portfolio  

class TestPortfolio(unittest.TestCase):

    def setUp(self):
        self.portfolio = Portfolio()

    @patch('yfinance.Ticker')
    def test_add_asset(self, mock_yfinance):
        # Mocking yfinance Ticker info
        mock_yfinance.return_value.info = {
            'sector': 'Technology',
            'industry': 'Consumer Electronics',
            'currency': 'USD'
        }
        asset = {'symbol': 'AAPL', 'name': 'Apple Inc.'}
        self.portfolio.add_asset(asset)

        self.assertEqual(len(self.portfolio.assets), 1)
        self.assertEqual(self.portfolio.assets[0]['symbol'], 'AAPL')
        self.assertEqual(self.portfolio.assets[0]['sector'], 'Technology')
        self.assertEqual(self.portfolio.assets[0]['industry'], 'Consumer Electronics')
        self.assertEqual(self.portfolio.assets[0]['currency'], 'USD')

    def test_remove_asset(self):
        self.portfolio.assets = [{'symbol': 'AAPL', 'name': 'Apple Inc.'}]
        self.portfolio.remove_asset('AAPL')
        self.assertEqual(len(self.portfolio.assets), 0)

    def test_recalculate_weights(self):
        self.portfolio.assets = [{'symbol': 'AAPL', 'name': 'Apple Inc.'}, {'symbol': 'GOOGL', 'name': 'Alphabet Inc.'}]
        self.portfolio.recalculate_weights()
        self.assertEqual(self.portfolio.assets[0]['weight'], 0.5)
        self.assertEqual(self.portfolio.assets[1]['weight'], 0.5)

    def test_update_weights(self):
        self.portfolio.assets = [{'symbol': 'AAPL', 'name': 'Apple Inc.', 'weight': 0.5}, {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'weight': 0.5}]
        updated_assets = [{'symbol': 'AAPL', 'weight': 0.6}, {'symbol': 'GOOGL', 'weight': 0.4}]
        self.portfolio.update_weights(updated_assets)
        self.assertEqual(self.portfolio.assets[0]['weight'], 0.6)
        self.assertEqual(self.portfolio.assets[1]['weight'], 0.4)

    def test_isolate_close_prices(self):
        historical_data = pd.DataFrame({
            'Close': [150, 152, 154],
            'Open': [148, 150, 153]
        })
        close_prices = self.portfolio.isolate_close_prices(historical_data)
        pd.testing.assert_series_equal(close_prices, historical_data['Close'])

    def test_calculate_daily_returns(self):
        close_prices = pd.Series([100, 102, 101])
        daily_returns = self.portfolio.calculate_daily_returns(close_prices)
        expected_returns = pd.Series([0.02, -0.009804], index=[1, 2])
        pd.testing.assert_series_equal(daily_returns, expected_returns)

    @patch('portfolio.fetch_exchange_rates')
    def test_close_price_to_usd(self, mock_fetch_exchange_rates):
        mock_fetch_exchange_rates.return_value = {'USD': 1.0, 'EUR': 1.2}
        self.portfolio.assets = [{'symbol': 'AAPL', 'currency': 'USD'}, {'symbol': 'SAP', 'currency': 'EUR'}]
        close_prices = pd.DataFrame({
            'AAPL': [100, 102, 101],
            'SAP': [90, 91, 92]
        })
        usd_close_prices = self.portfolio.close_price_to_usd(close_prices)
        expected_prices = pd.DataFrame({
            'AAPL': [100, 102, 101],
            'SAP': [75, 75.833333, 76.666667]
        })
        pd.testing.assert_frame_equal(usd_close_prices, expected_prices)

    @patch('portfolio.fetch_historical_data')
    def test_mean_variance_optimization(self, mock_fetch_historical_data):
        self.portfolio.assets = [{'symbol': 'AAPL', 'weight': 0.5}, {'symbol': 'GOOGL', 'weight': 0.5}]
        mock_fetch_historical_data.return_value = pd.DataFrame({
            'Close': {
                'AAPL': [100, 102, 101],
                'GOOGL': [150, 152, 151]
            }
        })
        self.portfolio.mean_variance_optimization(start_date='2020-01-01')

        # Assert that weights have been optimized and sum to 1
        self.assertAlmostEqual(sum(asset['weight'] for asset in self.portfolio.assets), 1, places=5)

    @patch('portfolio.fetch_historical_data')
    @patch('portfolio.fetch_exchange_rates')
    def test_calculate_statistics(self, mock_fetch_exchange_rates, mock_fetch_historical_data):
        self.portfolio.assets = [{'symbol': 'AAPL', 'weight': 0.6}, {'symbol': 'GOOGL', 'weight': 0.4}]
        mock_fetch_historical_data.return_value = pd.DataFrame({
            'Close': {
                'AAPL': [100, 102, 101],
                'GOOGL': [150, 152, 151]
            }
        })
        mock_fetch_exchange_rates.return_value = {'USD': 1.0}

        stats = self.portfolio.calculate_statistics()
        self.assertIn('Total Value', stats)
        self.assertIn('Total Return', stats)
        self.assertIn('Annual Volatility', stats)
        self.assertIn('Sharpe Ratio', stats)
        self.assertIn('CAGR', stats)

    @patch('portfolio.fetch_historical_data')
    def test_monte_carlo_simulation(self, mock_fetch_historical_data):
        self.portfolio.assets = [{'symbol': 'AAPL', 'weight': 1.0}]
        mock_fetch_historical_data.return_value = pd.DataFrame({
            'Close': {
                'AAPL': [100, 102, 101]
            }
        })
        simulation_results = self.portfolio.monte_carlo_simulation(n_simulations=10, n_days=10)
        self.assertEqual(len(simulation_results), 10)  # 10 days of simulation
        self.assertEqual(len(simulation_results[0]), 10)  # 10 simulations

if __name__ == '__main__':
    unittest.main()
