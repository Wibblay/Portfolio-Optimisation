import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format } from 'date-fns';

const PriceChart = ({ data }) => {
    const minY = Math.min(...data.map(item => item.price));
    const maxY = Math.max(...data.map(item => item.price));
    const buffer = (maxY - minY) * 0.1; // 10% buffer on each side

    return (
        <LineChart width={400} height={200} data={data}>
            <Line type="linear" dataKey="price" stroke="#8884d8" dot={false} />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" tickFormatter={(tickItem) => format(new Date(tickItem), 'yyyy-MM-dd')} />
            <YAxis domain={[minY - buffer, maxY + buffer]} />
            <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)}`, `Price`]} />
        </LineChart>
    );
};

export default PriceChart;