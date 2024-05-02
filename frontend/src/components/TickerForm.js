// src/components/TickerForm.js
import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import './TickerForm.css'; 

const TickerForm = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (value) => {
    const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${value}&quotesCount=5&newsCount=0`);
    const data = await response.json();
    return data.quotes.map(quote => ({
      symbol: quote.symbol,
      name: quote.longname
    }));
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

