import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useResizeObserver } from '../hooks/ResizeObserver'; // Ensure this path is correct

const WeightPieChart = ({ data }) => {
    const containerRef = useRef(null);
    const dimensions = useResizeObserver(containerRef);
    const [size, setSize] = useState(300); // Default size, adjust as needed

    useEffect(() => {
        if (dimensions && dimensions.width) {
            setSize(dimensions.width); // Set both width and height to the same value to maintain a square aspect
        }
    }, [dimensions]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div ref={containerRef} style={{ width: '100%', height: 'auto', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={size}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ symbol }) => symbol}  // Display only the asset symbol
                        outerRadius="50%"
                        fill="#8884d8"
                        dataKey="weight"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeightPieChart;
