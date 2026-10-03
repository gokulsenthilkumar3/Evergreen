import { useEffect, useState } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../lib/api';

export default function InventoryHealthWidget() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/inventory-health');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load inventory health');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardWidget
            title="Inventory Health"
            icon={<InventoryIcon color="primary" />}
            loading={loading}
            error={error}
            onRefresh={fetchData}
        >
            {data && (
                <Box>
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="text.primary">
                            ₹{Number(data.totalValue).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Inventory Value
                        </Typography>
                    </Box>
                    <List dense>
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {data.lowStockItems > 0 && <WarningIcon color="warning" fontSize="small" />}
                                        <span>Low Stock Items</span>
                                    </Box>
                                }
                            />
                            <Chip
                                label={data.lowStockItems}
                                color={data.lowStockItems === 0 ? 'success' : 'warning'}
                                size="small"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {data.overstockItems > 0 && <WarningIcon color="info" fontSize="small" />}
                                        <span>Overstock Items</span>
                                    </Box>
                                }
                            />
                            <Chip
                                label={data.overstockItems}
                                color={data.overstockItems === 0 ? 'success' : 'info'}
                                size="small"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Stock Turnover Ratio" />
                            <Chip label={data.turnoverRatio} color="primary" size="small" />
                        </ListItem>
                    </List>
                </Box>
            )}
        </DashboardWidget>
    );
}
