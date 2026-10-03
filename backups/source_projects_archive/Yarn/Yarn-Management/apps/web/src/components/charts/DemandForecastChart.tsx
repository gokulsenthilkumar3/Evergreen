import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

interface DataPoint {
    month: string; // "Jan", "Feb" etc
    year: number;
    historical?: number;
    forecast?: number;
    confidenceHigh?: number; // For future use
    confidenceLow?: number;  // For future use
}

interface DemandForecastChartProps {
    data: DataPoint[];
    productType: string;
}

const DemandForecastChart: React.FC<DemandForecastChartProps> = ({ data, productType }) => {
    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                Demand Forecast: {productType}
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="historical"
                            name="Historical Sales"
                            stroke="#8884d8"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            name="Predicted Demand"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default DemandForecastChart;
