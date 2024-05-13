import requests
import os
from dotenv import load_dotenv


def fetch_exchange_rates(currencies):
    """
    Fetches exchange rates for a list of currencies with USD as the base.

    Args:
        currencies (list of str): List of 3-letter currency codes.

    Returns:
        dict: Dictionary with currency codes as keys and exchange rates as values.
    """

    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(dotenv_path=dotenv_path)
    api_key = os.environ.get('OPEN_RATES_API_KEY')
    # URL for the API endpoint, this example uses Open Exchange Rates
    # Replace 'YOUR_APP_ID' with your actual API key
    url = "https://openexchangerates.org/api/latest.json?app_id=" + api_key
    
    try:
        # Make the API request
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses

        # Parse the JSON response
        data = response.json()
        rates = data['rates']

        # Filter and return the rates for the requested currencies
        exchange_rates = {}
        for currency in currencies:
            if currency == 'USD':
                exchange_rates[currency] = 1.0  # Set exchange rate to 1 for USD
            else:
                exchange_rates[currency] = rates.get(currency, None)

        return exchange_rates
    
    except requests.RequestException as e:
        print(f"An error occurred while fetching exchange rates: {e}")
        return {}
