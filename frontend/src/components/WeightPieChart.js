import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useResizeObserver } from '../hooks/ResizeObserver';
import './WeightPieChart.css';

const WeightPieChart = ({ data = [] }) => {
    const containerRef = useRef(null);
    const dimensions = useResizeObserver(containerRef);
    const [size, setSize] = useState(300); // Default size, adjust as needed

    useEffect(() => {
        if (dimensions && dimensions.width) {
            setSize(dimensions.width); // Set both width and height to the same value to maintain a square aspect
        }
    }, [dimensions]);

    const COLORS = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087'];

    if (data.length === 0) {
        return <div>No data to display.</div>;
    }

    return (
        <div ref={containerRef} className="pie-chart-container">
            <ResponsiveContainer width="100%" height={size}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        label={({ symbol }) => symbol}  // Display only the asset symbol
                        outerRadius="50%"
                        fill="#8884d8"
                        dataKey="weight"
                        labelLine={false} // Ensure there are no connecting lines
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeightPieChart;
