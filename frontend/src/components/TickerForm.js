import React, { useState, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import { debounce } from 'lodash'
import './TickerForm.css'; 
import './theme.css';

const TickerForm = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [portfolioTickers, setPortfolioTickers] = useState([]);
  const [portfolioSize, setPortfolioSize] = useState(0);

  useEffect(() => {
    // Fetch the current portfolio tickers when the component mounts
    console.log('Component mounted, fetching portfolio tickers...');
    fetchPortfolioTickers();
  }, []);

  const fetchPortfolioTickers = async () => {
    try {
      const response = await fetch('/portfolio-tickers');
      const data = await response.json();
      setPortfolioTickers(data.tickers);
      setPortfolioSize(data.tickers.length);  // Update the portfolio size
      console.log('Fetched portfolio tickers:', data.tickers);
      console.log('Updated portfolio size:', data.tickers.length);
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

      const commonStockSuggestions = data.result.filter(item => item.type === 'Common Stock');
      const suggestions = commonStockSuggestions.map(item => ({
        symbol: item.symbol,
        name: item.description
      }));

      console.log('Suggestions fetched:', suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
    console.log('Input value changed:', newValue);
  };

  const debouncedFetchSuggestions = debounce((value) => {
    console.log('Fetching suggestions for value:', value);
    fetchSuggestions(value).then(setSuggestions);
  }, 300);

  const onSuggestionsFetchRequested = ({ value }) => {
    debouncedFetchSuggestions(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
    console.log('Suggestions cleared');
  };

  const getSuggestionValue = (suggestion) => suggestion.symbol;

  const renderSuggestion = (suggestion) => {
    return (
      <div>
        {suggestion.symbol} - {suggestion.name}
      </div>
    );
  };

  const onSuggestionSelected = async (event, { suggestion }) => {
    console.log('Suggestion selected:', suggestion);
    await addTickerToPortfolio(suggestion.symbol);
    setValue(''); // Clear the input after the ticker is added
};

const addTickerToPortfolio = async (ticker) => {
  if (portfolioTickers.some(t => t === ticker)) {
      console.error('Ticker already in portfolio:', ticker);
      alert('Ticker already in portfolio.'); // Provide feedback to the user
      return;
  }

  if (portfolioSize >= 5) {
      console.error('Cannot add more than 5 tickers to the portfolio.');
      alert('Cannot add more than 5 tickers to the portfolio.'); // Notify the user
      return;
  }

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
          setPortfolioTickers(prevTickers => [...prevTickers, ticker]);
          setPortfolioSize(prevSize => prevSize + 1);
          setValue(''); // Clear the input field only if the addition is successful
      } else {
          console.error('Failed to add ticker to portfolio:', response.statusText);
          alert('Failed to add ticker to portfolio.'); // Notify the user
      }
  } catch (error) {
      console.error('Error adding ticker to portfolio:', error);
      alert('Error adding ticker to portfolio.'); // Notify the user
  }
};

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
