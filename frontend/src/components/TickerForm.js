import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import './TickerForm.css'; 
import * as finnhub from 'finnhub';

const TickerForm = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Define your Finnhub API key here
  const api_key = "coqlvopr01qmi0t8mb8gcoqlvopr01qmi0t8mb90";

  const fetchSuggestions = async (value) => {
    // Create a new instance of the Finnhub client
    const finnhubClient = new finnhub.DefaultApi();

    try {
      // Make a request to the Finnhub symbol search endpoint
      const response = await finnhubClient.search(value, { token: api_key });
      
      // Extract suggestions from the response
      const suggestions = response.result.map(item => ({
        symbol: item.symbol,
        name: item.description
      }));

      console.log('Suggestions:', suggestions);
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
    setSuggestions(suggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.symbol;

  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion.symbol} - {suggestion.name}
    </div>
  );

  const inputProps = {
    id: 'ticker-input',
    placeholder: 'Enter a ticker symbol',
    value,
    onChange: onChange
  };

  return (
    <div className="ticker-form">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    </div>
  );
};

export default TickerForm;
