import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AlertTriangle } from 'lucide-react';

interface BottleneckAnalysisProps {
    bottlenecks: any;
}

export default function BottleneckAnalysis({ bottlenecks }: BottleneckAnalysisProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (!bottlenecks || !bottlenecks.allBottlenecks || bottlenecks.allBottlenecks.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="success.main" gutterBottom>
                            No Bottlenecks Detected
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            All production stages are operating within target cycle times
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box>
            {/* Summary by Stage */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Bottleneck Summary by Stage
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                        {bottlenecks.summary?.map((item: any) => (
                            <Box
                                key={item.stage}
                                sx={{
                                    p: 2,
                                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                    borderRadius: 2,
                                    minWidth: 150,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {item.stage}
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="error.main">
                                    {item.count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Avg variance: +{item.avgVariance.toFixed(0)} min
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* Detailed Bottleneck List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Active Bottlenecks
                    </Typography>
                    <Typography variant="caption" color="text.secondary" paragraph>
                        Showing top {bottlenecks.allBottlenecks.length} identified bottlenecks
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {bottlenecks.allBottlenecks.slice(0, 10).map((bottleneck: any, index: number) => {
                            const severityColor =
                                bottleneck.variance > 60
                                    ? 'error'
                                    : bottleneck.variance > 30
                                        ? 'warning'
                                        : 'info';

                            return (
                                <Box
                                    key={bottleneck.id}
                                    sx={{
                                        p: 2,
                                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                        borderRadius: 2,
                                        '&:hover': {
                                            bgcolor: isDark ? '#1e293b' : '#f8fafc',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AlertTriangle size={18} color={theme.palette[severityColor].main} />
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {bottleneck.batch.batchNumber}
                                            </Typography>
                                            <Chip
                                                label={bottleneck.stageName}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        </Box>
                                        <Chip
                                            label={`+${bottleneck.variance} min`}
                                            size="small"
                                            color={severityColor}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Target
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {bottleneck.targetCycleTime} min
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Actual
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {bottleneck.actualCycleTime} min
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Over Target
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold" color={severityColor}>
                                                {((bottleneck.variance / bottleneck.targetCycleTime) * 100).toFixed(0)}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {bottleneck.improvementNote && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                            {bottleneck.improvementNote}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
