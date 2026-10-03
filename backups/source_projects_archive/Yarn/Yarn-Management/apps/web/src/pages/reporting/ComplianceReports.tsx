import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import { Print } from '@mui/icons-material';
import { http } from '../../lib/http';

export default function ComplianceReports() {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Box>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabIndex} onChange={(e, n) => setTabIndex(n)}>
                    <Tab label="GST Reports (GSTR-1)" />
                    <Tab label="Financial Statements" />
                    <Tab label="Audit Logs" />
                </Tabs>
            </Paper>

            {tabIndex === 0 && <GSTReportView />}
            {tabIndex === 1 && <FinancialStatementView />}
            {tabIndex === 2 && <AuditLogView />}
        </Box>
    );
}

function GSTReportView() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        if (!dateRange.start || !dateRange.end) return;
        setLoading(true);
        try {
            // Correct params mapping
            const res = await http.get(`/reporting/compliance/gstr1?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField type="date" label="From" InputLabelProps={{ shrink: true }} size="small"
                    value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                <TextField type="date" label="To" InputLabelProps={{ shrink: true }} size="small"
                    value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                <Button variant="contained" onClick={loadData} disabled={loading}>Generate Report</Button>
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} disabled={data.length === 0}>Print</Button>
            </Box>

            {loading && <CircularProgress />}

            {data.length > 0 && (
                <TableContainer component={Paper} id="print-section">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#eee' }}>
                                <TableCell>GSTIN/UIN</TableCell>
                                <TableCell>Invoice Number</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Invoice Value</TableCell>
                                <TableCell align="right">Taxable Value</TableCell>
                                <TableCell align="right">Rate (%)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell>{row.gstin}</TableCell>
                                    <TableCell>{row.invoiceNumber}</TableCell>
                                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">₹{Number(row.value).toFixed(2)}</TableCell>
                                    <TableCell align="right">₹{Number(row.taxableValue).toFixed(2)}</TableCell>
                                    <TableCell align="right">{row.taxRate === null ? 'Not available' : `${row.taxRate}%`}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    )
}

function FinancialStatementView() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const amount = (value: number | null) => value === null ? 'Not available' : `₹${Number(value).toLocaleString()}`;

    const loadData = async () => {
        if (!dateRange.start || !dateRange.end) return;
        setLoading(true);
        try {
            const res = await http.get(`/reporting/compliance/financials?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField type="date" label="From" InputLabelProps={{ shrink: true }} size="small"
                    value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                <TextField type="date" label="To" InputLabelProps={{ shrink: true }} size="small"
                    value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                <Button variant="contained" onClick={loadData} disabled={loading}>Generate financial snapshot</Button>
            </Box>

            {data && (
                <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }} id="print-section">
                    <Typography variant="h5" align="center" gutterBottom>Financial snapshot</Typography>
                    <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
                        {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
                    </Typography>
                    {data.note && <Alert severity="info" sx={{ mt: 2 }}>{data.note}</Alert>}

                    <Box sx={{ mt: 4 }}>
                        <Grid container sx={{ borderBottom: 1, borderColor: 'divider', py: 1 }}>
                            <Grid item xs={8}><Typography fontWeight="bold">Revenue</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography fontWeight="bold">{amount(data.revenue)}</Typography></Grid>
                        </Grid>
                        <Grid container sx={{ borderBottom: 1, borderColor: 'divider', py: 1 }}>
                            <Grid item xs={8}><Typography>Cost of Goods Sold (COGS)</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography color="error">{amount(data.cogs)}</Typography></Grid>
                        </Grid>
                        <Grid container sx={{ borderBottom: 2, borderColor: 'black', py: 1, bgcolor: '#f5f5f5' }}>
                            <Grid item xs={8}><Typography fontWeight="bold">Gross Profit</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography fontWeight="bold">{amount(data.grossProfit)}</Typography></Grid>
                        </Grid>
                        <Grid container sx={{ borderBottom: 1, borderColor: 'divider', py: 1 }}>
                            <Grid item xs={8}><Typography>Operating Expenses</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography color="error">{amount(data.expenses)}</Typography></Grid>
                        </Grid>
                        <Grid container sx={{ borderBottom: 2, borderColor: 'black', py: 1, bgcolor: '#e3f2fd' }}>
                            <Grid item xs={8}><Typography fontWeight="bold" variant="h6">Net Profit</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography fontWeight="bold" variant="h6" color={data.netProfit === null ? 'text.secondary' : data.netProfit >= 0 ? 'success.main' : 'error.main'}>
                                {amount(data.netProfit)}
                            </Typography></Grid>
                        </Grid>
                    </Box>
                </Paper>
            )}
        </Box>
    )
}

function AuditLogView() {
    return (
        <Alert severity="info">Audit Log functionality is centralized in Settings / Activity Logs. Please refer to that section for detailed audit trails.</Alert>
    )
}
