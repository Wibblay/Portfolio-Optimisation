import React from 'react';
import './PortfolioTable.css';  // Assuming you have some basic styling

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
