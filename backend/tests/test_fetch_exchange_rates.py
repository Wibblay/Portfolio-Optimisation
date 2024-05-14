import unittest
from unittest.mock import patch, mock_open
import requests
from ..src.fetch_exchange_rates import fetch_exchange_rates 

class TestFetchExchangeRates(unittest.TestCase):

    @patch.dict('os.environ', {'OPEN_RATES_API_KEY': 'test_api_key'})
    @patch('requests.get')
    def test_fetch_exchange_rates_success(self, mock_get):
        # Mocking the response from Open Exchange Rates API
        mock_response = {
            'rates': {
                'USD': 1.0,
                'EUR': 0.84,
                'GBP': 0.75
            }
        }
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response

        currencies = ['USD', 'EUR', 'GBP']
        result = fetch_exchange_rates(currencies)

        expected_result = {
            'USD': 1.0,
            'EUR': 0.84,
            'GBP': 0.75
        }
        self.assertEqual(result, expected_result)
        mock_get.assert_called_once_with("https://openexchangerates.org/api/latest.json?app_id=test_api_key")

    @patch.dict('os.environ', {}, clear=True)
    def test_fetch_exchange_rates_missing_api_key(self):
        currencies = ['USD', 'EUR', 'GBP']
        result = fetch_exchange_rates(currencies)

        self.assertEqual(result, {})
        self.assertLogs(level='ERROR')

    @patch.dict('os.environ', {'OPEN_RATES_API_KEY': 'test_api_key'})
    @patch('requests.get')
    def test_fetch_exchange_rates_network_error(self, mock_get):
        # Simulate a network error
        mock_get.side_effect = requests.RequestException("Network error")

        currencies = ['USD', 'EUR', 'GBP']
        result = fetch_exchange_rates(currencies)

        self.assertEqual(result, {})
        mock_get.assert_called_once_with("https://openexchangerates.org/api/latest.json?app_id=test_api_key")
        self.assertLogs(level='ERROR')

    @patch.dict('os.environ', {'OPEN_RATES_API_KEY': 'test_api_key'})
    @patch('requests.get')
    def test_fetch_exchange_rates_missing_rates(self, mock_get):
        # Mocking the response from Open Exchange Rates API with missing rates
        mock_response = {
            'rates': {
                'USD': 1.0,
                'EUR': 0.84
            }
        }
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_response

        currencies = ['USD', 'EUR', 'GBP']
        result = fetch_exchange_rates(currencies)

        expected_result = {
            'USD': 1.0,
            'EUR': 0.84,
            'GBP': None
        }
        self.assertEqual(result, expected_result)
        self.assertLogs(level='WARNING')

if __name__ == '__main__':
    unittest.main()
