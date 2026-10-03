import { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import BusinessIcon from '@mui/icons-material/Business';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';

export default function SupplierPerformanceWidget() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/supplier-performance');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load supplier performance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardWidget
            title="Supplier Performance"
            icon={<BusinessIcon color="primary" />}
            loading={loading}
            error={error}
            onRefresh={fetchData}
        >
            {data && (
                <Box>
                    {data.topSuppliers && data.topSuppliers.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.topSuppliers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="qualityRating" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary" align="center">
                            No supplier data available
                        </Typography>
                    )}
                </Box>
            )}
        </DashboardWidget>
    );
}
