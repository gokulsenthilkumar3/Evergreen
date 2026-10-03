import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Chip
} from '@mui/material';
import { Download, PlayArrow } from '@mui/icons-material';
import { http } from '../../lib/http';

const DATA_SOURCES = [
    { id: 'orders', name: 'Sales Orders / Invoices' },
    { id: 'inventory', name: 'Raw Material Inventory' },
    { id: 'production', name: 'Production Batches' },
    { id: 'suppliers', name: 'Suppliers' }
];

const AVAILABLE_FIELDS: Record<string, string[]> = {
    orders: ['invoiceNumber', 'totalAmount', 'status', 'date', 'customerName'],
    inventory: ['batchNo', 'materialType', 'quantity', 'costPerUnit', 'status', 'receivedDate'],
    production: ['batchNumber', 'inputQuantity', 'currentStage', 'status', 'startDate', 'qualityScore'],
    suppliers: ['name', 'supplierCode', 'gstin', 'status', 'rating']
};

export default function ReportBuilder() {
    const [source, setSource] = useState('');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groupBy, setGroupBy] = useState<string>('');

    const handleSourceChange = (event: any) => {
        setSource(event.target.value);
        setSelectedFields([]); // Reset fields when source changes
        setResults([]);
    };

    const handleFieldChange = (event: any) => {
        const {
            target: { value },
        } = event;
        setSelectedFields(typeof value === 'string' ? value.split(',') : value);
    };

    const handleGenerate = async () => {
        if (!source || selectedFields.length === 0) {
            setError("Please select a source and at least one field.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const payload: any = { source, fields: selectedFields };
            if (dateRange.start && dateRange.end) {
                payload.filters = {
                    dateRange,
                    dateField: source === 'inventory' ? 'receivedDate' : 'createdAt' // Simplified mapping
                };
                // Adjust date field based on source
                if (source === 'orders') payload.filters.dateField = 'date';
                if (source === 'production') payload.filters.dateField = 'startDate';
            }

            const response = await http.post('/reporting/builder/generate', payload);
            setResults(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to generate report.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (results.length === 0) return;

        // Simple CSV Export
        const headers = selectedFields.join(',');
        const rows = results.map(row => selectedFields.map(field => {
            const val = row[field];
            // Handle dates and objects
            if (typeof val === 'object' && val !== null) return JSON.stringify(val);
            return `"${val}"`;
        }).join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `report_${source}_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Custom Report Builder</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Data Source</InputLabel>
                            <Select value={source} label="Data Source" onChange={handleSourceChange}>
                                {DATA_SOURCES.map(ds => <MenuItem key={ds.id} value={ds.id}>{ds.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small" disabled={!source}>
                            <InputLabel>Fields</InputLabel>
                            <Select
                                multiple
                                value={selectedFields}
                                label="Fields"
                                onChange={handleFieldChange}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {source && AVAILABLE_FIELDS[source]?.map(field => (
                                    <MenuItem key={field} value={field}>
                                        <Checkbox checked={selectedFields.indexOf(field) > -1} />
                                        <ListItemText primary={field} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                type="date"
                                size="small"
                                label="Start Date"
                                InputLabelProps={{ shrink: true }}
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                            <TextField
                                type="date"
                                size="small"
                                label="End Date"
                                InputLabelProps={{ shrink: true }}
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small" disabled={results.length === 0}>
                            <InputLabel>Group By</InputLabel>
                            <Select
                                value={groupBy}
                                label="Group By"
                                onChange={(e) => setGroupBy(e.target.value)}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {selectedFields.map(f => (
                                    <MenuItem key={f} value={f}>{f}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            startIcon={<PlayArrow />}
                            fullWidth
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? 'Running...' : 'Run Report'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {results.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1">Results ({results.length} records)</Typography>
                        <Button startIcon={<Download />} onClick={handleExport} variant="outlined" size="small">
                            Export CSV
                        </Button>
                    </Box>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {groupBy && <TableCell sx={{ fontWeight: 'bold' }}>Group ({groupBy})</TableCell>}
                                    {selectedFields.map(f => (
                                        <TableCell key={f} sx={{ fontWeight: 'bold' }}>{f}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(() => {
                                    if (!groupBy) {
                                        return results.map((row, idx) => (
                                            <TableRow key={idx}>
                                                {selectedFields.map(f => (
                                                    <TableCell key={f}>{
                                                        typeof row[f] === 'string' && row[f].includes('T') && row[f].includes('Z')
                                                            ? new Date(row[f]).toLocaleDateString()
                                                            : row[f]
                                                    }</TableCell>
                                                ))}
                                            </TableRow>
                                        ));
                                    }

                                    // Grouped View
                                    const groups: Record<string, any[]> = {};
                                    results.forEach(r => {
                                        const key = String(r[groupBy]);
                                        if (!groups[key]) groups[key] = [];
                                        groups[key].push(r);
                                    });

                                    return Object.entries(groups).map(([key, rows]) => (
                                        <TableRow key={key} sx={{ backgroundColor: 'action.hover' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{key}</TableCell>
                                            <TableCell colSpan={selectedFields.length}>
                                                Count: {rows.length} |
                                                Sum: {rows.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ));
                                })()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
}
