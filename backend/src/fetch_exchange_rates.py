import requests
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

def fetch_exchange_rates(currencies):
    """
    Fetches exchange rates for a list of currencies with USD as the base.

    Args:
        currencies (list of str): List of 3-letter currency codes.

    Returns:
        dict: Dictionary with currency codes as keys and exchange rates as values.
    """
    # Load environment variables
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(dotenv_path=dotenv_path)
    api_key = os.environ.get('OPEN_RATES_API_KEY')

    if not api_key:
        logging.error("API key for Open Exchange Rates is not set.")
        return {}

    url = f"https://openexchangerates.org/api/latest.json?app_id={api_key}"
    
    try:
        logging.info(f"Fetching exchange rates for currencies: {currencies}")
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses

        data = response.json()
        rates = data.get('rates', {})

        # Filter and return the rates for the requested currencies
        exchange_rates = {currency: rates.get(currency, None) if currency != 'USD' else 1.0 for currency in currencies}

        # Check for any missing rates and log a warning
        missing_rates = [currency for currency, rate in exchange_rates.items() if rate is None]
        if missing_rates:
            logging.warning(f"Exchange rates not found for currencies: {missing_rates}")

        logging.info("Exchange rates fetched successfully.")
        return exchange_rates
    
    except requests.RequestException as e:
        logging.error(f"An error occurred while fetching exchange rates: {e}")
        return {}
