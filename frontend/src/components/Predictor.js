import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import * as d3 from 'd3';
import './Predictor.css';

const Predictor = () => {
    const [chartData, setChartData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [numSimulations, setNumSimulations] = useState(100); // Default to 100 simulations

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
        const quantile5 = d3.quantile(finalValues, 0.05).toFixed(2);
        const quantile95 = d3.quantile(finalValues, 0.95).toFixed(2);

        setStatistics({
            meanFinalValue,
            stdDevFinalValue,
            quantile5,
            quantile95,
            finalValues
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

    // KDE function using Gaussian kernel
    const kernelDensityEstimator = (kernel, x) => (V) => x.map((x) => [x, d3.mean(V, (v) => kernel(x - v))]);

    const epanechnikovKernel = (bandwidth) => (u) => Math.abs(u /= bandwidth) <= 1 ? 0.75 * (1 - u * u) / bandwidth : 0;

    const prepareKdeData = (finalValues) => {
        const bandwidth = 0.5; // Adjust bandwidth to make the curve smoother
        const kde = kernelDensityEstimator(epanechnikovKernel(bandwidth), d3.range(Math.min(...finalValues), Math.max(...finalValues), 0.1));
        const kdeData = kde(finalValues);
        return {
            labels: kdeData.map(d => d[0].toFixed(2)),
            datasets: [
                {
                    label: 'KDE of Final Portfolio Values',
                    data: kdeData.map(d => d[1]),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    fill: true,
                }
            ],
        };
    };

    const options = {
        animation: {
            onComplete: () => {},
            delay: (context) => {
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default' && !context.dropped) {
                    delay = context.dataIndex * 20 + context.datasetIndex * 100;
                    context.dropped = true;
                }
                return delay;
            },
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
    };

    return (
        <div className="predictor-section">
            <h2>Performance Prediction</h2>
            <p>This simulator runs a Monte Carlo simulation to predict the performance of your portfolio over a one-year period.</p>
            <div className="controls">
                <label htmlFor="numSimulations">Number of Simulations:</label>
                <input 
                    type="number" 
                    id="numSimulations" 
                    value={numSimulations} 
                    onChange={e => setNumSimulations(e.target.value)} 
                    min="1" 
                    step="1"
                    className="num-simulations-input"
                />
                <button onClick={fetchSimulationData} disabled={loading}>
                    {loading ? (
                        <>
                            Running Simulation...
                            <div className="loading-spinner" />
                        </>
                    ) : (
                        "Run Monte Carlo Simulation"
                    )}
                </button>
            </div>
            {chartData ? (
                <>
                    <Line 
                        data={prepareChartData(chartData)} 
                        options={options}
                    />
                    {statistics && (
                        <div className="statistics">
                            <h3>Simulation Statistics</h3>
                            <div className="statistics-grid">
                                <p><strong>Mean Final Value:</strong> {statistics.meanFinalValue}</p>
                                <p><strong>Standard Deviation:</strong> {statistics.stdDevFinalValue}</p>
                                <p><strong>5% Quantile:</strong> {statistics.quantile5}</p>
                                <p><strong>95% Quantile:</strong> {statistics.quantile95}</p>
                            </div>
                            <Line 
                                data={prepareKdeData(statistics.finalValues)} 
                                options={{
                                    scales: {
                                        x: { title: { display: true, text: 'Final Value' } },
                                        y: { title: { display: true, text: 'Density' } }
                                    },
                                    plugins: {
                                        legend: { display: false },
                                        datalabels: { display: false }
                                    },
                                    elements: {
                                        line: {
                                            tension: 0.4 // Smooth the line
                                        },
                                        point: {
                                            radius: 0
                                        }
                                    }
                                }}
                            />
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
