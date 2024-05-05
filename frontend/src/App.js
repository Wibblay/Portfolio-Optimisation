import React from 'react';
import { PortfolioProvider } from './PortfolioContext';
import TickerForm from './components/TickerForm';
import PortfolioDisplay from './components/PortfolioDisplay';
import './styles/Layout.css';

function App() {
    return (
        <PortfolioProvider>
            <div>
                <h1>Portfolio Optimization Tool</h1>
                <TickerForm />
                <PortfolioDisplay />
            </div>
        </PortfolioProvider>
    );
}

export default App;
