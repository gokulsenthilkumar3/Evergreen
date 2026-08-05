import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Button,
    Chip,
    TextField,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import api from '../utils/api';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

export default function SessionManagement() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');

    // Fetch Sessions
    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await api.get('/sessions');
            return res.data;
        }
    });

    const filteredSessions = sessions.filter((session: any) => {
        const term = searchTerm.toLowerCase();
        return !term ||
            session.user?.username?.toLowerCase().includes(term) ||
            session.location?.toLowerCase().includes(term) ||
            session.ipAddress?.toLowerCase().includes(term) ||
            session.userAgent?.toLowerCase().includes(term);
    });

    // Revoke Session Mutation
    const revokeSessionMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/sessions/${id}/revoke`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            toast.success('Session revoked successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to revoke session');
        }
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const activeCount = sessions.filter((session: any) => session.isValid).length;
    const revokedCount = sessions.length - activeCount;

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Session Management
                    </Typography>
                    <Typography color="text.secondary">
                        Review live sessions, devices, and revoke risky logins.
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                {[{ label: 'All Sessions', value: sessions.length }, { label: 'Active', value: activeCount }, { label: 'Revoked', value: revokedCount }].map((card) => (
                    <Paper key={card.label} sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                        <Typography variant="h4" fontWeight={800}>{card.value}</Typography>
                    </Paper>
                ))}
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by user, IP, location, or device..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Paper>

            <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>User Agent</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Last Active</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <EmptyState
                                            type="search"
                                            title="No sessions found"
                                            message="Try a different search term or check back after more users sign in."
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSessions.map((session: any) => (
                                    <TableRow key={session.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {session.user?.username || 'Unknown'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {session.user?.role}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{session.ipAddress}</TableCell>
                                        <TableCell>{session.location || 'Unknown'}</TableCell>
                                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={session.userAgent}>
                                            {session.device || session.userAgent}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={session.isValid ? 'Active' : 'Revoked'}
                                                color={session.isValid ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(session.lastActive).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            {session.isValid && (
                                                <Button
                                                    color="error"
                                                    size="small"
                                                    disabled={revokeSessionMutation.isPending}
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to revoke this session?')) {
                                                            revokeSessionMutation.mutate(session.id);
                                                        }
                                                    }}
                                                >
                                                    Revoke
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
