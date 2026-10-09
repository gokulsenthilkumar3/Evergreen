import React, { useEffect, useState } from 'react';
import { http } from '../../../../lib/http';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './PerformanceTrendChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PerformanceMetric {
    id: string;
    metricType: string;
    value: number;
    recordedAt: string;
}

interface Props {
    supplierId: string;
}

const METRIC_COLORS: Record<string, string> = {
    ON_TIME_DELIVERY: '#10b981',
    QUALITY_SCORE: '#3b82f6',
    PRICE_COMPETITIVENESS: '#f59e0b',
    RESPONSIVENESS: '#8b5cf6',
    ORDER_ACCURACY: '#ec4899',
    DEFECT_RATE: '#ef4444',
    LEAD_TIME_ADHERENCE: '#06b6d4',
    COMPLIANCE: '#6366f1',
};

const METRIC_LABELS: Record<string, string> = {
    ON_TIME_DELIVERY: 'On-Time Delivery',
    QUALITY_SCORE: 'Quality',
    PRICE_COMPETITIVENESS: 'Price',
    RESPONSIVENESS: 'Responsiveness',
    ORDER_ACCURACY: 'Accuracy',
    DEFECT_RATE: 'Defects',
    LEAD_TIME_ADHERENCE: 'Lead Time',
    COMPLIANCE: 'Compliance',
};

const PerformanceTrendChart: React.FC<Props> = ({ supplierId }) => {
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [days, setDays] = useState(90);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrends();
    }, [days, supplierId]);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const res = await http.get(`/suppliers/performance/${supplierId}/metrics/trends?days=${days}`);
            setMetrics(res.data.trends);
        } catch (error) {
            console.error('Failed to fetch trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = () => {
        if (metrics.length === 0) return null;

        // Group by date
        const dateMap = new Map<string, Record<string, number>>();

        metrics.forEach((m) => {
            const date = new Date(m.recordedAt).toLocaleDateString();
            if (!dateMap.has(date)) {
                dateMap.set(date, {});
            }
            dateMap.get(date)![m.metricType] = m.value;
        });

        const dates = Array.from(dateMap.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const metricTypes = Array.from(new Set(metrics.map((m) => m.metricType)));

        const datasets = metricTypes.map((metricType) => ({
            label: METRIC_LABELS[metricType] || metricType,
            data: dates.map((date) => dateMap.get(date)?.[metricType] || null),
            borderColor: METRIC_COLORS[metricType] || '#9ca3af',
            backgroundColor: METRIC_COLORS[metricType] || '#9ca3af',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        }));

        return {
            labels: dates,
            datasets,
        };
    };

    const chartData = prepareChartData();

    if (loading) {
        return <div className="trend-chart-loading">Loading trends...</div>;
    }

    if (!chartData || metrics.length === 0) {
        return (
            <div className="trend-chart-section">
                <h2>Performance Trends</h2>
                <div className="no-data">No performance data available for the selected period.</div>
            </div>
        );
    }

    return (
        <div className="trend-chart-section">
            <div className="chart-header">
                <h2>Performance Trends</h2>
                <div className="time-range-selector">
                    <button
                        className={days === 7 ? 'active' : ''}
                        onClick={() => setDays(7)}
                    >
                        7D
                    </button>
                    <button
                        className={days === 30 ? 'active' : ''}
                        onClick={() => setDays(30)}
                    >
                        30D
                    </button>
                    <button
                        className={days === 90 ? 'active' : ''}
                        onClick={() => setDays(90)}
                    >
                        90D
                    </button>
                    <button
                        className={days === 365 ? 'active' : ''}
                        onClick={() => setDays(365)}
                    >
                        1Y
                    </button>
                </div>
            </div>
            <div className="chart-container">
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    callback: (value) => `${value}%`,
                                },
                            },
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false,
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default PerformanceTrendChart;
