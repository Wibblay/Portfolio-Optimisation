/*App.js*/
import React, { useState } from 'react';
import { PortfolioProvider } from './hooks/PortfolioContext';
import TickerForm from './components/TickerForm';
import PortfolioBuilder from './components/PortfolioBuilder';
import Optimizer from './components/Optimizer';
import Predictor from './components/Predictor';
import PortfolioSummary from './components/PortfolioSummary';
import './styles/Layout.css';

/**
 * Main application component for the Portfolio Optimization Tool.
 * @returns {JSX.Element} The rendered component.
 */
function App() {
    const [activeTab, setActiveTab] = useState('portfolio-summary');

    /**
     * Sets the active tab to display the corresponding component.
     * @param {string} tabName - The name of the tab to activate.
     */
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <PortfolioProvider>
            <header className="header">
                <h1>Portfolio Optimization Tool</h1>
            </header>
            <div className="main-container">
                <div className="portfolio-builder">
                    <TickerForm />
                    <PortfolioBuilder />
                </div>
                <div className="customization-tools">
                    <div className="tab-toolbar">
                        <button 
                            onClick={() => handleTabClick('portfolio-summary')}
                            className={activeTab === 'portfolio-summary' ? 'active' : ''}
                        >
                            Portfolio Summary
                        </button>
                        <button 
                            onClick={() => handleTabClick('optimizer')}
                            className={activeTab === 'optimizer' ? 'active' : ''}
                        >
                            Optimizer
                        </button>
                        <button 
                            onClick={() => handleTabClick('predictor')}
                            className={activeTab === 'predictor' ? 'active' : ''}
                        >
                            Predictor
                        </button>
                    </div>
                    {activeTab === 'portfolio-summary' && <PortfolioSummary />}
                    {activeTab === 'optimizer' && <Optimizer />}
                    {activeTab === 'predictor' && <Predictor />}
                </div>
            </div>
        </PortfolioProvider>
    );
}

export default App;
