import React, { useState, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import './TickerForm.css'; 
import './theme.css';

const TickerForm = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [portfolioTickers, setPortfolioTickers] = useState([]);

  useEffect(() => {
    // Fetch the current portfolio tickers when the component mounts
    fetchPortfolioTickers();
  }, []);

  const fetchPortfolioTickers = async () => {
    try {
      const response = await fetch('/portfolio-tickers');
      const data = await response.json();
      setPortfolioTickers(data.tickers);
    } catch (error) {
      console.error('Error fetching portfolio tickers:', error);
    }
  };

  const fetchSuggestions = async (value) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/symbol-search?query=${value}`);
      const data = await response.json();

      if (!data.result) {
        return []; // Return an empty array if no suggestions
      }

      // Filter out suggestions with type other than 'Common Stock'
      const commonStockSuggestions = data.result.filter(item => item.type === 'Common Stock');

      // Transform the response data into the expected format
      const suggestions = commonStockSuggestions.map(item => ({
        symbol: item.symbol,
        name: item.description
      }));

      return suggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await fetchSuggestions(value);
    console.log('Fetched suggestions:', suggestions); // Add this line to check suggestions
    setSuggestions(suggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.symbol;

  const renderSuggestion = (suggestion) => {
    console.log('Rendering suggestion:', suggestion); // Add this line to send a message to the console
    return (
      <div>
        {suggestion.symbol} - {suggestion.name}
      </div>
    );
  };

  const onSuggestionSelected = async (event, { suggestion }) => {
    // Trigger fetch request to add selected ticker to portfolio
    await addTickerToPortfolio(suggestion.symbol);
  };

  const addTickerToPortfolio = async (ticker) => {
    try {
      const response = await fetch('/add-tickers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tickers: [ticker] })
      });

      if (response.ok) {
        console.log('Ticker added to portfolio successfully');
        // Trigger a request to fetch updated portfolio tickers
        fetchPortfolioTickers();
      } else {
        console.error('Failed to add ticker to portfolio:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding ticker to portfolio:', error);
    }
  };

  // Define your theme object using the classes from your theme.css file
  const theme = {
    container: 'container',
    input: 'input',
    suggestionsContainer: 'suggestionsContainer',
    suggestion: 'suggestion',
    suggestionHighlighted: 'suggestionHighlighted'
  };

  return (
    <div className="ticker-form">
      <h2>Current Portfolio:</h2>
      <ul>
        {portfolioTickers.map((ticker, index) => (
          <li key={index}>{ticker}</li>
        ))}
      </ul>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={{ id: 'ticker-input', placeholder: 'Enter a ticker symbol', value, onChange }}
        onSuggestionSelected={onSuggestionSelected}
        theme={theme} 
      />
    </div>
  );
};

export default TickerForm;
