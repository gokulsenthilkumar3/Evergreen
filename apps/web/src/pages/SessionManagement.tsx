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
    Chip
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import api from '../utils/api';
import { toast } from 'sonner';

export default function SessionManagement() {
    const queryClient = useQueryClient();

    // Fetch Sessions
    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await api.get('/sessions');
            return res.data;
        }
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

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Session Management
                </Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                View and manage active user sessions.
            </Typography>

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
                            {sessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No sessions found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sessions.map((session: any) => (
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
                                            {session.userAgent}
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
