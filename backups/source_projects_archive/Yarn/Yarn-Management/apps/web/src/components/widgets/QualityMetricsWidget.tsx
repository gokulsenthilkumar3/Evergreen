import { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Typography, Chip, Grid, Tooltip as MuiTooltip } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import api from '../../lib/api';

interface QualityMetricsData {
    gradeDistribution: {
        distribution: Array<{
            grade: string;
            count: number;
            quantity: string;
            percentage: number;
        }>;
        summary: {
            totalBatches: number;
            totalQuantity: string;
            gradeAPercentage: number;
        };
    };
    defectTrends: {
        trends: Array<{
            date: string;
            avgQualityScore: number | null;
            defectRate: number | null;
            sampleCount: number;
        }>;
        summary: {
            averageQualityScore: number;
            averageDefectRate: number;
            totalSamples: number;
        };
    };
    heatmap: {
        months: string[];
        materialTypes: string[];
        heatmap: Array<Record<string, any>>;
    };
}

const GRADE_COLORS: Record<string, string> = {
    'A': '#10b981', // Green
    'B': '#f59e0b', // Orange
    'C': '#ef4444', // Red
    'Ungraded': '#94a3b8', // Gray
};

// Color scale for heatmap (red to green)
function getHeatmapColor(score: number | null): string {
    if (score === null) return '#f1f5f9'; // Light gray for no data
    if (score >= 90) return '#10b981'; // Excellent - Green
    if (score >= 80) return '#34d399'; // Good - Light green
    if (score >= 70) return '#fbbf24'; // Average - Yellow
    if (score >= 60) return '#f59e0b'; // Below average - Orange
    return '#ef4444'; // Poor - Red
}

export default function QualityMetricsWidget() {
    const [data, setData] = useState<QualityMetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/quality-metrics?days=30');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load quality metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const renderGradeDistribution = () => {
        if (!data?.gradeDistribution) return null;
        const { distribution, summary } = data.gradeDistribution;

        return (
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    dataKey="count"
                                    nameKey="grade"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    label={(props) => `${props.payload?.grade || props.name}: ${props.payload?.percentage || 0}%`}
                                >
                                    {distribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={GRADE_COLORS[entry.grade] || '#94a3b8'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value} batches`,
                                        `Grade ${name}`,
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                                <Typography variant="h4" fontWeight="bold" color="#10b981">
                                    {summary.gradeAPercentage}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Grade A Production
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {summary.totalBatches}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Batches
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {distribution.map((item) => (
                                    <Chip
                                        key={item.grade}
                                        label={`${item.grade}: ${item.count}`}
                                        size="small"
                                        sx={{
                                            bgcolor: `${GRADE_COLORS[item.grade]}20`,
                                            color: GRADE_COLORS[item.grade],
                                            fontWeight: 'bold',
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderDefectTrends = () => {
        if (!data?.defectTrends) return null;
        const { trends, summary } = data.defectTrends;

        if (trends.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    No quality data available for the selected period
                </Box>
            );
        }

        return (
            <Box>
                <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="#10b981">
                            {summary.averageQualityScore}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Avg Quality Score
                        </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#fef2f2', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="#ef4444">
                            {summary.averageDefectRate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Avg Defect Rate
                        </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {summary.totalSamples}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total Samples
                        </Typography>
                    </Box>
                </Box>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                        />
                        <YAxis
                            yAxisId="left"
                            domain={[0, 100]}
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                            labelFormatter={(value) => typeof value === 'string' || typeof value === 'number' ? new Date(value).toLocaleDateString() : ''}
                            contentStyle={{
                                borderRadius: 8,
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avgQualityScore"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Quality Score"
                            dot={{ r: 3 }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="defectRate"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Defect Rate"
                            dot={{ r: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    const renderHeatmap = () => {
        if (!data?.heatmap) return null;
        const { months, heatmap } = data.heatmap;

        if (heatmap.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    No material quality data available
                </Box>
            );
        }

        return (
            <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 500 }}>
                    {/* Header row */}
                    <Box sx={{ display: 'flex', mb: 1 }}>
                        <Box sx={{ width: 120, flexShrink: 0 }} />
                        {months.map((month) => (
                            <Box
                                key={month}
                                sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: 'text.secondary',
                                }}
                            >
                                {month}
                            </Box>
                        ))}
                    </Box>
                    {/* Data rows */}
                    {heatmap.map((row) => (
                        <Box key={row.materialType} sx={{ display: 'flex', mb: 0.5 }}>
                            <Box
                                sx={{
                                    width: 120,
                                    flexShrink: 0,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    pr: 1,
                                }}
                            >
                                {row.materialType}
                            </Box>
                            {months.map((month) => {
                                const score = row[month];
                                return (
                                    <MuiTooltip
                                        key={month}
                                        title={score !== null ? `${row.materialType} - ${month}: ${score}` : 'No data'}
                                        arrow
                                    >
                                        <Box
                                            sx={{
                                                flex: 1,
                                                height: 36,
                                                bgcolor: getHeatmapColor(score),
                                                borderRadius: 1,
                                                mx: 0.25,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 11,
                                                fontWeight: 'bold',
                                                color: score !== null && score < 70 ? '#fff' : '#1e293b',
                                                cursor: 'pointer',
                                                transition: 'transform 0.1s',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                },
                                            }}
                                        >
                                            {score !== null ? score : '-'}
                                        </Box>
                                    </MuiTooltip>
                                );
                            })}
                        </Box>
                    ))}
                    {/* Legend */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        {[
                            { label: '90+', color: '#10b981' },
                            { label: '80-89', color: '#34d399' },
                            { label: '70-79', color: '#fbbf24' },
                            { label: '60-69', color: '#f59e0b' },
                            { label: '<60', color: '#ef4444' },
                        ].map((item) => (
                            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        bgcolor: item.color,
                                        borderRadius: 0.5,
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <DashboardWidget
            title="Quality Metrics"
            icon={<VerifiedIcon color="success" />}
            loading={loading}
            error={error}
            onRefresh={fetchData}
        >
            <Box>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Grade Distribution" sx={{ textTransform: 'none' }} />
                    <Tab label="Defect Trends" sx={{ textTransform: 'none' }} />
                    <Tab label="Quality Heatmap" sx={{ textTransform: 'none' }} />
                </Tabs>
                {activeTab === 0 && renderGradeDistribution()}
                {activeTab === 1 && renderDefectTrends()}
                {activeTab === 2 && renderHeatmap()}
            </Box>
        </DashboardWidget>
    );
}
