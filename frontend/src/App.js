import React from 'react';
import { PortfolioProvider } from './hooks/PortfolioContext';
import TickerForm from './components/TickerForm';
import PortfolioDisplay from './components/PortfolioDisplay';
import './styles/Layout.css';

function App() {
    return (
        <PortfolioProvider>
            <div className="portfolio-builder">
                <h1>Portfolio Optimization Tool</h1>
                <TickerForm />
                <PortfolioDisplay />
            </div>
        </PortfolioProvider>
    );
}

export default App;
