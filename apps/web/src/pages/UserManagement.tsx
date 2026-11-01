import { uiText, useUiLanguage, uiLocale, uiDateLocale, uiScopedTemplate, formatUiNumber } from "../i18n";
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
    Stack,
    TablePagination,
    Avatar,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    InfoOutlined as InfoIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, formatApiError } from '../utils/messages';
import { canManageUsers } from '../utils/rbac';
import { tableToCSV } from '../utils/csvGenerator';
import { dateKey } from '../utils/dateKey';
import UserSecurityInspector from '../components/UserSecurityInspector';
import UserLifecycleControls from '../components/UserLifecycleControls';
import UserInvitations from '../components/UserInvitations';
import UserEndpointAccess from '../components/UserEndpointAccess';
import SessionPolicySettings from '../components/SessionPolicySettings';

interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'VIEWER' | 'MODIFIER' | 'ADMIN';
    createdAt: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: string;
    publicId?: string;
    status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'DELETED';
    statusReason?: string;
    lockedUntil?: string;
}

interface UserManagementProps {
    currentUserRole?: string;
    username?: string;
}

type UserForm = Pick<User, 'username' | 'name' | 'email' | 'role'> & { password: string };

const roleLabels = { ADMIN: 'Admin', MODIFIER: 'Modifier', VIEWER: 'Viewer' };
const roleDescriptions = { ADMIN: 'Manage users and all application records.', MODIFIER: 'Create and update records. Cannot delete records or manage users.', VIEWER: 'View application records. Cannot create, update, delete or manage users.' };
type SortOrder = 'username' | 'name' | 'newest' | 'oldest';

const UserManagement: React.FC<UserManagementProps> = ({ currentUserRole, username }) => {
  useUiLanguage();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [roleFilter, setRoleFilter] = useState<User['role'] | 'ALL'>('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState<SortOrder>('username');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [detailUserId, setDetailUserId] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [viewNotice, setViewNotice] = useState('');
    const [showRoles, setShowRoles] = useState(false);
    const viewKey = `users-view:${username || 'admin'}`;
    const saveView = () => {
        try { localStorage.setItem(viewKey, JSON.stringify({ searchTerm, roleFilter, statusFilter, sortOrder, rowsPerPage })); setViewNotice('Directory view saved on this device.'); }
        catch { setViewNotice('Could not save directory view.'); }
    };
    const restoreView = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(viewKey) || 'null');
            if (!saved) { setViewNotice('No saved directory view.'); return; }
            setSearchTerm(typeof saved.searchTerm === 'string' ? saved.searchTerm : '');
            setRoleFilter(['ALL', 'ADMIN', 'MODIFIER', 'VIEWER'].includes(saved.roleFilter) ? saved.roleFilter : 'ALL');
            setStatusFilter(['ALL','ACTIVE','PENDING','SUSPENDED','DISABLED','DELETED','LOCKED'].includes(saved.statusFilter) ? saved.statusFilter : 'ALL');
            setSortOrder(['username', 'name', 'newest', 'oldest'].includes(saved.sortOrder) ? saved.sortOrder : 'username');
            setRowsPerPage([10,25,50].includes(saved.rowsPerPage) ? saved.rowsPerPage : 10);
            setPage(0); setViewNotice('Directory view restored.');
        } catch { setViewNotice('Could not restore directory view.'); }
    };
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
        return (roleFilter === 'ALL' || user.role === roleFilter) && (statusFilter === 'ALL' || (statusFilter === 'LOCKED' ? Boolean(user.lockedUntil && new Date(user.lockedUntil) > new Date()) : (user.status || 'ACTIVE') === statusFilter)) && (!term ||
            user.username?.toLowerCase().includes(term) ||
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term) ||
            uiText(roleLabels[user.role], 'tables').toLowerCase().includes(term));
    }).sort((a, b) => {
        if (sortOrder === 'newest' || sortOrder === 'oldest') {
            const delta = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (Number.isFinite(delta) && delta !== 0) return sortOrder === 'newest' ? -delta : delta;
        }
        const field = sortOrder === 'name' ? 'name' : 'username';
        return (a[field] || a.username).localeCompare(b[field] || b.username, uiLocale(), { numeric: true, sensitivity: 'base' }) || a.id - b.id;
    });
    const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredUsers.length / rowsPerPage) - 1));
    const visibleUsers = filteredUsers.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
    const detailUser = users.find(user => user.id === detailUserId);
    const activeAdminCount = users.filter(user => user.role === 'ADMIN' && (!user.status || user.status === 'ACTIVE')).length;
    const clearFilters = () => { setSearchTerm(''); setRoleFilter('ALL'); setStatusFilter('ALL'); setPage(0); };
    const exportUsers = () => {
        tableToCSV(
            ['ID', 'Username', 'Name', 'Email', 'Role', 'Created By', 'Created At', 'Updated By', 'Updated At'].map(label => uiText(label, 'tables')),
            filteredUsers.map(user => [user.id, user.username, user.name, user.email, uiText(roleLabels[user.role], 'tables'), user.createdBy, user.createdAt, user.updatedBy, user.updatedAt]),
            `users-${dateKey()}`,
        );
        toast.success(SUCCESS_MESSAGES.EXPORT_CSV);
    };

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
        setShowPassword(false);
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
        setShowPassword(false);
        setFormData({ username: '', name: '', email: '', password: '', role: 'VIEWER' });
    };

    const isSaving = createUserMutation.isPending || updateUserMutation.isPending;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isSaving) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error(uiText('Enter a valid email address', 'feedback'));
            return;
        }
        if (!/^[A-Za-z0-9._@-]+$/.test(formData.username) || formData.username.length > 100) {
            toast.error(uiText('Use up to 100 letters, numbers, dots, underscores, @ signs or hyphens for the username', 'feedback'));
            return;
        }
        if ((!editingUser || formData.password) && (formData.password.length < 12 || new TextEncoder().encode(formData.password).length > 72)) {
            toast.error(uiText('Password must contain at least 12 characters and at most 72 UTF-8 bytes', 'feedback'));
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

    const handleDelete = async (user: User) => {
        if (await confirm({ title: 'Delete User', message: uiScopedTemplate('feedback')`Are you sure you want to delete user "${user.username}"?`, severity: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) {
            deleteUserMutation.mutate(user.id);
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
                    {uiText("Access Denied ")}</Typography>
                <Typography color="text.secondary">
                    {uiText("Only Admins can access User Management. ")}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', width: '100%', minWidth: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Box>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>{uiText("User Management")}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {uiText("Create users, assign roles, and keep permissions tidy. ")}</Typography>
                    </Box>
                </Box>
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <Button onClick={() => setShowRoles(true)}>{uiText('Compare roles')}</Button>
                    <UserInvitations />
                    <SessionPolicySettings />
                    <Button variant="outlined" startIcon={<RefreshIcon />} disabled={isFetching} onClick={() => void refetch()}>{uiText('Refresh')}</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} disabled={isLoading || isFetching || isError || !filteredUsers.length} onClick={exportUsers}>{uiText('Export filtered users')}</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ borderRadius: 2, px: 3 }}>
                        {uiText("Add User ")}</Button>
                </Stack>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2, mb: 3 }}>
                {[
                    { label: 'Total Users', value: users.length },
                    { label: 'Admins', value: roleCounts.ADMIN || 0 },
                    { label: 'Modifiers', value: roleCounts.MODIFIER || 0 },
                    { label: 'Viewers', value: roleCounts.VIEWER || 0 },
                ].map(card => (
                    <Paper key={card.label} sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary">{uiText(card.label, 'metrics')}</Typography>
                        <Typography variant="h4" fontWeight={800}>{isLoading || (isError && !users.length) ? '—' : formatUiNumber(card.value)}</Typography>
                    </Paper>
                ))}
            </Box>

            {isError && (
                <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" disabled={isFetching} onClick={() => void refetch()}>{uiText("Retry")}</Button>}>
                    {uiText("Could not load users.")}{users.length > 0 ? uiText(" Showing previously loaded users; these may be out of date.") : uiText(" Please try again.")}
                </Alert>
            )}
            {viewNotice && <Alert severity="info" onClose={() => setViewNotice('')} sx={{ mb: 2 }}>{uiText(viewNotice)}</Alert>}

            <Paper sx={{ width: '100%', minWidth: 0, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                    <Typography component="h2" variant="h6">{uiText("Team members")}</Typography>
                    <TextField
                        size="small"
                        label={uiText("Search users", 'forms')}
                        placeholder={uiText("Name, email or role", 'forms')}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 160, flexGrow: { xs: 1, sm: 0 } }}>
                        <InputLabel id="user-role-filter-label">{uiText('Filter by role', 'forms')}</InputLabel>
                        <Select labelId="user-role-filter-label" label={uiText('Filter by role', 'forms')} value={roleFilter} onChange={event => { setRoleFilter(event.target.value as typeof roleFilter); setPage(0); }}>
                            <MenuItem value="ALL">{uiText('All roles', 'forms')}</MenuItem>
                            {Object.entries(roleLabels).map(([role, label]) => <MenuItem value={role} key={role}>{uiText(label, 'forms')}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 180, flexGrow: { xs: 1, sm: 0 } }}>
                        <InputLabel id="user-status-filter-label">{uiText('Account status', 'forms')}</InputLabel>
                        <Select labelId="user-status-filter-label" label={uiText('Account status', 'forms')} value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(0); }}>{['ALL','ACTIVE','PENDING','SUSPENDED','DISABLED','DELETED','LOCKED'].map(status => <MenuItem key={status} value={status}>{uiText(status === 'ALL' ? 'All statuses' : status)}</MenuItem>)}</Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 180, flexGrow: { xs: 1, sm: 0 } }}>
                        <InputLabel id="user-sort-label">{uiText('Sort users', 'forms')}</InputLabel>
                        <Select labelId="user-sort-label" label={uiText('Sort users', 'forms')} value={sortOrder} onChange={event => { setSortOrder(event.target.value as SortOrder); setPage(0); }}>
                            {([['username', 'Username (A–Z)'], ['name', 'Name (A–Z)'], ['newest', 'Newest first'], ['oldest', 'Oldest first']] as const).map(([value, label]) => <MenuItem key={value} value={value}>{uiText(label, 'forms')}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {(searchTerm.trim() || roleFilter !== 'ALL' || statusFilter !== 'ALL') && <Button onClick={clearFilters}>{uiText('Clear filters')}</Button>}
                    <Button onClick={saveView}>{uiText('Save view')}</Button><Button onClick={restoreView}>{uiText('Restore view')}</Button>
                </Box>
                {!isLoading && !isError && <Typography role="status" variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>{uiScopedTemplate('tables')`${formatUiNumber(filteredUsers.length)} of ${formatUiNumber(users.length)} users`}</Typography>}
                <TableContainer tabIndex={0} role="region" aria-label={uiText("Team members")} sx={{ overflowX: 'auto' }}>
                    <Table aria-label={uiText("Users")} sx={{ minWidth: 760 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("ID", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Username", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Name", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Role", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Created By", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Created At", 'tables')}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>{uiText("Actions", 'tables')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} aria-label={uiText("Loading users", 'tables')} />
                                    </TableCell>
                                </TableRow>
                            ) : isError && !users.length ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>{uiText("User list unavailable.", 'tables')}</TableCell></TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">{searchTerm.trim() || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? uiText("No users match your search.", 'tables') : uiText("No users yet. Add a user to get started.", 'tables')}</Typography>
                                        {(searchTerm.trim() || roleFilter !== 'ALL' || statusFilter !== 'ALL') && <Button onClick={clearFilters}>{uiText("Clear search", 'tables')}</Button>}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visibleUsers.map((user: User) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>#{user.id}</TableCell>
                                        <TableCell sx={{ maxWidth: 260, overflowWrap: 'anywhere' }}>
                                            <Typography variant="body2" fontWeight={600}>{user.username}{user.username === username ? uiText(" (you)", 'tables') : ''}</Typography>
                                            <Typography variant="body2" color="text.secondary">{user.email || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>{user.name || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={uiText(roleLabels[user.role], 'tables')}
                                                size="small"
                                                color={getRoleColor(user.role)}
                                                variant="outlined"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                            <Typography variant="caption" display="block">{uiText(user.status || 'ACTIVE', 'tables')}</Typography>
                                            {user.lockedUntil && new Date(user.lockedUntil) > new Date() && <Chip size="small" color="warning" label={uiText('LOCKED', 'tables')} title={new Date(user.lockedUntil).toLocaleString(uiDateLocale())} />}
                                        </TableCell>
                                        <TableCell>{user.createdBy || '-'}</TableCell>
                                        <TableCell>
                                            <Tooltip title={new Date(user.createdAt).toLocaleString(uiDateLocale())} arrow placement="top">
                                                <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                    {new Date(user.createdAt).toLocaleDateString(uiDateLocale())}
                                                </Box>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                            <Tooltip title={uiText('Account details', 'tables')}>
                                                <IconButton size="small" aria-label={uiScopedTemplate('tables')`View ${user.username}`} onClick={() => setDetailUserId(user.id)}><InfoIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                aria-label={uiScopedTemplate('tables')`Edit ${user.username}`}
                                                disabled={deleteUserMutation.isPending || user.status === 'DELETED'}
                                                onClick={() => handleOpenDialog(user)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <Tooltip title={user.username === username ? uiText("You cannot delete your own account", 'tables') : user.role === 'ADMIN' && roleCounts.ADMIN === 1 ? uiText("The last administrator cannot be deleted", 'tables') : uiScopedTemplate('tables')`Delete ${user.username}`}>
                                                <span>
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        aria-label={uiScopedTemplate('tables')`Delete ${user.username}`}
                                                        disabled={deleteUserMutation.isPending || user.username === username || user.status === 'DELETED' || (user.role === 'ADMIN' && (!user.status || user.status === 'ACTIVE') && activeAdminCount === 1)}
                                                        onClick={() => handleDelete(user)}
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
                <TablePagination component="div" count={filteredUsers.length} page={currentPage} rowsPerPage={rowsPerPage} rowsPerPageOptions={[10, 25, 50]} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={event => { setRowsPerPage(Number(event.target.value)); setPage(0); }} sx={{ '& .MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1 } }} />
            </Paper>

            <Dialog open={Boolean(detailUser)} onClose={() => setDetailUserId(null)} fullWidth maxWidth="sm" aria-labelledby="user-details-title">
                <DialogTitle id="user-details-title">{uiText('Account details')}</DialogTitle>
                {detailUser && <DialogContent>
                    <Avatar sx={{ mb: 1, bgcolor: 'primary.main' }}>{(detailUser.name || detailUser.username).trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase()}</Avatar>
                    <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>{detailUser.name || detailUser.username}</Typography>
                    <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere', mb: 2 }}>{detailUser.username} · {detailUser.email || '—'}</Typography>
                    <Chip label={uiText(roleLabels[detailUser.role], 'tables')} color={getRoleColor(detailUser.role)} size="small" />
                    <Alert severity="info" sx={{ my: 2 }}>{uiText(roleDescriptions[detailUser.role])}</Alert>
                    <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'minmax(110px, 1fr) 2fr', gap: 1.5, '& dd': { m: 0, overflowWrap: 'anywhere' } }}>
                        {[
                            ['ID', `#${detailUser.id}`],
                            ['Public ID', detailUser.publicId || '—'],
                            ['Created By', detailUser.createdBy || '—'],
                            ['Created At', new Date(detailUser.createdAt).toLocaleString(uiDateLocale())],
                            ['Updated By', detailUser.updatedBy || '—'],
                            ['Updated At', detailUser.updatedAt ? new Date(detailUser.updatedAt).toLocaleString(uiDateLocale()) : '—'],
                        ].map(([label, value]) => <React.Fragment key={label}><Typography component="dt" variant="body2" color="text.secondary">{uiText(label, 'tables')}</Typography><Typography component="dd" variant="body2">{value}</Typography></React.Fragment>)}
                    </Box>
                    <UserSecurityInspector userId={detailUser.id} username={detailUser.username} />
                    <UserLifecycleControls userId={detailUser.id} status={detailUser.status} reason={detailUser.statusReason} ownAccount={detailUser.username === username} />
                    <UserEndpointAccess userId={detailUser.id} />
                </DialogContent>}
                <DialogActions>
                    <Button onClick={() => setDetailUserId(null)}>{uiText('Close')}</Button>
                    <Button variant="contained" disabled={deleteUserMutation.isPending || detailUser?.status === 'DELETED'} onClick={() => { if (detailUser) { setDetailUserId(null); handleOpenDialog(detailUser); } }}>{uiText('Edit User')}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showRoles} onClose={() => setShowRoles(false)} fullWidth maxWidth="sm" aria-labelledby="role-reference-title">
                <DialogTitle id="role-reference-title">{uiText('Compare roles')}</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>{uiText('Built-in role defaults. Individual endpoints and the installation licence can impose additional restrictions.')}</Alert>
                    {Object.entries(roleLabels).map(([role, label]) => <Box key={role} sx={{ my: 2 }}><Typography variant="subtitle1" fontWeight={700}>{uiText(label)}</Typography><Typography variant="body2">{uiText(roleDescriptions[role as User['role']])}</Typography></Box>)}
                </DialogContent><DialogActions><Button onClick={() => setShowRoles(false)}>{uiText('Close')}</Button></DialogActions>
            </Dialog>

            {/* Create/Edit Helper Dialog */}
            <Dialog open={openDialog} onClose={() => { if (!isSaving) handleCloseDialog(); }} maxWidth="sm" fullWidth aria-labelledby="user-dialog-title">
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <DialogTitle id="user-dialog-title" sx={{ fontWeight: 'bold' }}>
                    {editingUser ? uiText("Edit User") : uiText("Add New User")}
                </DialogTitle>
                <DialogContent>
                    {!editingUser && <Alert severity="info" sx={{mb:2}}>{uiText('New accounts remain pending. Use Invitations to send onboarding and require email verification plus MFA before first sign-in.')}</Alert>}
                    <Box component="fieldset" disabled={isSaving} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, px: 0, pb: 0, m: 0, border: 0, minWidth: 0 }}>
                        <TextField
                            label={uiText("Username", 'forms')}
                            autoFocus
                            autoComplete="off"
                            disabled={Boolean(editingUser)}
                            slotProps={{ htmlInput: { maxLength: 100, pattern: '[A-Za-z0-9._@\\-]+' } }}
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label={uiText("Full Name", 'forms')}
                            slotProps={{ htmlInput: { maxLength: 200 } }}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={uiText("Email", 'forms')}
                            type="email"
                            disabled={Boolean(editingUser)}
                            helperText={editingUser ? uiText('Email changes require mailbox verification in Security Settings', 'forms') : undefined}
                            required
                            slotProps={{ htmlInput: { maxLength: 254 } }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={editingUser ? uiText("New Password", 'forms') : uiText("Password", 'forms')}
                            helperText={editingUser ? uiText("Leave blank to keep the current password. Otherwise use at least 12 characters (maximum 72 UTF-8 bytes).", 'forms') : uiText("Use at least 12 characters (maximum 72 UTF-8 bytes).", 'forms')}
                            autoComplete="new-password"
                            slotProps={{ htmlInput: { minLength: 12, maxLength: 72 }, input: { endAdornment: <InputAdornment position="end"><IconButton edge="end" aria-label={uiText(showPassword ? 'Hide password' : 'Show password', 'forms')} aria-pressed={showPassword} onMouseDown={event => event.preventDefault()} onClick={() => setShowPassword(value => !value)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }}
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            fullWidth
                            required={!editingUser}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="user-role-label">{uiText("Role", 'forms')}</InputLabel>
                            <Select
                                labelId="user-role-label"
                                disabled={isSaving || (editingUser?.role === 'ADMIN' && roleCounts.ADMIN === 1)}
                                value={formData.role}
                                label={uiText("Role", 'forms')}
                                renderValue={(role) => uiText(roleLabels[role], 'forms')}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                            >
                                <MenuItem value="VIEWER">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{uiText("Viewer", 'forms')}</Typography>
                                        <Typography variant="caption" color="text.secondary">{uiText("Read-only access", 'forms')}</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="MODIFIER">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{uiText("Modifier", 'forms')}</Typography>
                                        <Typography variant="caption" color="text.secondary">{uiText("Can Create/Update, No Delete", 'forms')}</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="ADMIN">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">{uiText("Admin", 'forms')}</Typography>
                                        <Typography variant="caption" color="text.secondary">{uiText("Highest level access", 'forms')}</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <Alert severity="info">{uiText(roleDescriptions[formData.role], 'forms')}</Alert>
                        {editingUser && (formData.password || editingUser.role !== formData.role) && <Alert severity="warning">{uiText('Changing a password or role signs this user out of all active sessions.', 'forms')}</Alert>}
                        {editingUser?.role === 'ADMIN' && roleCounts.ADMIN === 1 && <Typography variant="caption" color="text.secondary">{uiText("The last administrator must keep the Admin role.")}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit" disabled={isSaving}>{uiText("Cancel")}</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSaving}
                    >
                        {isSaving ? uiText("Saving…") : editingUser ? uiText("Update User") : uiText("Create User")}
                    </Button>
                </DialogActions>
                </Box>
            </Dialog>

        </Box>
    );
};

export default UserManagement;
