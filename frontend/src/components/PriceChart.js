import React, { useRef } from 'react';
import { LineChart, AreaChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
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
    const trendColor = data.length > 1 && data[0].price > data[data.length - 1].price ? '#ff6347' : '#32cd32';

    return (
        <div className="price-chart-container" ref={containerRef}>
            {dimensions && (
                <ResponsiveContainer width="100%" height={dimensions.height}>
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={trendColor} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Line type="linear" dataKey="price" stroke={trendColor} dot={false} />
                        <Area type="linear" dataKey="price" stroke={trendColor} fill={trendColor} fillOpacity={0.3} />
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="date" tickFormatter={(tickItem) => format(new Date(tickItem), 'yyyy-MM-dd')}
                            style={{ fontSize: '12px' }}
                         />
                        <YAxis domain={[minY - buffer, maxY + buffer]} tickFormatter={formatYAxisTick}
                            style={{ fontSize: '12px' }}
                         />
                        <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)}`, `Price`]} />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default PriceChart;
