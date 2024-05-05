import React, { createContext, useState, useContext } from 'react';

// Create the context
export const PortfolioContext = createContext();

// Provider component that wraps your app and provides state to components
export const PortfolioProvider = ({ children }) => {
    const [portfolioTickers, setPortfolioTickers] = useState([]);

    // Function to add a ticker to the portfolio
    const addTicker = ticker => {
        setPortfolioTickers(prevTickers => [...prevTickers, ticker]);
    };

    // Function to remove a ticker from the portfolio
    const removeTicker = ticker => {
        setPortfolioTickers(prevTickers => prevTickers.filter(t => t !== ticker));
    };

    return (
        <PortfolioContext.Provider value={{ portfolioTickers, addTicker, removeTicker }}>
            {children}
        </PortfolioContext.Provider>
    );
};
