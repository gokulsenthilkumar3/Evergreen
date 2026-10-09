import { Card, CardContent, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface OEEGaugeChartProps {
    oee: number;
    label?: string;
}

export default function OEEGaugeChart({ oee, label = 'OEE' }: OEEGaugeChartProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Determine color based on OEE value
    const getColor = () => {
        if (oee >= 85) return '#22c55e'; // Green - World Class
        if (oee >= 60) return '#3b82f6'; // Blue - Good
        if (oee >= 40) return '#f59e0b'; // Orange - Fair
        return '#ef4444'; // Red - Poor
    };

    const getLevel = () => {
        if (oee >= 85) return 'World Class';
        if (oee >= 60) return 'Good';
        if (oee >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    const color = getColor();
    const level = getLevel();
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (oee / 100) * circumference;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {label}
                </Typography>

                <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center', mt: 2 }}>
                    <svg width="240" height="240" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke={isDark ? '#334155' : '#e2e8f0'}
                            strokeWidth="12"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke={color}
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform="rotate(-90 100 100)"
                            style={{
                                transition: 'stroke-dashoffset 0.5s ease',
                            }}
                        />
                        {/* Center text */}
                        <text
                            x="100"
                            y="95"
                            textAnchor="middle"
                            fontSize="42"
                            fontWeight="bold"
                            fill={isDark ? '#f8fafc' : '#1a1a1a'}
                        >
                            {oee.toFixed(1)}%
                        </text>
                        <text
                            x="100"
                            y="120"
                            textAnchor="middle"
                            fontSize="14"
                            fill={isDark ? '#94a3b8' : '#64748b'}
                        >
                            {level}
                        </text>
                    </svg>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        OEE Benchmarks:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
                            <Typography variant="caption">≥85% World Class</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                            <Typography variant="caption">60-84% Good</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                            <Typography variant="caption">40-59% Fair</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                            <Typography variant="caption">\u003c40% Poor</Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
