import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Divider,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Button,
} from '@mui/material';
import {
    AccountBalance,
    Category,
    Opacity,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const TodayDashboard: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];

    // Fetch Production Data
    const { data: productionHistory, isLoading: loadingProd } = useQuery({
        queryKey: ['productionHistory'],
        queryFn: async () => {
            const res = await api.get('/production');
            return res.data;
        }
    });

    // Fetch Costing Data
    const { data: costingEntries, isLoading: loadingCost } = useQuery({
        queryKey: ['costingEntries'],
        queryFn: async () => {
            const res = await api.get('/costing/entries');
            return res.data;
        }
    });

    const todayProduction = productionHistory?.find((p: any) => p.date === today);
    const todayCosts = costingEntries?.filter((c: any) => c.date === today) || [];

    const totalCost = todayCosts.reduce((sum: number, c: any) => sum + (c.totalCost || 0), 0);
    const totalProduced = todayProduction?.totalProduced || 0;
    const avgCostPerKg = totalProduced > 0 ? totalCost / totalProduced : 0;

    if (loadingProd || loadingCost) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Today Summary</Typography>
                    <Typography variant="subtitle1" color="text.secondary">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
                </Box>
                <Chip
                    label={todayProduction ? "Data Completed" : "Production Pending"}
                    color={todayProduction ? "success" : "warning"}
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'primary.dark', color: 'white', borderRadius: 4 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                                <AccountBalance fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Cost (Today)</Typography>
                                <Typography variant="h4" fontWeight="bold">₹{totalCost.toLocaleString('en-IN')}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'secondary.dark', color: 'white', borderRadius: 4 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                                <Category fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Produced</Typography>
                                <Typography variant="h4" fontWeight="bold">{totalProduced.toLocaleString()} kg</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'success.dark', color: 'white', borderRadius: 4 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                                <Opacity fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Avg Cost / kg</Typography>
                                <Typography variant="h4" fontWeight="bold">₹{avgCostPerKg.toFixed(2)}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Yarn Breakdown */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category color="primary" /> Yarn Production by Count
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bags (60kg)</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Weight (kg)</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rem. Log (kg)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {todayProduction?.produced?.length > 0 ? (
                                        todayProduction.produced.map((p: any) => (
                                            <TableRow key={p.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell component="th" scope="row">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip label={p.count} size="small" color="primary" variant="outlined" />
                                                        <Typography variant="body2">{p.count}s Yarn</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">{p.bags || 0}</TableCell>
                                                <TableCell align="right">{parseFloat(p.weight || 0).toFixed(2)}</TableCell>
                                                <TableCell align="right" sx={{ color: 'text.secondary' }}>{parseFloat(p.remainingLog || 0).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">No production data for today.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Waste Breakdown */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Opacity color="error" /> Waste Breakdown
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
                            {[
                                { label: 'Blow Room', val: todayProduction?.waste?.blowRoom || 0, color: '#fdd835' },
                                { label: 'Carding', val: todayProduction?.waste?.carding || 0, color: '#fb8c00' },
                                { label: 'OE Waste', val: todayProduction?.waste?.oe || 0, color: '#e53935' },
                                { label: 'Others', val: todayProduction?.waste?.others || 0, color: '#757575' },
                            ].map((w, i) => (
                                <Box key={i}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" fontWeight="medium">{w.label}</Typography>
                                        <Typography variant="body2" fontWeight="bold">{parseFloat(w.val).toFixed(2)} kg</Typography>
                                    </Box>
                                    <Box sx={{ width: '100%', height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                                        <Box sx={{
                                            width: `${todayProduction?.totalWaste > 0 ? (parseFloat(w.val) / todayProduction.totalWaste * 100) : 0}%`,
                                            height: '100%',
                                            bgcolor: w.color
                                        }} />
                                    </Box>
                                </Box>
                            ))}
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Total Waste</Typography>
                                <Typography variant="subtitle1" fontWeight="extrabold" color="error.main">
                                    {(todayProduction?.totalWaste || 0).toFixed(2)} kg
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Cost Breakdown Details */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Costing Details (Today)</Typography>
                        <Grid container spacing={2}>
                            {todayCosts.length > 0 ? todayCosts.map((c: any) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={c.id}>
                                    <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: 'dashed' }}>
                                        <CardContent>
                                            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                                {c.category}
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold">₹{parseFloat(c.totalCost || 0).toLocaleString()}</Typography>
                                            <Typography variant="caption" sx={{ mt: 1, display: 'block' }} noWrap>
                                                {c.details}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )) : (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">No costing entries for today.</Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TodayDashboard;
