// src/App.js
import React from 'react';
import TickerForm from './components/TickerForm';
import OptimizeButton from './components/OptimizeButton';

function App() {
    const handleTickerSubmit = (ticker) => {
        // Handle ticker submission (e.g., add the ticker to a list of selected tickers)
        console.log('Ticker submitted:', ticker);
    };

    const handleOptimizeClick = () => {
        // Handle optimization button click (e.g., trigger optimization process)
        console.log('Optimize button clicked');
    };

    return (
        <div>
            <h1>Portfolio Optimization Tool</h1>
            <TickerForm onSubmit={handleTickerSubmit} />
            <OptimizeButton onClick={handleOptimizeClick} />
        </div>
    );
}

export default App;

