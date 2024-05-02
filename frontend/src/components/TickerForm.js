// src/components/TickerForm.js
import React, { useState } from 'react';

function TickerForm({ onSubmit }) {
    const [ticker, setTicker] = useState('');

    const handleChange = (event) => {
        setTicker(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(ticker);
        setTicker(''); // Clear the input field after submission
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Ticker:
                <input type="text" value={ticker} onChange={handleChange} />
            </label>
            <button type="submit">Add Ticker</button>
        </form>
    );
}

export default TickerForm;
