import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'VIEWER' | 'MODIFIER' | 'AUTHOR';
    createdAt: string;
}

interface UserManagementProps {
    currentUserRole?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUserRole }) => {
    const queryClient = useQueryClient();
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        email: '',
        role: 'VIEWER'
    });

    // Fetch Users
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/auth/users');
            return res.data;
        }
    });

    // Create User Mutation
    const createUserMutation = useMutation({
        mutationFn: (newUser: any) => api.post('/auth/users', newUser),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setNotification({ open: true, message: 'User created successfully', severity: 'success' });
            handleCloseDialog();
        },
        onError: (error: any) => {
            setNotification({ open: true, message: error.response?.data?.message || 'Failed to create user', severity: 'error' });
        }
    });

    // Update User Mutation
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/auth/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setNotification({ open: true, message: 'User updated successfully', severity: 'success' });
            handleCloseDialog();
        },
        onError: (error: any) => {
            setNotification({ open: true, message: error.response?.data?.message || 'Failed to update user', severity: 'error' });
        }
    });

    // Delete User Mutation
    const deleteUserMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/auth/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setNotification({ open: true, message: 'User deleted successfully', severity: 'success' });
        },
        onError: (error: any) => {
            setNotification({ open: true, message: error.response?.data?.message || 'Failed to delete user', severity: 'error' });
        }
    });

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                name: user.name || '',
                password: '', // Don't fill password on edit
                email: user.email || '',
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                name: '',
                password: '',
                email: '',
                role: 'VIEWER'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
    };

    const handleSubmit = () => {
        if (!formData.username) {
            setNotification({ open: true, message: 'Username is required', severity: 'error' });
            return;
        }

        if (editingUser) {
            const updateData: any = { ...formData };
            if (!updateData.password) delete updateData.password; // Don't send empty password
            updateUserMutation.mutate({ id: editingUser.id, data: updateData });
        } else {
            if (!formData.password) {
                setNotification({ open: true, message: 'Password is required for new users', severity: 'error' });
                return;
            }
            createUserMutation.mutate(formData);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(id);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'AUTHOR': return 'error';
            case 'MODIFIER': return 'warning';
            case 'VIEWER': return 'info';
            default: return 'default';
        }
    };

    if (currentUserRole !== 'AUTHOR') {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary">
                    Access Denied
                </Typography>
                <Typography color="text.secondary">
                    Only Authors (Admins) can access User Management.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        User Management
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Add User
                </Button>
            </Box>

            <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No users found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: User) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>#{user.id}</TableCell>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{user.username}</TableCell>
                                        <TableCell>{user.name || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                color={getRoleColor(user.role) as any}
                                                variant="outlined"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleOpenDialog(user)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create/Edit Helper Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            fullWidth
                            required={!editingUser}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            >
                                <MenuItem value="VIEWER">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Viewer</Typography>
                                        <Typography variant="caption" color="text.secondary">Read-only access</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="MODIFIER">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Modifier</Typography>
                                        <Typography variant="caption" color="text.secondary">Can Create/Update, No Delete</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="AUTHOR">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Author (Admin)</Typography>
                                        <Typography variant="caption" color="text.secondary">Full CRUD Access</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    >
                        {editingUser ? 'Update User' : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement;
