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
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '../utils/api';
import { useQuery } from '@tanstack/react-query';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_TITLES, CONFIRM_MESSAGES, formatApiError } from '../utils/messages';

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
    onItemSaved?: () => void;
    initialTab?: number;
    initialDate?: string;
}

const CostingEntry: React.FC<CostingEntryProps> = ({ onSuccess, onItemSaved, initialTab = 0, username, initialDate }) => {
    const [tabValue, setTabValue] = useState(initialTab || 0);

    // Sync tab with prop if it changes and matches context
    useEffect(() => {
        if (typeof initialTab === 'number') {
            setTabValue(initialTab);
        }
    }, [initialTab]);

    const { confirm: confirmDialog } = useConfirm();

    // Fetch Production Data for Auto-Calculation

    const [date, setDate] = useState(initialDate || new Date().toLocaleDateString('en-CA'));
    const [packagingDate, setPackagingDate] = useState(date);

    // Sync date and packaging date when initialDate prop changes
    useEffect(() => {
        if (initialDate) {
            setDate(initialDate);
        } else {
            // If initialDate is cleared, reset to current date
            setDate(new Date().toLocaleDateString('en-CA'));
        }
    }, [initialDate]);

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

    const existingEB = entries?.find((e: any) => new Date(e.date).toISOString().split('T')[0] === date && e.category === 'EB (Electricity)');
    const existingEmployee = entries?.find((e: any) => new Date(e.date).toISOString().split('T')[0] === date && e.category === 'Employee');
    const existingPackaging = entries?.find((e: any) => new Date(e.date).toISOString().split('T')[0] === date && e.category === 'Packaging');
    const existingMaintenance = entries?.find((e: any) => new Date(e.date).toISOString().split('T')[0] === date && e.category === 'Maintenance');

    // Fetch System Settings for default rates
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data;
        }
    });

    // Populate default rates from settings when data is available
    useEffect(() => {
        if (settings) {
            const savedEB = settings.ebRate || '10';
            const savedPkg = settings.packageRate || '1.6';
            const savedMaint = settings.maintenanceRate || '4';

            if (!existingEB) setEbData(prev => ({ ...prev, ratePerUnit: savedEB }));
            if (!existingPackaging) setPackagingData(prev => ({ ...prev, rate: savedPkg }));
            if (!existingMaintenance) setMaintenanceData(prev => ({ ...prev, ratePerKg: savedMaint }));
        }
    }, [settings, existingEB, existingPackaging, existingMaintenance]);

    // Populate Forms if Entry Exists
    useEffect(() => {
        if (existingEB) {
            setEbData({
                unitsConsumed: existingEB.unitsConsumed,
                ratePerUnit: existingEB.ratePerUnit,
                noOfShifts: existingEB.noOfShifts || '1',
            });
        } else {
            setEbData(prev => ({
                ...prev,
                unitsConsumed: '',
                noOfShifts: '1',
                // Keep ratePerUnit from settings if possible
                ratePerUnit: settings?.ebRate || '10'
            }));
        }
    }, [existingEB, settings]);

    useEffect(() => {
        if (existingEmployee) {
            setEmployeeData({
                workers: existingEmployee.workers,
                workerRate: existingEmployee.rate || '', // DB field name is 'rate'
                noOfShifts: existingEmployee.noOfShifts || '1',
                overtime: existingEmployee.overtime || '',
            });
        } else {
            setEmployeeData({
                workers: '',
                workerRate: settings?.workerRate || '',
                noOfShifts: '1',
                overtime: ''
            });
        }
    }, [existingEmployee, settings]);

    useEffect(() => {
        if (existingPackaging) {
            setPackagingData({ rate: existingPackaging.ratePerKg || '1.6' });
        } else {
            setPackagingData({ rate: settings?.packageRate || '1.6' });
        }
    }, [existingPackaging, settings]);

    useEffect(() => {
        if (existingMaintenance) {
            setMaintenanceData({
                description: existingMaintenance.description || '',
                totalCost: existingMaintenance.totalCost || '',
                ratePerKg: existingMaintenance.ratePerKg || '4',
            });
        } else {
            setMaintenanceData({
                description: '',
                totalCost: '',
                ratePerKg: settings?.maintenanceRate || '4',
            });
        }
    }, [existingMaintenance, settings]);

    // Handlers
    const handleDelete = async (id: string) => {
        if (!await confirmDialog({ title: 'Delete Cost Entry', message: 'Are you sure you want to remove this cost entry?', severity: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) return;
        try {
            await api.delete(`/costing/${id}`);
            toast.success(SUCCESS_MESSAGES.DELETE);
            refetchEntries();
        } catch (error) {
            toast.error(ERROR_MESSAGES.DELETE_FAILED);
        }
    };

    const handleEBSubmit = async () => {
        const units = parseFloat(ebData.unitsConsumed);
        const rate = parseFloat(ebData.ratePerUnit);
        if (isNaN(units) || units <= 0) {
            toast.error(ERROR_MESSAGES.INVALID_NUMBER);
            return;
        }
        if (isNaN(rate) || rate <= 0) {
            toast.error(ERROR_MESSAGES.INVALID_NUMBER);
            return;
        }
        try {
            const totalCost = units * rate * (parseFloat(ebData.noOfShifts) || 1);
            const payload = { date, category: 'EB (Electricity)', ...ebData, totalCost, createdBy: username };
            if (existingEB) await api.put(`/costing/${existingEB.id}`, payload);
            else await api.post('/costing/eb', payload);
            toast.success(SUCCESS_MESSAGES.COSTING_SAVED);
            if (onItemSaved) onItemSaved();
            refetchEntries();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        }
    };

    const handleEmployeeSubmit = async () => {
        try {
            const workers = parseFloat(employeeData.workers) || 0;
            const rate = parseFloat(employeeData.workerRate) || 0;
            if (workers <= 0) {
                toast.error(ERROR_MESSAGES.REQUIRED_FIELD('Workers'));
                return;
            }
            if (rate <= 0) {
                toast.error(ERROR_MESSAGES.REQUIRED_FIELD('Rate'));
                return;
            }
            const shifts = parseFloat(employeeData.noOfShifts) || 1;
            const cost = (workers * rate * shifts) + (parseFloat(employeeData.overtime) || 0);
            const payload = {
                date,
                category: 'Employee',
                ...employeeData,
                rate: rate, // Map frontend workerRate to backend 'rate' field
                totalCost: cost,
                createdBy: username
            };
            if (existingEmployee) await api.put(`/costing/${existingEmployee.id}`, payload);
            else await api.post('/costing/employee', payload);
            toast.success(SUCCESS_MESSAGES.COSTING_SAVED);
            if (onItemSaved) onItemSaved();
            refetchEntries();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        }
    };

    const handlePackagingSubmit = async () => {
        const yarnKg = productionData?.totalProduced || 0;
        const rate = parseFloat(packagingData.rate);
        if (yarnKg <= 0) {
            toast.warning('No production records found for the selected date. Packaging costs cannot be calculated without production data.');
            return;
        }
        if (isNaN(rate) || rate <= 0) {
            toast.error(ERROR_MESSAGES.INVALID_NUMBER);
            return;
        }
        try {
            const cost = yarnKg * rate;
            const payload = { date, category: 'Packaging', yarnProduced: yarnKg, ratePerKg: rate, totalCost: cost, createdBy: username };
            if (existingPackaging) await api.put(`/costing/${existingPackaging.id}`, payload);
            else await api.post('/costing/packaging', payload);
            toast.success(SUCCESS_MESSAGES.COSTING_SAVED);
            if (onItemSaved) onItemSaved();
            refetchEntries();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        }
    };

    const handleMaintenanceSubmit = async () => {
        if (yarnProduction <= 0) {
            toast.warning('No production records found for the selected date. Maintenance costs cannot be calculated without production data.');
            return;
        }

        const cost = parseFloat(maintenanceData.totalCost);
        if (isNaN(cost) || cost <= 0) {
            toast.error(ERROR_MESSAGES.INVALID_NUMBER);
            return;
        }
        try {
            const payload = { date, category: 'Maintenance', description: maintenanceData.description || 'Daily Maintenance', totalCost: cost, ratePerKg: maintenanceData.ratePerKg, createdBy: username };
            if (existingMaintenance) await api.put(`/costing/${existingMaintenance.id}`, payload);
            else await api.post('/costing/maintenance', payload);
            toast.success(SUCCESS_MESSAGES.COSTING_SAVED);
            if (onItemSaved) onItemSaved();
            refetchEntries();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        }
    };

    const handleExpenseSubmit = async () => {
        if (!expenseData.title) {
            toast.error(ERROR_MESSAGES.REQUIRED_FIELD('Title'));
            return;
        }
        if (parseFloat(expenseData.amount) <= 0 || isNaN(parseFloat(expenseData.amount))) {
            toast.error(ERROR_MESSAGES.INVALID_NUMBER);
            return;
        }
        try {
            await api.post('/costing/expense', { date, ...expenseData, createdBy: username });
            toast.success(SUCCESS_MESSAGES.COSTING_SAVED);
            setExpenseData({ title: '', amount: '', description: '', type: 'Asset' });
            if (onItemSaved) onItemSaved();
            refetchEntries();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        }
    };

    // UI Calcs
    const ebTotal = (parseFloat(ebData.unitsConsumed) || 0) * (parseFloat(ebData.ratePerUnit) || 0) * (parseFloat(ebData.noOfShifts) || 1);
    const employeeTotal = ((parseFloat(employeeData.workers) || 0) * (parseFloat(employeeData.workerRate) || 0) * (parseFloat(employeeData.noOfShifts) || 1)) + (parseFloat(employeeData.overtime) || 0);
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
                        </Box>
                    </Box>
                </TabPanel>

                {/* Employee Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {existingEmployee && <Alert severity="info">Entry exists.</Alert>}
                        <TextField
                            select
                            label="No of Shifts"
                            value={employeeData.noOfShifts}
                            onChange={(e) => setEmployeeData({ ...employeeData, noOfShifts: e.target.value })}
                        >
                            <MenuItem value="1">1</MenuItem>
                            <MenuItem value="2">2</MenuItem>
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Workers" type="number" fullWidth value={employeeData.workers} onChange={(e) => setEmployeeData({ ...employeeData, workers: e.target.value })} />
                            <TextField label="Rate (₹/day)" type="number" fullWidth value={employeeData.workerRate} onChange={(e) => setEmployeeData({ ...employeeData, workerRate: e.target.value })} />
                        </Box>
                        <TextField label="Overtime Cost (₹)" type="number" value={employeeData.overtime} onChange={(e) => setEmployeeData({ ...employeeData, overtime: e.target.value })} />
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="h6" align="center">Total: ₹{employeeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                        </Paper>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={handleEmployeeSubmit}>{existingEmployee ? 'Update' : 'Save'}</Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Packaging Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                        {existingPackaging && <Alert severity="info" sx={{ mb: 2 }}>This entry already exists and can be updated.</Alert>}
                        {yarnProduction <= 0 && (
                            <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                                No production data found for this date. Please ensure production entries are recorded before calculating packaging costs.
                            </Alert>
                        )}
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
                        </Box>
                    </Box>
                </TabPanel>

                {/* Maintenance Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {existingMaintenance && <Alert severity="info" sx={{ mb: 2 }}>This entry already exists and can be updated.</Alert>}
                        {yarnProduction <= 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                No production data found for this date. formula-based maintenance costs cannot be auto-calculated.
                            </Alert>
                        )}

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

        </Box>
    );
};

export default CostingEntry;
