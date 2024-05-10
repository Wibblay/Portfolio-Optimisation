import React, { useState } from 'react';
import { PortfolioProvider } from './hooks/PortfolioContext';
import TickerForm from './components/TickerForm';
import PortfolioDisplay from './components/PortfolioDisplay';
import Optimizer from './components/Optimizer';  // Assuming you create this component
import Predictor from './components/Predictor';
import './styles/Layout.css';

function App() {
    const [activeTab, setActiveTab] = useState('optimizer');

    return (
        <PortfolioProvider>
            <header className="header">
                <h1>Portfolio Optimization Tool</h1>
            </header>
            <div className='main-container'>
                <div className="portfolio-builder">
                    <TickerForm />
                    <PortfolioDisplay />
                </div>
                <div className="optimization-tools">
                    <div className="tab-toolbar">
                        <button onClick={() => setActiveTab('optimizer')} 
                                className={activeTab === 'optimizer' ? 'active' : ''}>
                            Optimizer
                        </button>
                        <button onClick={() => setActiveTab('predictor')}
                                className={activeTab === 'predictor' ? 'active' : ''}>
                            Predictor
                        </button>
                    </div>
                    {activeTab === 'optimizer' && <Optimizer />}
                    {activeTab === 'predictor' && <Predictor />}
                </div>
            </div>
        </PortfolioProvider>
    );
}

export default App;
