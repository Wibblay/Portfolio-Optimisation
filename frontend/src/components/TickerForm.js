import React, { useState, useContext } from 'react';
import Autosuggest from 'react-autosuggest';
import { debounce } from 'lodash';
import './TickerForm.css'; 
import '../styles/AutosuggestTheme.css';
import { PortfolioContext } from '../PortfolioContext'; 

const TickerForm = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { portfolioAssets, addAsset } = useContext(PortfolioContext);

  const fetchSuggestions = async (value) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/symbol-search?query=${value}`);
      const data = await response.json();
      if (!data.result) {
        return [];
      }
      const filteredSuggestions = data.result.filter(item => item.type === 'Common Stock');
      setSuggestions(filteredSuggestions.map(item => ({
        symbol: item.symbol,
        name: item.description
      })));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const onSuggestionsFetchRequested = ({ value }) => {
    debouncedFetchSuggestions(value);
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

  const onSuggestionSelected = (event, { suggestion }) => {
    if (!portfolioAssets.some(asset => asset.symbol === suggestion.symbol)) {
      if (portfolioAssets.length >= 5) {
        alert('Cannot add more than 5 assets to the portfolio.');
      } else {
        addAsset({symbol: suggestion.symbol, name: suggestion.name});
      }
    } else {
      alert('Asset already in portfolio.');
    }
    setValue(''); // Clear the input after the asset is selected
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  return (
    <div className="ticker-form">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={{
          id: 'ticker-input',
          placeholder: 'Enter a ticker symbol',
          value: value,
          onChange: onChange
        }}
        theme={{
          container: 'container',
          input: 'input',
          suggestionsContainer: 'suggestionsContainer',
          suggestion: 'suggestion',
          suggestionHighlighted: 'suggestionHighlighted'
        }}
      />
    </div>
  );
};

export default TickerForm;
