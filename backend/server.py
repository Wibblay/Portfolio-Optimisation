#server.py
from flask import Flask, send_from_directory, jsonify, request
import requests
import json
from flask_cors import CORS
from dotenv import load_dotenv
import datetime
import pandas as pd
import os
import logging

from src.portfolio import Portfolio
from src.data_fetcher import fetch_historical_data

# Setup logging
logging.basicConfig(level=logging.DEBUG)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Initialize a new portfolio instance
new_portfolio = Portfolio()

# INIT ROUTES
@app.route('/')
def index():
    """Serve the main HTML file for the application."""
    return send_from_directory(os.path.join('..', 'frontend', 'build'), 'index.html')

@app.route('/static/js/<path:filename>')
def static_files_js(filename):
    """Serve JavaScript files from the static directory."""
    logging.debug("Request received for js static files route")
    return send_from_directory(os.path.join('..', 'frontend', 'build', 'static', 'js'), filename)

@app.route('/static/css/<path:filename>')
def static_files_css(filename):
    """Serve CSS files from the static directory."""
    logging.debug("Request received for css static files route")
    return send_from_directory(os.path.join('..', 'frontend', 'build', 'static', 'css'), filename)

@app.route('/<path:filename>')
def other_files(filename):
    """Serve other files from the static directory."""
    logging.debug("Request received for other files route")
    return send_from_directory(os.path.join('..', 'frontend', 'build'), filename)

# API ROUTES
@app.route('/symbol-search')
def symbol_search():
    """Search for stock symbols using the Finnhub API."""
    logging.debug("Request received for Finnhub API")
    query = request.args.get('query')

    endpoint = 'https://finnhub.io/api/v1/search'
    api_key = os.environ.get('FINNHUB_API_KEY')

    try:
        response = requests.get(endpoint, params={'q': query, 'token': api_key})
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            logging.error("Failed to fetch data from Finnhub API: %s", response.status_code)
            return jsonify({'error': 'Failed to fetch data from Finnhub API'}), 500
    except requests.exceptions.RequestException as e:
        logging.error("Request failed: %s", e)
        return jsonify({'error': 'Network error'}), 503

# PORTFOLIO ROUTES
@app.route('/api/portfolio-tickers', methods=['GET'])
def get_portfolio_tickers():
    """Get the current portfolio tickers."""
    logging.debug("Portfolio ticker request received")
    assets = [{'symbol': asset['symbol'], 'name': asset['name'], 'weight': asset['weight'], 'sector': asset['sector'],
               'industry': asset['industry'], 'currency': asset['currency']} for asset in new_portfolio.assets]
    logging.debug("Current assets: %s", assets)
    return jsonify({'assets': assets})

@app.route('/api/add-tickers', methods=['POST'])
def add_tickers():
    """Add a new ticker to the portfolio."""
    asset = request.json
    logging.debug("Ticker to add: %s", asset['symbol'])
    new_portfolio.add_asset(asset)
    return jsonify({'message': 'Asset added successfully'}), 200

@app.route('/api/remove-ticker/<symbol>', methods=['DELETE'])
def remove_ticker(symbol):
    """Remove a ticker from the portfolio."""
    logging.debug("Request to remove ticker: %s", symbol)
    try:
        if new_portfolio.remove_asset(symbol):
            logging.info("Asset removed successfully: %s", symbol)
            return jsonify({'message': 'Asset removed successfully'}), 200
        else:
            logging.warning("Attempt to remove non-existing asset: %s", symbol)
            return jsonify({'error': 'Asset not found'}), 404
    except Exception as e:
        logging.error("Error removing asset %s: %s", symbol, str(e))
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/api/historical-data/<ticker>')
def historical_data(ticker):
    """Fetch historical data for a specific ticker."""
    logging.debug("Request for historical data: %s", ticker)
    today = datetime.datetime.now()
    one_month_ago = today - datetime.timedelta(days=30)
    
    default_start_date = one_month_ago.strftime('%Y-%m-%d')
    default_end_date = today.strftime('%Y-%m-%d')
    
    start_date = request.args.get('start', default_start_date)
    end_date = request.args.get('end', default_end_date)
    
    data = fetch_historical_data([ticker], start_date, end_date)
    if isinstance(data.index, pd.DatetimeIndex):
        data.index = data.index.strftime('%Y-%m-%d')
    
    return jsonify(data.reset_index().to_dict(orient='records'))

@app.route('/api/update-weights', methods=['POST'])
def update_weights():
    """Update the weights of assets in the portfolio."""
    updated_assets = request.json
    logging.debug("Received weights update request: %s", updated_assets)
    
    try:
        if new_portfolio.update_weights(updated_assets):
            logging.info("Weights updated successfully.")
            return jsonify({'message': 'Weights updated successfully'}), 200
        else:
            logging.warning("Failed to update weights.")
            return jsonify({'error': 'Failed to update weights'}), 400
    except Exception as e:
        logging.error("Error updating weights: %s", str(e))
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/api/optimize-portfolio', methods=['POST'])
def optimize_portfolio():
    """Optimize the portfolio using mean-variance optimization."""
    logging.debug("Request received for portfolio optimization")
    data = request.json
    start_date = data.get('start_date')
    desired_return = data.get('desired_return', None)

    try:
        if desired_return is not None:
            desired_return = float(desired_return)

        new_portfolio.mean_variance_optimization(start_date=start_date, target_return=desired_return)
        return jsonify({'message': 'Portfolio optimization completed successfully'}), 200
    except Exception as e:
        logging.error("Error during optimization: %s", e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/portfolio-statistics', methods=['GET'])
def get_portfolio_statistics():
    """Calculate and return portfolio statistics."""
    try:
        stats = new_portfolio.calculate_statistics()
        logging.debug("Portfolio statistics: %s", stats)
        return jsonify(stats), 200
    except ValueError as e:
        logging.error("ValueError in portfolio statistics: %s", e)
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error("Internal server error in portfolio statistics: %s", e)
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/api/portfolio-returns/<start_date>')
def fetch_portfolio_returns(start_date):
    """Fetch and calculate cumulative portfolio returns from a start date."""
    logging.debug("Start date passed: %s", start_date)
    end_date = datetime.datetime.now().strftime('%Y-%m-%d')
    
    tickers = [asset['symbol'] for asset in new_portfolio.assets]
    logging.debug("Dates used: %s, %s", start_date, end_date)
    data = fetch_historical_data(tickers, start_date, end_date)
    try:
        close_prices = new_portfolio.isolate_close_prices(data)
        daily_returns = new_portfolio.calculate_daily_returns(close_prices)
        portfolio_returns = new_portfolio.calculate_portfolio_returns(daily_returns)
        returns_plus_one = portfolio_returns + 1
        cumulative_product = returns_plus_one.cumprod()
        portfolio_cumulative_returns = cumulative_product - 1
        portfolio_cumulative_returns.index = portfolio_cumulative_returns.index.strftime('%Y-%m-%d')
        if len(tickers) > 1:
            portfolio_cumulative_returns.rename('Close', inplace=True)
    except ValueError as e:
        logging.error("ValueError in portfolio returns: %s", e)
        return jsonify({'error': str(e)}), 400

    return jsonify(portfolio_cumulative_returns.reset_index().to_dict(orient='records'))

@app.route('/api/monte_carlo_simulation', methods=['GET'])
def monte_carlo_simulation():
    """Perform a Monte Carlo simulation on the portfolio."""
    n_simulations = request.args.get('numSimulations', default=1000, type=int)
    logging.debug("Number of Monte Carlo simulations requested: %d", n_simulations)
    
    try:
        simulation_results = new_portfolio.monte_carlo_simulation(n_simulations=n_simulations, n_days=252)
        return jsonify(simulation_results)
    except Exception as e:
        logging.error("Error during Monte Carlo simulation: %s", e)
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
