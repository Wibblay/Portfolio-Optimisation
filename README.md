# Portfolio Optimization Tool

## Overview

The Portfolio Optimization Tool is a web application designed to help users manage and optimize their investment portfolios. The application provides features such as adding/removing assets, adjusting portfolio weights, optimizing the portfolio using mean-variance optimization, predicting performance using Monte Carlo simulations, and viewing detailed portfolio statistics.

## Features

- **Add/Remove Assets**: Search for assets by ticker symbol and add them to your portfolio. You can remove assets as well.
- **Adjust Weights**: Manually adjust the weights of assets in your portfolio using sliders.
- **Optimization**: Automatically optimize your portfolio weights using the Markowitz mean-variance optimization.
- **Performance Prediction**: Run Monte Carlo simulations to predict the performance of your portfolio over a specified period.
- **Detailed Statistics**: View detailed statistics of your portfolio, including total value, total return, annual volatility, Sharpe ratio, and CAGR.

## Technologies Used 

- **Frontend**: React, Autosuggest, CSS (Full package list in /frontend/package.json)
- **Backend**: Flask, yFinance, SciPy, NumPy, pandas (Full list in requirements.txt)
- **APIs**: Finnhub API for asset information, Open Exchange Rates API for currency conversion

## Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/Wibblay/portfolio-optimization-tool.git
   cd portfolio-optimization-tool
   ```

2. **Frontend Setup**:
   - Navigate to the `frontend` directory:
     ```sh
     cd frontend
     ```
   - Install the dependencies:
     ```sh
     npm install
     ```
   - Start the React development server:
     ```sh
     npm start
     ```

3. **Backend Setup**:
   - Navigate to the `backend` directory:
     ```sh
     cd backend
     ```
   - Create a virtual environment and activate it:
     ```sh
     python3 -m venv venv
     source venv/bin/activate
     ```
   - Install the dependencies:
     ```sh
     pip install -r requirements.txt
     ```
   - Set up environment variables:
     - Create a `.env` file in the `backend` directory and add your API keys:
       ```sh
       FINNHUB_API_KEY=your_finnhub_api_key
       OPEN_RATES_API_KEY=your_open_exchange_rates_api_key
       ```
   - Start the Flask server:
     ```sh
     flask run
     ```

## Project Structure

```
portfolio-optimization-tool/
│
├── backend/
│   ├── src/
│   │   ├── portfolio.py
│   │   ├── data_fetcher.py
│   │   ├── fetch_exchange_rates.py
│   ├── tests/
│   │   ├── test_data_fetcher.py
│   │   ├── test_portfolio.py
|   |   ├── test_fetch_exchange_rates.py
│   ├── .env
│   ├── requirements.txt
│   ├── server.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TickerForm.js
│   │   │   ├── PortfolioBuilder.js
│   │   │   ├── Optimizer.js
│   │   │   ├── Predictor.js
│   │   │   ├── Summary.js
│   │   │   ├── PortfolioTable.js
│   │   │   ├── PriceChart.js
│   │   │   ├── WeightPieChart.js
│   │   │   ├── WeightSliders.js
│   │   ├── hooks/
│   │   │   ├── Api.js
│   │   │   ├── PortfolioContext.js
│   │   │   ├── ResizeObserver.js
│   │   ├── styles/
│   │   │   ├── Layout.css
│   │   │   ├── TickerForm.css
│   │   │   ├── AutosuggestTheme.css
│   │   │   ├── PortfolioBuilder.css
│   │   │   ├── PortfolioTable.css
│   │   │   ├── PriceChart.css
│   │   │   ├── WeightPieChart.css
│   │   │   ├── WeightSliders.css
│   │   │   ├── Optimizer.css
│   │   │   ├── Predictor.css
│   │   │   ├── Summary.css
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   ├── package.json
│
├── README.md
```

## Usage

1. **Access the Application**:
   - Open your web browser and navigate to `http://localhost:3000`.

2. **Search and Add Assets**:
   - Use the search bar to find assets by their ticker symbols and add up to 5 assets to your portfolio.

3. **Adjust Weights**:
   - Use the sliders to manually adjust the weights of each asset in your portfolio.

4. **Optimize Portfolio**:
   - Navigate to the "Balance Weights" tab, enter the desired start date and return (optional), and click "Run Optimizer" to automatically optimize your portfolio weights.

5. **Predict Performance**:
   - Navigate to the "Predict Performance" tab, set the number of simulations, and run a Monte Carlo simulation to predict your portfolio's performance over a year.

6. **View Portfolio Summary**:
   - Navigate to the "Portfolio Summary" tab to view detailed statistics and cumulative returns of your portfolio.

## Tests

- The test scripts for backend functionalities are located in the `backend/tests` directory.
- To run the tests, use the following command in the `backend` directory:
  ```sh
  pytest
  ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue to discuss any changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to Finnhub and Open Exchange Rates for providing the APIs used in this project.
- Special thanks to the open-source community for the tools and libraries used in this project.

---
