import React from 'react';
import { PortfolioProvider } from './hooks/PortfolioContext';
import TickerForm from './components/TickerForm';
import PortfolioDisplay from './components/PortfolioDisplay';
import './styles/Layout.css';

function App() {
    return (
        <PortfolioProvider>
            <header className="header">
                <h1>Portfolio Optimization Tool</h1>
            </header>
            <div className="portfolio-builder">
                <TickerForm />
                <PortfolioDisplay />
            </div>
        </PortfolioProvider>
    );
}

export default App;
