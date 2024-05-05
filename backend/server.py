from flask import Flask, send_from_directory, jsonify, request
import requests
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

from src.portfolio import Portfolio
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
        logging.debug(api_key)
        response = requests.get(endpoint, params={'q': query, 'token': api_key})
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch data from Finnhub API'}), 500
    except requests.exceptions.RequestException as e:
        logging.error(f"Request failed: {e}")
        return jsonify({'error': 'Network error'}), 503

##PORTFOLIO ROUTES##   
@app.route('/portfolio-tickers')
def get_portfolio_tickers():
    print("Portfolio ticker request received")
    tickers = new_portfolio.tickers
    return jsonify({'tickers': tickers})

@app.route('/add-tickers', methods=['POST'])
def add_tickers():
    # Extract ticker data from the request
    ticker_data = request.json
    print("Ticker to add:", ticker_data['tickers'][0])
    
    # Add the tickers to the portfolio
    new_portfolio.add_tickers(ticker_data['tickers'])
    
    # Return a response (optional)
    return jsonify({'message': 'Tickers added successfully'}), 200


if __name__ == '__main__':
    app.run(debug=True)
