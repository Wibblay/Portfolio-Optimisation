import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useResizeObserver } from '../hooks/ResizeObserver';
import { format } from 'date-fns';
import './PriceChart.css';  // Ensures the CSS file manages all styling

const PriceChart = ({ data }) => {
    const containerRef = useRef();
    const dimensions = useResizeObserver(containerRef);

    console.log("Rendering PriceChart with data:", data);
    const minY = Math.min(...data.map(item => item.price));
    const maxY = Math.max(...data.map(item => item.price));
    const buffer = (maxY - minY) * 0.1; // 10% buffer on each side

    const formatYAxisTick = (tickItem) => tickItem.toFixed(2);

    return (
        <div className="price-chart-container" ref={containerRef}>
            {dimensions && (
                <ResponsiveContainer width="100%" height={dimensions.height}>
                    <LineChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <Line type="linear" dataKey="price" stroke="#8884d8" dot={false} />
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="date" tickFormatter={(tickItem) => format(new Date(tickItem), 'yyyy-MM-dd')} />
                        <YAxis domain={[minY - buffer, maxY + buffer]} tickFormatter={formatYAxisTick} />
                        <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)}`, `Price`]} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default PriceChart;
