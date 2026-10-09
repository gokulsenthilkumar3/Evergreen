import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Chip
} from '@mui/material';
import { DollarSign, Download, Send } from 'lucide-react';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const PayrollManagementPage = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentDate = new Date();
    const [filters, setFilters] = useState({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        status: ''
    });

    useEffect(() => {
        fetchPayrolls();
    }, [filters]);

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const response = await http.get('/hr/payroll', { params: filters });
            setPayrolls(response.data.payrolls);
        } catch (error) {
            notify.showError('Failed to fetch payrolls');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkGenerate = async () => {
        try {
            const response = await http.post('/hr/payroll/bulk-generate', {
                month: filters.month,
                year: filters.year
            });
            notify.showSuccess(`Generated payroll for ${response.data.results.length} employees`);
            fetchPayrolls();
        } catch (error) {
            notify.showError('Failed to generate payroll');
        }
    };

    const handleProcessPayroll = async (id: string) => {
        try {
            await http.post(`/hr/payroll/${id}/process`);
            notify.showSuccess('Payroll processed successfully');
            fetchPayrolls();
        } catch (error) {
            notify.showError('Failed to process payroll');
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            await http.post(`/hr/payroll/${id}/pay`, {
                paymentMethod: 'BANK_TRANSFER',
                paymentRef: `PAY-${Date.now()}`
            });
            notify.showSuccess('Payroll marked as paid');
            fetchPayrolls();
        } catch (error) {
            notify.showError('Failed to mark as paid');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'default';
            case 'PROCESSED': return 'info';
            case 'PAID': return 'success';
            default: return 'default';
        }
    };

    const stats = {
        total: payrolls.reduce((sum: number, p: any) => sum + Number(p.netSalary), 0),
        draft: payrolls.filter((p: any) => p.status === 'DRAFT').length,
        processed: payrolls.filter((p: any) => p.status === 'PROCESSED').length,
        paid: payrolls.filter((p: any) => p.status === 'PAID').length
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <DollarSign size={28} style={{ marginRight: 12 }} />
                    <Typography variant="h4">Payroll Management</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Send size={18} />}
                    onClick={handleBulkGenerate}
                >
                    Generate Payroll
                </Button>
            </Box>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Total Payroll</Typography>
                            <Typography variant="h4">₹{stats.total.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Draft</Typography>
                            <Typography variant="h4">{stats.draft}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'info.light' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Processed</Typography>
                            <Typography variant="h4">{stats.processed}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Paid</Typography>
                            <Typography variant="h4">{stats.paid}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Month"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                        >
                            {months.map((month, index) => (
                                <MenuItem key={index} value={index + 1}>{month}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Year"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                        >
                            {[2024, 2025, 2026].map((year) => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="DRAFT">Draft</MenuItem>
                            <MenuItem value="PROCESSED">Processed</MenuItem>
                            <MenuItem value="PAID">Paid</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell align="right">Base Salary</TableCell>
                            <TableCell align="right">Allowances</TableCell>
                            <TableCell align="right">Deductions</TableCell>
                            <TableCell align="right">Net Salary</TableCell>
                            <TableCell>Days (P/L)</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payrolls.map((payroll: any) => (
                            <TableRow key={payroll.id} hover>
                                <TableCell>
                                    {payroll.employee.firstName} {payroll.employee.lastName}
                                </TableCell>
                                <TableCell>{payroll.employee.employeeCode}</TableCell>
                                <TableCell align="right">₹{Number(payroll.baseSalary).toLocaleString()}</TableCell>
                                <TableCell align="right">₹{Number(payroll.allowances).toLocaleString()}</TableCell>
                                <TableCell align="right">₹{Number(payroll.deductions).toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    ₹{Number(payroll.netSalary).toLocaleString()}
                                </TableCell>
                                <TableCell>{payroll.presentDays}/{payroll.leaveDays}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={payroll.status}
                                        color={getStatusColor(payroll.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {payroll.status === 'DRAFT' && (
                                        <Button
                                            size="small"
                                            onClick={() => handleProcessPayroll(payroll.id)}
                                        >
                                            Process
                                        </Button>
                                    )}
                                    {payroll.status === 'PROCESSED' && (
                                        <Button
                                            size="small"
                                            color="success"
                                            onClick={() => handleMarkAsPaid(payroll.id)}
                                        >
                                            Mark Paid
                                        </Button>
                                    )}
                                    {payroll.status === 'PAID' && (
                                        <Button size="small" startIcon={<Download size={14} />}>
                                            Payslip
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {payrolls.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <Box p={3}>
                                        <Typography color="textSecondary">No payroll records found</Typography>
                                        <Button
                                            variant="outlined"
                                            sx={{ mt: 2 }}
                                            onClick={handleBulkGenerate}
                                        >
                                            Generate Payroll for {months[filters.month - 1]} {filters.year}
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PayrollManagementPage;
