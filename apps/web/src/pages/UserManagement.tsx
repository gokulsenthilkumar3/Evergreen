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
    CircularProgress,
    Tooltip,
    Alert,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, formatApiError } from '../utils/messages';
import { canManageUsers } from '../utils/rbac';

interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'VIEWER' | 'MODIFIER' | 'ADMIN';
    createdAt: string;
    createdBy?: string;
    updatedBy?: string;
}

interface UserManagementProps {
    currentUserRole?: string;
    username?: string;
}

type UserForm = Pick<User, 'username' | 'name' | 'email' | 'role'> & { password: string };

const roleLabels = { ADMIN: 'Admin', MODIFIER: 'Modifier', VIEWER: 'Viewer' };

const UserManagement: React.FC<UserManagementProps> = ({ currentUserRole, username }) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { confirm } = useConfirm();


    const [formData, setFormData] = useState<UserForm>({
        username: '',
        name: '',
        password: '',
        email: '',
        role: 'VIEWER'
    });

    // Fetch Users
    const { data: users = [], isLoading, isError, isFetching, refetch } = useQuery<User[]>({
        queryKey: ['users'],
        enabled: canManageUsers(currentUserRole),
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data;
        }
    });

    const filteredUsers = users.filter((user: User) => {
        const term = searchTerm.trim().toLowerCase();
        return !term ||
            user.username?.toLowerCase().includes(term) ||
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term);
    });

    const roleCounts = users.reduce((acc: Record<string, number>, user: User) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    // Create User Mutation
    const createUserMutation = useMutation({
        mutationFn: (newUser: UserForm) => api.post('/users', newUser),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(SUCCESS_MESSAGES.USER_CREATE);
            handleCloseDialog();
        },
        onError: (error: unknown) => {
            toast.error(formatApiError(error, ERROR_MESSAGES.CREATE_FAILED));
        }
    });

    // Update User Mutation
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<UserForm> }) => api.put(`/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(SUCCESS_MESSAGES.USER_UPDATE);
            handleCloseDialog();
        },
        onError: (error: unknown) => {
            toast.error(formatApiError(error, ERROR_MESSAGES.UPDATE_FAILED));
        }
    });

    // Delete User Mutation
    const deleteUserMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(SUCCESS_MESSAGES.USER_DELETE);
        },
        onError: (error: unknown) => {
            toast.error(formatApiError(error, ERROR_MESSAGES.DELETE_FAILED));
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

    const isSaving = createUserMutation.isPending || updateUserMutation.isPending;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isSaving) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Enter a valid email address');
            return;
        }
        if (!/^[A-Za-z0-9._@-]+$/.test(formData.username) || formData.username.length > 100) {
            toast.error('Use up to 100 letters, numbers, dots, underscores, @ signs or hyphens for the username');
            return;
        }
        if ((!editingUser || formData.password) && (formData.password.length < 12 || new TextEncoder().encode(formData.password).length > 72)) {
            toast.error('Password must contain at least 12 characters and at most 72 UTF-8 bytes');
            return;
        }

        if (editingUser) {
            const updateData: Partial<UserForm> = { ...formData };
            if (!updateData.password) delete updateData.password;
            updateUserMutation.mutate({ id: editingUser.id, data: updateData });
        } else {
            if (!formData.password) {
                toast.error(ERROR_MESSAGES.REQUIRED_FIELD('Password'));
                return;
            }
            createUserMutation.mutate(formData);
        }
    };

    const handleDelete = async (id: number) => {
        if (await confirm({ title: 'Delete User', message: 'Are you sure you want to delete this user?', severity: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) {
            deleteUserMutation.mutate(id);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'MODIFIER': return 'warning';
            case 'VIEWER': return 'info';
            default: return 'default';
        }
    };

    if (!canManageUsers(currentUserRole)) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary">
                    Access Denied
                </Typography>
                <Typography color="text.secondary">
                    Only Admins can access User Management.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', width: '100%', minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Box>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>User Management</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create users, assign roles, and keep permissions tidy.
                        </Typography>
                    </Box>
                </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ borderRadius: 2, px: 3, width: { xs: '100%', sm: 'auto' } }}>
                        Add User
                    </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2, mb: 3 }}>
                {[
                    { label: 'Total Users', value: users.length },
                    { label: 'Admins', value: roleCounts.ADMIN || 0 },
                    { label: 'Modifiers', value: roleCounts.MODIFIER || 0 },
                    { label: 'Viewers', value: roleCounts.VIEWER || 0 },
                ].map(card => (
                    <Paper key={card.label} sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                        <Typography variant="h4" fontWeight={800}>{isLoading || (isError && !users.length) ? '—' : card.value}</Typography>
                    </Paper>
                ))}
            </Box>

            {isError && (
                <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" disabled={isFetching} onClick={() => void refetch()}>Retry</Button>}>
                    Could not load users.{users.length > 0 ? ' Showing previously loaded users; these may be out of date.' : ' Please try again.'}
                </Alert>
            )}

            <Paper sx={{ width: '100%', minWidth: 0, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Typography component="h2" variant="h6">Team members</Typography>
                    <TextField
                        size="small"
                        label="Search users"
                        placeholder="Name, email or role"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                </Box>
                <TableContainer tabIndex={0} role="region" aria-label="Team members" sx={{ overflowX: 'auto' }}>
                    <Table aria-label="Users" sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created By</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} aria-label="Loading users" />
                                    </TableCell>
                                </TableRow>
                            ) : isError && !users.length ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>User list unavailable.</TableCell></TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">{searchTerm.trim() ? 'No users match your search.' : 'No users yet. Add a user to get started.'}</Typography>
                                        {searchTerm.trim() && <Button onClick={() => setSearchTerm('')}>Clear search</Button>}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user: User) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>#{user.id}</TableCell>
                                        <TableCell sx={{ maxWidth: 260, overflowWrap: 'anywhere' }}>
                                            <Typography variant="body2" fontWeight={600}>{user.username}{user.username === username ? ' (you)' : ''}</Typography>
                                            <Typography variant="body2" color="text.secondary">{user.email || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>{user.name || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                color={getRoleColor(user.role)}
                                                variant="outlined"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>{user.createdBy || '-'}</TableCell>
                                        <TableCell>
                                            <Tooltip title={new Date(user.createdAt).toLocaleString()} arrow placement="top">
                                                <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </Box>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                aria-label={`Edit ${user.username}`}
                                                disabled={deleteUserMutation.isPending}
                                                onClick={() => handleOpenDialog(user)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <Tooltip title={user.username === username ? 'You cannot delete your own account' : user.role === 'ADMIN' && roleCounts.ADMIN === 1 ? 'The last administrator cannot be deleted' : `Delete ${user.username}`}>
                                                <span>
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        aria-label={`Delete ${user.username}`}
                                                        disabled={deleteUserMutation.isPending || user.username === username || (user.role === 'ADMIN' && roleCounts.ADMIN === 1)}
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create/Edit Helper Dialog */}
            <Dialog open={openDialog} onClose={() => { if (!isSaving) handleCloseDialog(); }} maxWidth="sm" fullWidth aria-labelledby="user-dialog-title">
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <DialogTitle id="user-dialog-title" sx={{ fontWeight: 'bold' }}>
                    {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <Box component="fieldset" disabled={isSaving} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, px: 0, pb: 0, m: 0, border: 0, minWidth: 0 }}>
                        <TextField
                            label="Username"
                            autoFocus
                            autoComplete="off"
                            slotProps={{ htmlInput: { maxLength: 100, pattern: '[A-Za-z0-9._@\\-]+' } }}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Full Name"
                            slotProps={{ htmlInput: { maxLength: 200 } }}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            required
                            slotProps={{ htmlInput: { maxLength: 254 } }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={editingUser ? 'New Password' : 'Password'}
                            helperText={editingUser ? 'Leave blank to keep the current password. Otherwise use at least 12 characters (maximum 72 UTF-8 bytes).' : 'Use at least 12 characters (maximum 72 UTF-8 bytes).'}
                            autoComplete="new-password"
                            slotProps={{ htmlInput: { minLength: 12, maxLength: 72 } }}
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            fullWidth
                            required={!editingUser}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="user-role-label">Role</InputLabel>
                            <Select
                                labelId="user-role-label"
                                disabled={isSaving || (editingUser?.role === 'ADMIN' && roleCounts.ADMIN === 1)}
                                value={formData.role}
                                label="Role"
                                renderValue={(role) => roleLabels[role]}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
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
                                <MenuItem value="ADMIN">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Admin</Typography>
                                        <Typography variant="caption" color="text.secondary">Highest level access</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        {editingUser?.role === 'ADMIN' && roleCounts.ADMIN === 1 && <Typography variant="caption" color="text.secondary">The last administrator must keep the Admin role.</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit" disabled={isSaving}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving…' : editingUser ? 'Update User' : 'Create User'}
                    </Button>
                </DialogActions>
                </Box>
            </Dialog>

        </Box>
    );
};

export default UserManagement;
