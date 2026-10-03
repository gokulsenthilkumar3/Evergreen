import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, Grid } from '@mui/material';
import { http } from '../lib/http';
import { useThemeContext } from '../context/ThemeContext';

export default function StockMovementPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [filter, setFilter] = useState('');
    const { mode } = useThemeContext();

    useEffect(() => { loadLogs(); }, []);

    const loadLogs = async () => {
        try {
            const res = await http.get('/inventory/movements');
            setLogs(res.data.logs);
        } catch (e) { console.error(e); }
    };

    const filteredLogs = logs.filter(log =>
        log.itemId.toLowerCase().includes(filter.toLowerCase()) ||
        log.type.toLowerCase().includes(filter.toLowerCase()) ||
        (log.referenceId && log.referenceId.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Stock Movement History</Typography>

            <Paper sx={{ p: 2, mb: 3, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Search Logs"
                            fullWidth
                            size="small"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            placeholder="Search by ID, Type, or Reference..."
                        />
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper} sx={{ bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Item Type</TableCell>
                            <TableCell>Item ID</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Reference</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredLogs.map((log: any) => (
                            <TableRow key={log.id}>
                                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.type}
                                        size="small"
                                        color={log.type === 'IN' ? 'success' : log.type === 'OUT' ? 'error' : 'secondary'}
                                    />
                                </TableCell>
                                <TableCell>{log.itemType}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{log.itemId.substring(0, 8)}...</TableCell>
                                <TableCell>{log.quantity}</TableCell>
                                <TableCell>{log.location?.code || 'N/A'}</TableCell>
                                <TableCell>{log.referenceType} ({log.referenceId?.substring(0, 8) || 'N/A'})</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
