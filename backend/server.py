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
#http://127.0.0.1:5000/

# Setup logging
logging.basicConfig(level=logging.DEBUG)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

app = Flask(__name__)
CORS(app, supports_credentials=True)

new_portfolio = Portfolio()

##INIT ROUTES##
@app.route('/')
def index():
    logging.debug("Request received for index route")
    return send_from_directory(os.path.join('..', 'frontend', 'build'), 'index.html')

@app.route('/static/js/<path:filename>')
def static_files_js(filename):
    logging.debug("Request received for js static files route:", filename) 
    return send_from_directory(os.path.join('..', 'frontend', 'build', 'static', 'js'), filename)

@app.route('/static/css/<path:filename>')
def static_files_css(filename):
    logging.debug("Request received for css static files route:", filename) 
    return send_from_directory(os.path.join('..', 'frontend', 'build', 'static', 'css'), filename)

@app.route('/<path:filename>')
def other_files(filename):
    logging.debug("Request received for other files route:", filename) 
    return send_from_directory(os.path.join('..', 'frontend', 'build'), filename)

##API ROUTES##
@app.route('/symbol-search')
def symbol_search():
    logging.debug("Request received for Finnhub API")
    query = request.args.get('query')

    # Finnhub API endpoint and API key
    endpoint = 'https://finnhub.io/api/v1/search'
    api_key = os.environ.get('FINNHUB_API_KEY')

    try:
        response = requests.get(endpoint, params={'q': query, 'token': api_key})
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch data from Finnhub API'}), 500
    except requests.exceptions.RequestException as e:
        logging.error("Request failed:", e)
        return jsonify({'error': 'Network error'}), 503

##PORTFOLIO ROUTES##   
@app.route('/api/portfolio-tickers', methods=['GET'])
def get_portfolio_tickers():
    logging.debug("Portfolio ticker request received")
    assets = [{'symbol': asset['symbol'], 'name': asset['name']} for asset in new_portfolio.assets]
    return jsonify({'assets': assets})

@app.route('/api/add-tickers', methods=['POST'])
def add_tickers():
    asset = request.json
    logging.debug("Ticker to add:", asset['symbol'])
    new_portfolio.add_asset(asset)
    return jsonify({'message': 'Asset added successfully'}), 200

@app.route('/api/remove-ticker/<symbol>', methods=['DELETE'])
def remove_ticker(symbol):
    logging.debug("Request to remove ticker: %s", symbol)
    try:
        if new_portfolio.remove_asset(symbol):
            logging.info("Asset removed successfully:", symbol)
            return jsonify({'message': 'Asset removed successfully'}), 200
        else:
            logging.warning("Attempt to remove non-existing asset: %s", symbol)
            return jsonify({'error': 'Asset not found'}), 404
    except Exception as e:
        logging.error("Error removing asset %s %s", symbol, str(e))
        return jsonify({'error': 'Internal Server Error'}), 500
    
@app.route('/api/historical-data/<ticker>')
def historical_data(ticker):
    logging.debug("Request for historical data: %s", ticker)
    # Fetch start and end dates from query parameters or set defaults
    today = datetime.datetime.now()
    one_month_ago = today - datetime.timedelta(days=30)
    
    # Format dates as YYYY-MM-DD
    default_start_date = one_month_ago.strftime('%Y-%m-%d')
    default_end_date = today.strftime('%Y-%m-%d')
    
    start_date = request.args.get('start', default_start_date)
    end_date = request.args.get('end', default_end_date)
    
    # Fetch historical data using the provided or default dates
    data = fetch_historical_data([ticker], start_date, end_date)
    if isinstance(data.index, pd.DatetimeIndex):
        data.index = data.index.strftime('%Y-%m-%d')
    
    # Convert data to a dictionary and return JSON
    return jsonify(data.reset_index().to_dict(orient='records'))


if __name__ == '__main__':
    app.run(debug=True)
