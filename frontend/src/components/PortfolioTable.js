/* PortfolioTable.js */
import React from 'react';
import '../styles/PortfolioTable.css';  

/**
 * Component to display a table of portfolio assets and their weights.
 * 
 * @param {Array} assets - Array of asset objects with `symbol` and `weight` properties.
 * @returns {JSX.Element} The rendered PortfolioTable component.
 */
const PortfolioTable = ({ assets }) => {
    return (
        <div className="portfolio-table">
            <table>
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th>Weight</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map(asset => (
                        <tr key={asset.symbol}>
                            <td>{asset.symbol}</td>
                            <td>{(asset.weight * 100).toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PortfolioTable;
