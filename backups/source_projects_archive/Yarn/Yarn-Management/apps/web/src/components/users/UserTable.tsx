import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    IconButton,
    Box,
    Typography,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    avatar?: string;
}

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    currentUserId?: string; // To prevent self-deletion
}

// Helper to determine chip color based on role
const getRoleColor = (role: string = '') => {
    switch ((role || '').toUpperCase()) {
        case 'ADMIN':
            return 'error';
        case 'MANAGER':
            return 'warning';
        case 'USER':
        default:
            return 'default';
    }
};

const getStatusColor = (status: string = '') => {
    switch (status) {
        case 'ACTIVE':
            return 'success';
        case 'INACTIVE':
            return 'error';
        case 'PENDING':
            return 'warning';
        default:
            return 'default';
    }
};

export default function UserTable({ users, onEdit, onDelete, currentUserId }: UserTableProps) {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }} aria-label="user table">
                <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No users found.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => {
                            const isMainAdmin = user.email === 'gokulkangeyan@gmail.com';
                            const isSelf = user.id === currentUserId;
                            const isProtected = isMainAdmin || isSelf;

                            return (
                                <TableRow
                                    key={user.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={user.avatar}
                                                sx={{ bgcolor: isMainAdmin ? 'primary.main' : 'secondary.main' }}
                                            >
                                                {isMainAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {user.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<SecurityIcon sx={{ fontSize: '1rem !important' }} />}
                                            label={user.role || 'USER'}
                                            size="small"
                                            color={getRoleColor(user.role) as any}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status || 'PENDING'}
                                            size="small"
                                            color={getStatusColor(user.status) as any}
                                            sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit User">
                                            <IconButton onClick={() => onEdit(user)} size="small" color="primary">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title={isProtected ? (isMainAdmin ? "Cannot delete Main Admin" : "Cannot delete yourself") : "Delete User"}>
                                            <span>
                                                <IconButton
                                                    onClick={() => onDelete(user)}
                                                    size="small"
                                                    color="error"
                                                    disabled={isProtected}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
