import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Tabs,
    Tab,
    MenuItem,
    Alert,
    Snackbar,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '../utils/api';
import { useQuery } from '@tanstack/react-query';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

interface CostingEntryProps {
    userRole?: string; // Optional now
    username?: string;
    onSuccess?: () => void;
    initialTab?: number;
}

const CostingEntry: React.FC<CostingEntryProps> = ({ onSuccess, initialTab = 0, username }) => {
    const [tabValue, setTabValue] = useState(initialTab || 0);

    // Sync tab with prop if it changes and matches context
    useEffect(() => {
        if (typeof initialTab === 'number') {
            setTabValue(initialTab);
        }
    }, [initialTab]);

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info',
    });

    // Fetch Production Data for Auto-Calculation

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [packagingDate, setPackagingDate] = useState(date);

    // Sync packaging date when global date changes (reset)
    useEffect(() => {
        setPackagingDate(date);
    }, [date]);

    const { data: productionData } = useQuery({
        queryKey: ['production', packagingDate],
        queryFn: async () => {
            try {
                const res = await api.get('/production'); // Assuming API returns all recent production
                // Filter client side OR use dedicated endpoint if available
                const entry = res.data.find((p: any) => {
                    // Handle ISO date string comparison
                    const pDate = new Date(p.date).toISOString().split('T')[0];
                    return pDate === packagingDate;
                });
                return entry || { totalProduced: 0 };
            } catch (err) {
                return { totalProduced: 0 };
            }
        },
    });

    // EB State
    const [ebData, setEbData] = useState({
        unitsConsumed: '',
        ratePerUnit: '10', // Default
        noOfShifts: '1',
    });

    // Employee State
    const [employeeData, setEmployeeData] = useState({
        workers: '',
        workerRate: '',
        noOfShifts: '1',
        overtime: '',
    });

    // Packaging State
    const [packagingData, setPackagingData] = useState({
        rate: '1.6', // Default
    });

    // Maintenance State
    const [maintenanceData, setMaintenanceData] = useState({
        description: '',
        totalCost: '',
        ratePerKg: '4', // Default
    });

    // Expense State
    const [expenseData, setExpenseData] = useState({
        title: '',
        amount: '',
        description: '',
        type: 'Asset',
    });



    // Fetch all entries for checking existing
    const { data: entries, refetch: refetchEntries } = useQuery({
        queryKey: ['costingEntries'], // Should this be date specific? Currently fetching all. Ideally filter by date.
        queryFn: async () => {
            const response = await api.get('/costing/entries');
            return response.data;
        },
    });

    const existingEB = entries?.find((e: any) => e.date === date && e.category === 'EB (Electricity)');
    const existingEmployee = entries?.find((e: any) => e.date === date && e.category === 'Employee');
    const existingPackaging = entries?.find((e: any) => e.date === date && e.category === 'Packaging');
    const existingMaintenance = entries?.find((e: any) => e.date === date && e.category === 'Maintenance');

    // Load rates from localStorage on mount
    useEffect(() => {
        const savedEB = localStorage.getItem('ebRate') || '10';
        const savedPkg = localStorage.getItem('packageRate') || '1.6';
        const savedMaint = localStorage.getItem('maintenanceRate') || '4';

        if (!existingEB) setEbData(prev => ({ ...prev, ratePerUnit: savedEB }));
        if (!existingPackaging) setPackagingData(prev => ({ ...prev, rate: savedPkg }));
        if (!existingMaintenance) setMaintenanceData(prev => ({ ...prev, ratePerKg: savedMaint }));
    }, [existingEB, existingPackaging, existingMaintenance]);

    // Populate Forms if Entry Exists
    useEffect(() => {
        if (existingEB) {
            setEbData({
                unitsConsumed: existingEB.unitsConsumed,
                ratePerUnit: existingEB.ratePerUnit,
                noOfShifts: existingEB.noOfShifts || '1',
            });
        }
    }, [existingEB]);

    useEffect(() => {
        if (existingEmployee) {
            setEmployeeData({
                workers: existingEmployee.workers,
                workerRate: existingEmployee.workerRate || '',
                noOfShifts: existingEmployee.noOfShifts || '1',
                overtime: existingEmployee.overtime || '',
            });
        } else {
            setEmployeeData({ workers: '', workerRate: '', noOfShifts: '1', overtime: '' });
        }
    }, [existingEmployee]);

    useEffect(() => {
        if (existingPackaging) {
            setPackagingData({ rate: existingPackaging.ratePerKg || '1.6' });
        }
    }, [existingPackaging]);

    useEffect(() => {
        if (existingMaintenance) {
            setMaintenanceData({
                description: existingMaintenance.description || '',
                totalCost: existingMaintenance.totalCost || '',
                ratePerKg: existingMaintenance.ratePerKg || '4',
            });
        }
    }, [existingMaintenance]);



    // Handlers
    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await api.delete(`/costing/${id}`);
            setNotification({ open: true, message: 'Deleted', severity: 'success' });
            refetchEntries();
        } catch (error) {
            setNotification({ open: true, message: 'Failed to delete', severity: 'error' });
        }
    };

    const handleEBSubmit = async () => {
        const units = parseFloat(ebData.unitsConsumed);
        const rate = parseFloat(ebData.ratePerUnit);
        if (units <= 0 || rate <= 0) {
            setNotification({ open: true, message: 'Invalid values', severity: 'error' });
            return;
        }
        try {
            const totalCost = units * rate;
            const payload = { date, ...ebData, totalCost, createdBy: username };
            if (existingEB) await api.put(`/costing/${existingEB.id}`, payload);
            else await api.post('/costing/eb', payload);
            setNotification({ open: true, message: 'EB Saved', severity: 'success' });
            if (onSuccess) onSuccess();
            refetchEntries();
        } catch (error) {
            setNotification({ open: true, message: 'Failed to save', severity: 'error' });
        }
    };

    const handleEmployeeSubmit = async () => {
        // Logic same as before
        try {
            const workers = parseFloat(employeeData.workers) || 0;
            const rate = parseFloat(employeeData.workerRate) || 0;
            if (workers <= 0 || rate <= 0) {
                setNotification({ open: true, message: 'Invalid values', severity: 'error' });
                return;
            }
            const cost = (workers * rate) + (parseFloat(employeeData.overtime) || 0);
            const payload = { date, ...employeeData, totalCost: cost, createdBy: username };
            if (existingEmployee) await api.put(`/costing/${existingEmployee.id}`, payload);
            else await api.post('/costing/employee', payload);
            setNotification({ open: true, message: 'Employee Saved', severity: 'success' });
            if (onSuccess) onSuccess();
            refetchEntries();
        } catch (error) { setNotification({ open: true, message: 'Failed', severity: 'error' }); }
    };

    const handlePackagingSubmit = async () => {
        const yarnKg = productionData?.totalProduced || 0;
        const rate = parseFloat(packagingData.rate);
        if (yarnKg <= 0) {
            setNotification({ open: true, message: 'No yarn production for this date', severity: 'warning' });
            return;
        }
        try {
            const cost = yarnKg * rate;
            const payload = { date, yarnProduced: yarnKg, ratePerKg: rate, totalCost: cost, createdBy: username };
            if (existingPackaging) await api.put(`/costing/${existingPackaging.id}`, payload);
            else await api.post('/costing/packaging', payload);
            setNotification({ open: true, message: 'Packaging Saved', severity: 'success' });
            if (onSuccess) onSuccess();
            refetchEntries();
        } catch (error) { setNotification({ open: true, message: 'Failed', severity: 'error' }); }
    };

    const handleMaintenanceSubmit = async () => {
        // Logic same as before
        const cost = parseFloat(maintenanceData.totalCost);
        if (isNaN(cost) || cost <= 0) { setNotification({ open: true, message: 'Invalid cost', severity: 'error' }); return; }
        try {
            const payload = { date, description: maintenanceData.description || 'Daily', totalCost: cost, ratePerKg: maintenanceData.ratePerKg, createdBy: username };
            if (existingMaintenance) await api.put(`/costing/${existingMaintenance.id}`, payload);
            else await api.post('/costing/maintenance', payload);
            setNotification({ open: true, message: 'Maintenance Saved', severity: 'success' });
            if (onSuccess) onSuccess();
            refetchEntries();
        } catch (error) { setNotification({ open: true, message: 'Failed', severity: 'error' }); }
    };

    const handleExpenseSubmit = async () => {
        if (!expenseData.title || parseFloat(expenseData.amount) <= 0) return;
        try {
            await api.post('/costing/expense', { date, ...expenseData, createdBy: username });
            setNotification({ open: true, message: 'Expense Saved', severity: 'success' });
            setExpenseData({ title: '', amount: '', description: '', type: 'Asset' });
            if (onSuccess) onSuccess();
        } catch (error) { setNotification({ open: true, message: 'Failed', severity: 'error' }); }
    };

    // UI Calcs
    const ebTotal = (parseFloat(ebData.unitsConsumed) || 0) * (parseFloat(ebData.ratePerUnit) || 0);
    const yarnProduction = productionData?.totalProduced || 0;
    const packageCost = yarnProduction * (parseFloat(packagingData.rate) || 0); // Dynamic calc
    const maintenanceFormulaCost = yarnProduction * (parseFloat(maintenanceData.ratePerKg) || 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <TextField
                    type="date"
                    size="small"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 150 }}
                />
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                    <Tab label="EB (Electricity)" />
                    <Tab label="Employee Costs" />
                    <Tab label="Packaging" />
                    <Tab label="Maintenance" />
                    <Tab label="Expenses" />
                </Tabs>

                {/* EB Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {existingEB && <Alert severity="info">Entry exists. You can edit.</Alert>}
                        <TextField
                            label="Units Consumed (kWh)"
                            type="number"
                            value={ebData.unitsConsumed}
                            onChange={(e) => setEbData({ ...ebData, unitsConsumed: e.target.value })}
                        />
                        <TextField
                            label="Rate per Unit (₹)"
                            type="number"
                            value={ebData.ratePerUnit}
                            onChange={(e) => setEbData({ ...ebData, ratePerUnit: e.target.value })}
                        />
                        <TextField
                            label="No of Shifts"
                            type="number"
                            value={ebData.noOfShifts}
                            onChange={(e) => setEbData({ ...ebData, noOfShifts: e.target.value })}
                        />
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="h6" align="center">Total: ₹{ebTotal.toFixed(2)}</Typography>
                        </Paper>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={handleEBSubmit}>{existingEB ? 'Update' : 'Save'}</Button>
                            {existingEB && <Button color="error" variant="outlined" onClick={() => handleDelete(existingEB.id)}>Delete</Button>}
                        </Box>
                    </Box>
                </TabPanel>

                {/* Employee Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {existingEmployee && <Alert severity="info">Entry exists.</Alert>}
                        <TextField label="No of Shifts" type="number" value={employeeData.noOfShifts} onChange={(e) => setEmployeeData({ ...employeeData, noOfShifts: e.target.value })} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Workers" type="number" fullWidth value={employeeData.workers} onChange={(e) => setEmployeeData({ ...employeeData, workers: e.target.value })} />
                            <TextField label="Rate (₹/day)" type="number" fullWidth value={employeeData.workerRate} onChange={(e) => setEmployeeData({ ...employeeData, workerRate: e.target.value })} />
                        </Box>
                        <TextField label="Overtime Cost (₹)" type="number" value={employeeData.overtime} onChange={(e) => setEmployeeData({ ...employeeData, overtime: e.target.value })} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={handleEmployeeSubmit}>{existingEmployee ? 'Update' : 'Save'}</Button>
                            {existingEmployee && <Button color="error" variant="outlined" onClick={() => handleDelete(existingEmployee.id)}>Delete</Button>}
                        </Box>
                    </Box>
                </TabPanel>

                {/* Packaging Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                        {existingPackaging && <Alert severity="info" sx={{ mb: 2 }}>Entry exists.</Alert>}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                            <Paper sx={{ p: 2 }}>
                                <TextField
                                    label="Production Date"
                                    type="date"
                                    size="small"
                                    value={packagingDate}
                                    onChange={(e) => setPackagingDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                                <Typography color="text.secondary" variant="caption">Total Yarn Produced</Typography>
                                <Typography variant="h6" fontWeight="bold">{yarnProduction} kg</Typography>
                            </Paper>
                            <Paper sx={{ p: 2 }}>
                                <TextField
                                    label="Package Rate (₹/kg)"
                                    type="number"
                                    value={packagingData.rate}
                                    onChange={(e) => setPackagingData({ ...packagingData, rate: e.target.value })}
                                    fullWidth
                                    variant="outlined"
                                    inputProps={{ style: { textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' } }}
                                />
                            </Paper>
                        </Box>
                        <Typography variant="h4" color="primary" sx={{ mb: 3 }}>₹{packageCost.toFixed(2)}</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={handlePackagingSubmit}>{existingPackaging ? 'Update' : 'Confirm'}</Button>
                            {existingPackaging && <Button color="error" variant="outlined" onClick={() => handleDelete(existingPackaging.id)}>Delete</Button>}
                        </Box>
                    </Box>
                </TabPanel>

                {/* Maintenance Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {existingMaintenance && <Alert severity="info">Entry exists.</Alert>}

                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                <TextField
                                    label="Production Date"
                                    type="date"
                                    size="small"
                                    value={packagingDate}
                                    onChange={(e) => setPackagingDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ width: 150 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Typography fontWeight="bold">{yarnProduction} kg</Typography>
                                <Typography variant="body2" color="text.secondary">×</Typography>
                                <Typography fontWeight="bold">₹{maintenanceData.ratePerKg}</Typography>
                                <Typography variant="body2" color="text.secondary">=</Typography>
                                <Typography fontWeight="bold" color="primary">₹{maintenanceFormulaCost.toFixed(2)}</Typography>
                            </Box>
                        </Paper>

                        <TextField label="Rate (₹/kg)" type="number" value={maintenanceData.ratePerKg} onChange={(e) => setMaintenanceData({ ...maintenanceData, ratePerKg: e.target.value })} />
                        <TextField label="Description" value={maintenanceData.description} onChange={(e) => setMaintenanceData({ ...maintenanceData, description: e.target.value })} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField label="Total Cost" type="number" fullWidth value={maintenanceData.totalCost} onChange={(e) => setMaintenanceData({ ...maintenanceData, totalCost: e.target.value })} />
                            <Button variant="outlined" onClick={() => setMaintenanceData({ ...maintenanceData, totalCost: maintenanceFormulaCost.toFixed(2) })}>Apply Formula</Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={handleMaintenanceSubmit}>{existingMaintenance ? 'Update' : 'Save'}</Button>
                            {existingMaintenance && <Button color="error" variant="outlined" onClick={() => handleDelete(existingMaintenance.id)}>Delete</Button>}
                        </Box>
                    </Box>
                </TabPanel>

                {/* Expense Tab */}
                <TabPanel value={tabValue} index={4}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Title" value={expenseData.title} onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })} />
                        <TextField select label="Type" value={expenseData.type} onChange={(e) => setExpenseData({ ...expenseData, type: e.target.value })}>
                            <MenuItem value="Asset">Asset</MenuItem>
                            <MenuItem value="Others">Others</MenuItem>
                        </TextField>
                        <TextField label="Amount" type="number" value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })} />
                        <TextField label="Description" multiline rows={3} value={expenseData.description} onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })} />
                        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleExpenseSubmit}>Save Expense</Button>
                    </Box>
                </TabPanel>
            </Paper>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default CostingEntry;
