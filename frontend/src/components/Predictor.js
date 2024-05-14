import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import './Predictor.css';

const Predictor = () => {
    const [chartData, setChartData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [numSimulations, setNumSimulations] = useState(1000); // Default to 1000 simulations

    const fetchSimulationData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/monte_carlo_simulation?numSimulations=${numSimulations}`);
            const data = await response.json();
            setChartData(data);
            calculateStatistics(data);
        } catch (error) {
            console.error("Error fetching Monte Carlo simulation data:", error);
        }
        setLoading(false);
    };

    const calculateStatistics = (data) => {
        const finalValues = data[data.length - 1];
        const meanFinalValue = (finalValues.reduce((sum, value) => sum + value, 0) / finalValues.length).toFixed(2);
        const stdDevFinalValue = (Math.sqrt(finalValues.map(val => Math.pow(val - meanFinalValue, 2)).reduce((a, b) => a + b) / finalValues.length)).toFixed(2);

        setStatistics({
            meanFinalValue,
            stdDevFinalValue
        });
    };

    const prepareChartData = (data) => {
        const labels = Array.from({ length: data.length }, (_, i) => `Day ${i + 1}`);
        const datasets = data[0].map((_, i) => ({
            label: `Simulation ${i + 1}`,
            data: data.map(dayData => dayData[i]),
            borderColor: `rgba(75,192,192,${0.4 + (i / data[0].length) * 0.6})`,
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
        }));

        return {
            labels,
            datasets,
        };
    };

    return (
        <div className="predictor-section">
            <h2>Prediction Environment</h2>
            <div className="controls">
                <label htmlFor="numSimulations">Number of Simulations:</label>
                <input 
                    type="number" 
                    id="numSimulations" 
                    value={numSimulations} 
                    onChange={e => setNumSimulations(e.target.value)} 
                    min="1" 
                    step="1"
                />
                <button onClick={fetchSimulationData} disabled={loading}>
                    {loading ? "Running Simulation..." : "Run Monte Carlo Simulation"}
                </button>
            </div>
            {chartData ? (
                <>
                    <Line 
                        data={prepareChartData(chartData)} 
                        options={{
                            animation: {
                                duration: 2000,
                                easing: 'easeOutBounce'
                            },
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            elements: {
                                point: {
                                    radius: 0
                                }
                            }
                        }} 
                    />
                    {statistics && (
                        <div className="statistics">
                            <h3>Simulation Statistics</h3>
                            <p><strong>Mean Final Value:</strong> {statistics.meanFinalValue}</p>
                            <p><strong>Standard Deviation of Final Values:</strong> {statistics.stdDevFinalValue}</p>
                        </div>
                    )}
                </>
            ) : (
                <p>No simulation data yet. Click the button to run the simulation.</p>
            )}
        </div>
    );
};

export default Predictor;
