import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Stack,
    Chip
} from '@mui/material';
import { http } from '../lib/http';
import DemandForecastChart from '../components/charts/DemandForecastChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAutoModeIcon from '@mui/icons-material/AutoMode';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PublicIcon from '@mui/icons-material/Public';

interface ChartDataPoint {
    month: string;
    year: number;
    sortKey: number;
    historical?: number;
    forecast?: number;
}

interface ForecastDetail {
    marketAdjustmentFactor?: number;
    accuracyScore?: number;
}

const DemandForecastingPage = () => {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [data, setData] = useState<Record<string, Record<string, ChartDataPoint>>>({});
    const [details, setDetails] = useState<Record<string, ForecastDetail>>({}); // Product -> Details
    const [products, setProducts] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const getMonthName = (month: number) => {
        if (isNaN(month) || month < 1 || month > 12) return 'Unknown';
        const date = new Date();
        date.setMonth(month - 1);
        return date.toLocaleString('default', { month: 'short' });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch both history and forecasts
            const [historyRes, forecastRes] = await Promise.all([
                http.get('/demand-forecasting/history'),
                http.get('/demand-forecasting')
            ]);

            const history: any[] = historyRes.data || [];
            const forecasts: any[] = forecastRes.data || [];

            // Extract unique products
            const allProducts = new Set<string>();
            history.forEach((d: any) => allProducts.add(d.productType));
            forecasts.forEach((d: any) => allProducts.add(d.productType));

            const productList = Array.from(allProducts);
            setProducts(productList);

            if (!selectedProduct && productList.length > 0) {
                setSelectedProduct(productList[0]);
            }

            // Merge data
            const merged: Record<string, Record<string, ChartDataPoint>> = {};
            const productDetails: Record<string, ForecastDetail> = {};

            history.forEach((h: any) => {
                const prod = h.productType;
                if (!merged[prod]) merged[prod] = {};
                const key = `${h.year}-${h.month}`;
                merged[prod][key] = {
                    month: getMonthName(Number(h.month)),
                    year: Number(h.year),
                    sortKey: Number(h.year) * 100 + Number(h.month),
                    historical: Number(h.quantity),
                    forecast: undefined
                };
            });

            forecasts.forEach((f: any) => {
                const prod = f.productType;
                if (!merged[prod]) merged[prod] = {};
                // Capture details from the latest forecast for the product
                productDetails[prod] = {
                    marketAdjustmentFactor: f.marketAdjustmentFactor,
                    accuracyScore: f.accuracyScore
                };

                const key = `${f.year}-${f.month}`;
                if (!merged[prod][key]) {
                    merged[prod][key] = {
                        month: getMonthName(Number(f.month)),
                        year: Number(f.year),
                        sortKey: Number(f.year) * 100 + Number(f.month),
                        historical: undefined
                    };
                }
                merged[prod][key].forecast = Number(f.forecastedQuantity);
            });

            setData(merged);
            setDetails(productDetails);

        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            await http.post('/demand-forecasting/generate');
            await fetchData(); // Reload data
        } catch (err) {
            console.error(err);
            setError('Failed to generate forecasts');
        } finally {
            setGenerating(false);
        }
    };

    const getChartData = (): any[] => {
        if (!selectedProduct || !data[selectedProduct]) return [];
        const productData = Object.values(data[selectedProduct]);
        // Sort by date
        return productData.sort((a, b) => a.sortKey - b.sortKey);
    };

    const currentDetail = selectedProduct ? details[selectedProduct] : undefined;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Demand Forecasting</Typography>
                <Box>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={fetchData}
                        sx={{ mr: 2 }}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAutoModeIcon />}
                        onClick={handleGenerate}
                        disabled={generating || loading}
                    >
                        {generating ? 'Running ML Model...' : 'Run Forecast Model'}
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Product Type</InputLabel>
                    <Select
                        value={selectedProduct}
                        label="Product Type"
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        {products.map(p => (
                            <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" gap={1} mb={1}>
                                <TrendingUpIcon color="primary" />
                                <Typography variant="h6">Market Impact</Typography>
                            </Stack>
                            <Typography variant="h4">
                                {currentDetail?.marketAdjustmentFactor ?
                                    `x${currentDetail.marketAdjustmentFactor}` :
                                    '1.0x (Neutral)'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Regional & Global Factor Multiplier
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" gap={1} mb={1}>
                                <PsychologyIcon color="secondary" />
                                <Typography variant="h6">Model Accuracy</Typography>
                            </Stack>
                            <Typography variant="h4">
                                {currentDetail?.accuracyScore ?
                                    `${currentDetail.accuracyScore}%` :
                                    'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Based on previous month predictions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" alignItems="center" gap={1} mb={1}>
                                <PublicIcon color="success" />
                                <Typography variant="h6">Active Factors</Typography>
                            </Stack>
                            <Stack direction="row" gap={1} flexWrap="wrap">
                                <Chip label="Tiruppur Export Demand" size="small" color="success" variant="outlined" />
                                <Chip label="Global Cotton Price" size="small" color="primary" variant="outlined" />
                                <Chip label="Diwali Seasonality" size="small" color="warning" variant="outlined" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {selectedProduct ? (
                            <DemandForecastChart
                                data={getChartData()}
                                productType={selectedProduct}
                            />
                        ) : (
                            <Alert severity="info">No data available. Try running the forecast model.</Alert>
                        )}
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default DemandForecastingPage;
