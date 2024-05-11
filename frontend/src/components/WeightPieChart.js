import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useResizeObserver } from '../hooks/ResizeObserver'; // Ensure this path is correct

const DraggablePieChart = ({ data }) => {
    const containerRef = useRef(null);
    const dimensions = useResizeObserver(containerRef);
    const [size, setSize] = useState(300); // Default size

    useEffect(() => {
        if (dimensions && dimensions.width) {
            setSize(dimensions.width); // Set both width and height to the same value
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
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                        outerRadius="50%"
                        fill="#8884d8"
                        dataKey="weight"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DraggablePieChart;
