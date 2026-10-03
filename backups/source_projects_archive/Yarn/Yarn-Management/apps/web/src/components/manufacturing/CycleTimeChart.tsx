import { Card, CardContent, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CycleTimeChartProps {
    trends: any[];
}

export default function CycleTimeChart({ trends }: CycleTimeChartProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Group by stage and calculate averages
    const stageData: Record<string, { target: number[]; actual: number[] }> = {};

    trends.forEach((trend) => {
        const stage = trend.stageName;
        if (!stageData[stage]) {
            stageData[stage] = { target: [], actual: [] };
        }
        stageData[stage].target.push(trend.targetCycleTime);
        stageData[stage].actual.push(trend.actualCycleTime);
    });

    const chartData = Object.entries(stageData).map(([stage, data]) => ({
        stage,
        target: data.target.reduce((a, b) => a + b, 0) / data.target.length,
        actual: data.actual.reduce((a, b) => a + b, 0) / data.actual.length,
    }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Cycle Time Comparison: Target vs Actual
                </Typography>
                <Typography variant="caption" color="text.secondary" paragraph>
                    Average cycle time (minutes) by production stage
                </Typography>

                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                        <XAxis
                            dataKey="stage"
                            tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                            fontSize={12}
                        />
                        <YAxis
                            tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                            fontSize={12}
                            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: isDark ? '#94a3b8' : '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                borderRadius: 8,
                            }}
                            labelStyle={{ color: isDark ? '#f8fafc' : '#1a1a1a' }}
                        />
                        <Legend />
                        <Bar dataKey="target" fill="#3b82f6" name="Target Time" />
                        <Bar dataKey="actual" fill="#f59e0b" name="Actual Time" />
                    </BarChart>
                </ResponsiveContainer>

                <Box sx={{ mt: 3, p: 2, bgcolor: isDark ? '#1e293b' : '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Analysis Notes:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        • Green bars below orange bars indicate on-target or better-than-target performance
                        <br />
                        • Orange bars significantly above blue bars indicate potential bottlenecks
                        <br />
                        • Consistent variance across stages may indicate systemic issues
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
