import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    IconButton,
    Tabs,
    Tab,
    LinearProgress
} from '@mui/material';
import {
    Add as AddIcon,
    AttachMoney as DollarIcon,
    Receipt as BillIcon,
    Description as FileIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, color, prefix = '' }: any) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color: color || 'text.primary', fontWeight: 'bold' }}>
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
        </CardContent>
    </Card>
);

const AccountsPayablePage: React.FC = () => {
    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // Overview State
    const [stats, setStats] = useState<any>({
        totalOutstanding: 0,
        overdueAmount: 0,
        dueThisWeek: 0,
        billCount: 0
    });
    const [bills, setBills] = useState<any[]>([]);

    // Expenses State
    const [expenses, setExpenses] = useState<any[]>([]);

    // Budgets State
    const [budgets, setBudgets] = useState<any[]>([]);
    const [budgetVsActual, setBudgetVsActual] = useState<any[]>([]);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [budgetForm, setBudgetForm] = useState({ category: '', amount: '', periodKey: new Date().toISOString().slice(0, 7) });

    // Bill Modal State
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [billForm, setBillForm] = useState({
        supplierId: '',
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        totalAmount: '',
        notes: ''
    });

    useEffect(() => {
        loadOverviewData();
        loadSuppliers();
    }, []);

    useEffect(() => {
        if (tabIndex === 1) loadExpenses();
        if (tabIndex === 2) loadBudgetData();
    }, [tabIndex]);

    const loadOverviewData = async () => {
        setLoading(true);
        try {
            const { data } = await http.get('/ap/outstanding');
            const invoices = data.invoices || [];
            const totalOutstanding = data.totalOutstanding || 0;
            const overdueAmount = invoices.reduce((sum: number, inv: any) => {
                const isOverdue = new Date(inv.dueDate) < new Date() && inv.status !== 'PAID';
                return isOverdue ? sum + Number(inv.totalAmount) : sum;
            }, 0);

            const startOfWeek = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(endOfWeek.getDate() + 7);
            const dueThisWeek = invoices.reduce((sum: number, inv: any) => {
                const dueDate = new Date(inv.dueDate);
                return (dueDate >= startOfWeek && dueDate <= endOfWeek && inv.status !== 'PAID')
                    ? sum + Number(inv.totalAmount) : sum;
            }, 0);

            setStats({ totalOutstanding, overdueAmount, dueThisWeek, billCount: data.count || 0 });
            setBills(invoices);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const { data } = await http.get('/suppliers');
            setSuppliers(data.suppliers || []);
        } catch (error) {
            console.error('Failed to load suppliers');
        }
    };

    const loadExpenses = async () => {
        try {
            const { data } = await http.get('/ap/expenses');
            setExpenses(data);
        } catch (error) {
            notify.showError('Failed to load expenses');
        }
    };

    const loadBudgetData = async () => {
        try {
            const period = new Date().toISOString().slice(0, 7); // Current Month YYYY-MM
            const [budgetsRes, comparisonRes] = await Promise.all([
                http.get(`/ap/budgets?period=${period}`),
                http.get(`/ap/budgets/vs-actual?period=${period}`)
            ]);
            setBudgets(budgetsRes.data);
            setBudgetVsActual(comparisonRes.data);
        } catch (error) {
            notify.showError('Failed to load budget data');
        }
    };

    const handleRecordBill = async () => {
        try {
            await http.post('/ap/bills', {
                ...billForm,
                date: new Date(billForm.date).toISOString(),
                dueDate: new Date(billForm.dueDate).toISOString(),
                totalAmount: Number(billForm.totalAmount)
            });
            notify.showSuccess('Bill recorded successfully');
            setIsBillModalOpen(false);
            setBillForm({ supplierId: '', invoiceNumber: '', date: '', dueDate: '', totalAmount: '', notes: '' });
            loadOverviewData();
        } catch (error) {
            notify.showError('Failed to record bill');
        }
    };

    const handleUpdateExpenseStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await http.patch(`/ap/expenses/${id}/status`, { status });
            notify.showSuccess(`Expense ${status.toLowerCase()}`);
            loadExpenses();
        } catch (error) {
            notify.showError('Failed to update status');
        }
    };

    const handleSaveBudget = async () => {
        try {
            await http.post('/ap/budgets', {
                ...budgetForm,
                amount: Number(budgetForm.amount)
            });
            notify.showSuccess('Budget saved');
            setIsBudgetModalOpen(false);
            loadBudgetData();
        } catch (error) {
            notify.showError('Failed to save budget');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Accounts Payable</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<FileIcon />} onClick={() => setTabIndex(1)}>Manage Expenses</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsBillModalOpen(true)}>Record Bill</Button>
                </Stack>
            </Box>

            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Overview" />
                <Tab label="Expenses" />
                <Tab label="Budgets & Reports" />
            </Tabs>

            {/* OVERVIEW TAB */}
            {tabIndex === 0 && (
                <Box>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Total Outstanding" value={stats.totalOutstanding} prefix="₹" color="error.main" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Overdue Bills" value={stats.overdueAmount} prefix="₹" color="error.main" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Due This Week" value={stats.dueThisWeek} prefix="₹" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Open Bills Count" value={stats.billCount} />
                        </Grid>
                    </Grid>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Outstanding Bills</Typography>
                            <TableContainer component={Paper} elevation={0} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Bill #</TableCell>
                                            <TableCell>Supplier</TableCell>
                                            <TableCell>Due Date</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bills.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>{row.invoiceNumber}</TableCell>
                                                <TableCell onClick={() => navigate(`/finance/ap/ledger/${row.supplier.id}`)} sx={{ cursor: 'pointer', color: 'primary.main' }}>
                                                    {row.supplier?.name}
                                                </TableCell>
                                                <TableCell>{new Date(row.dueDate).toLocaleDateString()}</TableCell>
                                                <TableCell align="right">₹{Number(row.totalAmount).toLocaleString()}</TableCell>
                                                <TableCell><Chip label={row.status} size="small" /></TableCell>
                                                <TableCell>
                                                    <Button size="small" onClick={() => navigate(`/finance/ap/ledger/${row.supplier.id}`)}>Pay</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* EXPENSES TAB */}
            {tabIndex === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Expense Management</Typography>
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {expenses.map((exp) => (
                                        <TableRow key={exp.id}>
                                            <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{exp.category}</TableCell>
                                            <TableCell>{exp.description}</TableCell>
                                            <TableCell align="right">₹{Number(exp.amount).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={exp.status}
                                                    color={exp.status === 'APPROVED' ? 'success' : exp.status === 'REJECTED' ? 'error' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {exp.status === 'PENDING' && (
                                                    <Stack direction="row" spacing={1}>
                                                        <IconButton color="success" size="small" onClick={() => handleUpdateExpenseStatus(exp.id, 'APPROVED')}>
                                                            <CheckIcon />
                                                        </IconButton>
                                                        <IconButton color="error" size="small" onClick={() => handleUpdateExpenseStatus(exp.id, 'REJECTED')}>
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </Stack>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {expenses.length === 0 && <TableRow><TableCell colSpan={6} align="center">No expenses found</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* BUDGETS TAB */}
            {tabIndex === 2 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button variant="contained" onClick={() => setIsBudgetModalOpen(true)}>Set Budget</Button>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: 400 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography variant="h6" gutterBottom>Budget vs Actual (Current Month)</Typography>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <BarChart data={budgetVsActual}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="category" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                                            <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Budget Utilization</Typography>
                                    <Stack spacing={2}>
                                        {budgetVsActual.map((item) => (
                                            <Box key={item.category}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">{item.category}</Typography>
                                                    <Typography variant="body2">{item.percentUsed.toFixed(0)}%</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(item.percentUsed, 100)}
                                                    color={item.percentUsed > 100 ? 'error' : item.percentUsed > 80 ? 'warning' : 'primary'}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Bill Modal */}
            <Dialog open={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Record New Bill</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField select label="Supplier" fullWidth value={billForm.supplierId} onChange={(e) => setBillForm({ ...billForm, supplierId: e.target.value })}>
                            {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </TextField>
                        <TextField label="Invoice #" fullWidth value={billForm.invoiceNumber} onChange={(e) => setBillForm({ ...billForm, invoiceNumber: e.target.value })} />
                        <Stack direction="row" spacing={2}>
                            <TextField type="date" label="Date" fullWidth InputLabelProps={{ shrink: true }} value={billForm.date} onChange={(e) => setBillForm({ ...billForm, date: e.target.value })} />
                            <TextField type="date" label="Due Date" fullWidth InputLabelProps={{ shrink: true }} value={billForm.dueDate} onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })} />
                        </Stack>
                        <TextField label="Amount" type="number" fullWidth value={billForm.totalAmount} onChange={(e) => setBillForm({ ...billForm, totalAmount: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsBillModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRecordBill}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Budget Modal */}
            <Dialog open={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Set Budget</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField label="Category" fullWidth value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} />
                        <TextField label="Amount" type="number" fullWidth value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })} />
                        <TextField label="Month (YYYY-MM)" fullWidth value={budgetForm.periodKey} onChange={(e) => setBudgetForm({ ...budgetForm, periodKey: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsBudgetModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveBudget}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AccountsPayablePage;
