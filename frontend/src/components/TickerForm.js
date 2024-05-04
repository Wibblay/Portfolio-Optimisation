import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import './TickerForm.css'; 
import './theme.css';

const TickerForm = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

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
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={{ id: 'ticker-input', placeholder: 'Enter a ticker symbol', value, onChange }}
        theme={theme} // Apply the theme object here
      />
    </div>
  );
};

export default TickerForm;
