import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Chip,
    IconButton,
} from '@mui/material';
import {
    Save as SaveIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../utils/api';
import Logs from './Logs';

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

interface SettingsProps {
    currentUser?: any;
}

const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
    const [tabValue, setTabValue] = useState(0);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    // Company Settings
    const [companySettings, setCompanySettings] = useState({
        companyName: 'Ever Green Yarn Mills',
        address: 'Industrial Area, Coimbatore',
        gstin: '33XXXXX1234X1Z5',
        phone: '+91 98765 43210',
        email: 'info@evergreenyarn.com',
    });

    // System Settings (Removed EB/Packaging rates)
    const [systemSettings, setSystemSettings] = useState({
        autoBackup: true,
        emailNotifications: true,
        lowStockAlert: true,
        lowStockThreshold: '500',
        maintenanceRate: '4',
        ebRate: '10',
        packageRate: '1.6',
    });

    // User Management State
    const [users, setUsers] = useState<any[]>([]);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        role: 'VIEWER',
    });

    const handleSaveCompanySettings = () => {
        setNotification({ open: true, message: 'Company settings saved!', severity: 'success' });
    };

    // Load settings from localStorage on mount (Maintenance only)
    useEffect(() => {
        const savedMaintenanceRate = localStorage.getItem('maintenanceRate');
        const savedEbRate = localStorage.getItem('ebRate');
        const savedPackageRate = localStorage.getItem('packageRate');

        setSystemSettings(prev => ({
            ...prev,
            maintenanceRate: savedMaintenanceRate || '4',
            ebRate: savedEbRate || '10',
            packageRate: savedPackageRate || '1.6',
        }));
    }, []);

    // Fetch users when the component loads or tab changes
    useEffect(() => {
        fetchUsers();
    }, [tabValue]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            console.log('📬 Fetched users from API:', res.data);
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleSaveSystemSettings = () => {
        localStorage.setItem('maintenanceRate', systemSettings.maintenanceRate);
        localStorage.setItem('ebRate', systemSettings.ebRate);
        localStorage.setItem('packageRate', systemSettings.packageRate);
        setNotification({ open: true, message: 'System settings saved!', severity: 'success' });
    };

    const handleAddUser = async () => {
        if (editingUser) {
            handleUpdateUser();
            return;
        }

        if (!newUser.username) {
            setNotification({ open: true, message: 'Username is required', severity: 'error' });
            return;
        }
        if (!newUser.password || newUser.password.length <= 5) {
            setNotification({ open: true, message: 'Password must be greater than 5 characters', severity: 'error' });
            return;
        }

        try {
            await api.post('/auth/users', newUser);
            setNotification({ open: true, message: 'User added successfully', severity: 'success' });
            setOpenUserDialog(false);
            setNewUser({ username: '', password: '', email: '', role: 'VIEWER' });
            fetchUsers();
        } catch (error) {
            setNotification({ open: true, message: 'Failed to add user', severity: 'error' });
        }
    };

    const handleUpdateUser = async () => {
        if (!newUser.username) {
            setNotification({ open: true, message: 'Username is required', severity: 'error' });
            return;
        }
        if (newUser.password && newUser.password.length <= 5) {
            setNotification({ open: true, message: 'Password must be greater than 5 characters', severity: 'error' });
            return;
        }

        try {
            await api.put(`/auth/users/${editingUser.id}`, newUser);
            setNotification({ open: true, message: 'User updated successfully', severity: 'success' });
            setOpenUserDialog(false);
            setEditingUser(null);
            setNewUser({ username: '', password: '', email: '', role: 'VIEWER' });
            fetchUsers();
        } catch (error) {
            setNotification({ open: true, message: 'Failed to update user', severity: 'error' });
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            setNotification({ open: true, message: 'User deleted successfully', severity: 'success' });
            fetchUsers();
        } catch (error) {
            setNotification({ open: true, message: 'Failed to delete user', severity: 'error' });
        }
    };

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setNewUser({
            username: user.username,
            password: '', // Keep password empty unless changing
            email: user.email || '',
            role: user.role,
        });
        setOpenUserDialog(true);
    };

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Settings
            </Typography>

            <Paper>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Company Info" />
                    <Tab label="System Settings" />
                    <Tab label="User Management" />
                    <Tab label="Audit Logs" />
                </Tabs>

                {/* Company Info Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Company Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Company Name"
                                value={companySettings.companyName}
                                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Address"
                                value={companySettings.address}
                                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                label="GSTIN"
                                value={companySettings.gstin}
                                onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Phone"
                                value={companySettings.phone}
                                onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={companySettings.email}
                                onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                                fullWidth
                            />
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCompanySettings} sx={{ mt: 2 }}>
                                Save Company Info
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* System Settings Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            System Configuration
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={systemSettings.autoBackup}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })}
                                    />
                                }
                                label="Enable Auto Backup"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={systemSettings.emailNotifications}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                                    />
                                }
                                label="Email Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={systemSettings.lowStockAlert}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, lowStockAlert: e.target.checked })}
                                    />
                                }
                                label="Low Stock Alerts"
                            />
                            <TextField
                                label="Low Stock Threshold (kg)"
                                type="number"
                                value={systemSettings.lowStockThreshold}
                                onChange={(e) => setSystemSettings({ ...systemSettings, lowStockThreshold: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="EB Rate (₹/unit)"
                                type="number"
                                value={systemSettings.ebRate}
                                onChange={(e) => setSystemSettings({ ...systemSettings, ebRate: e.target.value })}
                                fullWidth
                                helperText="Electricity cost per unit (kWh)"
                            />
                            <TextField
                                label="Package Rate (₹/kg)"
                                type="number"
                                value={systemSettings.packageRate}
                                onChange={(e) => setSystemSettings({ ...systemSettings, packageRate: e.target.value })}
                                fullWidth
                                helperText="Packaging cost per kg of yarn"
                            />
                            <TextField
                                label="Maintenance Rate (₹/kg)"
                                type="number"
                                value={systemSettings.maintenanceRate}
                                onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceRate: e.target.value })}
                                fullWidth
                                helperText="Maintenance cost per kg of yarn"
                            />

                            <Paper sx={{ p: 2, bgcolor: 'background.default', border: '1px dashed grey' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Default Currency: INR (₹)</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Base currency is fixed to Indian Rupee.
                                </Typography>
                            </Paper>

                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSystemSettings} sx={{ mt: 2 }}>
                                Save System Settings
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* User Management Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Users</Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setEditingUser(null);
                                    setNewUser({ username: '', password: '', email: '', role: 'VIEWER' });
                                    setOpenUserDialog(true);
                                }}
                            >
                                Add User
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Username</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.email || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role === 'ADMIN' || user.role === 'AUTHOR' ? 'Admin / Author' : user.role === 'MODIFIER' ? 'Modifier' : 'Viewer'}
                                                    size="small"
                                                    color={(user.role === 'ADMIN' || user.role === 'AUTHOR') ? 'error' : user.role === 'MODIFIER' ? 'warning' : 'primary'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleEditClick(user)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    {currentUser?.id !== user.id && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No users found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>

                {/* Audit Logs Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Logs />
                </TabPanel>
            </Paper>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>

            {/* User Dialog (Add/Edit) */}
            <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
                        <TextField
                            label="Username"
                            fullWidth
                            required
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="Optional"
                        />
                        <TextField
                            label={editingUser ? "New Password (Optional)" : "Password"}
                            type="password"
                            fullWidth
                            required={!editingUser}
                            helperText={editingUser ? "Leave blank to keep current password" : "Min 6 characters"}
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <MenuItem value="ADMIN">Admin / Author</MenuItem>
                            <MenuItem value="MODIFIER">Modifier</MenuItem>
                            <MenuItem value="VIEWER">Viewer</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddUser} variant="contained">{editingUser ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Settings;
