import React, { useState } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    LinearProgress,
} from '@mui/material';
import {
    People as CustomersIcon,
    Business as VendorsIcon,
    Timeline as TimelineIcon,
    Link as PaymentLinkIcon,
    MenuBook as JournalsIcon,
    AccountBalance as BankIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { usePersist } from '../hooks/usePersist';
import { toast } from 'sonner';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
} from '@mui/material';
import Timelines from '../components/payments/Timelines';
import PaymentLinks from '../components/payments/PaymentLinks';
import Journals from '../components/payments/Journals';
import BankReconciliation from '../components/payments/BankReconciliation';

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
        {value === index && children}
    </Box>
);



const statusColor = (status: string): 'success' | 'error' | 'default' | 'warning' => {
    if (status === 'Active') return 'success';
    if (status === 'Overdue') return 'error';
    if (status === 'Cleared') return 'default';
    return 'warning';
};

const PartyTable = ({ rows }: { rows: any[] }) => (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table>
            <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Balance (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                            No records found.
                        </TableCell>
                    </TableRow>
                )}
                {rows.map((row) => (
                    <TableRow key={row.id} hover>
                        <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {row.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                            </Box>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" color="text.secondary">{row.contact}</Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color={row.balance > 0 ? 'error.main' : 'success.main'}>
                                ₹{(row.balance || 0).toLocaleString('en-IN')}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Chip label={row.status || 'Active'} size="small" color={statusColor(row.status || 'Active')} variant="outlined" />
                        </TableCell>
                        <TableCell>
                            <Button size="small" variant="outlined" disabled>View Ledger</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

// --- TABS CONFIG ---
const PAYMENT_TABS = [
    { label: 'Customers', icon: <CustomersIcon fontSize="small" /> },
    { label: 'Vendors', icon: <VendorsIcon fontSize="small" /> },
    { label: 'Timelines', icon: <TimelineIcon fontSize="small" /> },
    { label: 'Payment Links', icon: <PaymentLinkIcon fontSize="small" /> },
    { label: 'Journals', icon: <JournalsIcon fontSize="small" /> },
    { label: 'Bank Reconciliation', icon: <BankIcon fontSize="small" /> },
];

// --- Main Component ---
const Payments: React.FC = () => {
    const [tab, setTab] = useState(0);
    const { items: customers, add: addCustomer } = usePersist<any>('customers', []);
    const { items: vendors, add: addVendor } = usePersist<any>('vendors', []);
    
    const [openAdd, setOpenAdd] = useState(false);
    const [partyType, setPartyType] = useState<'Customer' | 'Vendor'>('Customer');
    const [form, setForm] = useState({ name: '', contact: '', balance: 0 });

    const handleAddOpen = (type: 'Customer' | 'Vendor') => {
        setPartyType(type);
        setForm({ name: '', contact: '', balance: 0 });
        setOpenAdd(true);
    };

    const handleSaveParty = () => {
        if (!form.name.trim()) { toast.error('Name is required'); return; }
        const data = { ...form, status: 'Active' };
        if (partyType === 'Customer') addCustomer(data);
        else addVendor(data);
        toast.success(`${partyType} added successfully`);
        setOpenAdd(false);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Payments</Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage customers, vendors, payment links, journals, and bank reconciliation.
                </Typography>
            </Box>

            {/* Tab Bar */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 3,
                    overflow: 'hidden',
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50',
                        '& .MuiTab-root': {
                            minHeight: 52,
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            textTransform: 'none',
                        },
                    }}
                >
                    {PAYMENT_TABS.map((t, i) => (
                        <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
                    ))}
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {/* Customers */}
                    <TabPanel value={tab} index={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>Customers</Typography>
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleAddOpen('Customer')}>Add Customer</Button>
                        </Box>
                        <PartyTable rows={customers} />
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <LinearProgress sx={{ flex: 1, height: 6, borderRadius: 3 }} variant="determinate" value={customers.length > 0 ? 100 : 0} color="primary" />
                            <Typography variant="caption" color="text.secondary">{customers.length} Customers</Typography>
                        </Box>
                    </TabPanel>

                    {/* Vendors */}
                    <TabPanel value={tab} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>Vendors</Typography>
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleAddOpen('Vendor')}>Add Vendor</Button>
                        </Box>
                        <PartyTable rows={vendors} />
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <LinearProgress sx={{ flex: 1, height: 6, borderRadius: 3 }} variant="determinate" value={vendors.length > 0 ? 100 : 0} color="secondary" />
                            <Typography variant="caption" color="text.secondary">{vendors.length} Vendors</Typography>
                        </Box>
                    </TabPanel>

                    {/* Timelines */}
                    <TabPanel value={tab} index={2}>
                        <Timelines />
                    </TabPanel>

                    {/* Payment Links */}
                    <TabPanel value={tab} index={3}>
                        <PaymentLinks />
                    </TabPanel>

                    {/* Journals */}
                    <TabPanel value={tab} index={4}>
                        <Journals />
                    </TabPanel>

                    {/* Bank Reconciliation */}
                    <TabPanel value={tab} index={5}>
                        <BankReconciliation />
                    </TabPanel>
                </Box>
            </Paper>

            {/* Add Party Dialog */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Add {partyType}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Name" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Contact Number" fullWidth size="small" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="number" label="Opening Balance (₹)" fullWidth size="small" value={form.balance || ''} onChange={e => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveParty} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Payments;
