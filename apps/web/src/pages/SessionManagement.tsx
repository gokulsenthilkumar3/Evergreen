import { uiText, useUiLanguage, uiDateLocale, uiMetric } from "../i18n";
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
    Alert,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import api from '../utils/api';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';
import { useConfirm } from '../context/ConfirmContext';

export default function SessionManagement() {
  useUiLanguage();
    const queryClient = useQueryClient();
    const { confirm } = useConfirm();
    const [searchTerm, setSearchTerm] = React.useState('');

    // Fetch Sessions
    const { data: sessions = [], isLoading, isError, isFetching, refetch } = useQuery({
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
            toast.success(uiText('Session revoked successfully', 'feedback'));
        },
        onError: (error: any) => {
            toast.error(uiText(error?.response?.data?.message || 'Failed to revoke session', 'feedback'));
        }
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const activeCount = sessions.filter((session: any) => session.isValid && !session.expired).length;
    const revokedCount = sessions.filter((session: any) => !session.isValid).length;
    const expiredCount = sessions.filter((session: any) => session.isValid && session.expired).length;

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {isError && <Alert severity="error" action={<Button disabled={isFetching} onClick={()=>void refetch()}>{uiText('Retry')}</Button>}>{uiText('Could not load sessions. Previously loaded data may be out of date.')}</Alert>}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {uiText("Session Management ")}</Typography>
                    <Typography color="text.secondary">
                        {uiText("Review live sessions, devices, and revoke risky logins. ")}</Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                {[{ label: 'All Sessions', value: sessions.length }, { label: 'Active', value: activeCount }, { label: 'Revoked', value: revokedCount }, {label:'Expired',value:expiredCount}].map((card) => (
                    <Paper key={card.label} sx={{ p: 2.5 }}>
                        <Typography variant="caption" color="text.secondary">{uiText(card.label, 'metrics')}</Typography>
                        <Typography variant="h4" fontWeight={800}>{uiMetric(card.value)}</Typography>
                    </Paper>
                ))}
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder={uiText("Search by user, IP, location, or device...", 'forms')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Paper>

            <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("User", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("IP Address", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Location", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("User Agent", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Status", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Last Active", 'tables')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{uiText("Actions", 'tables')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <EmptyState
                                            type="search"
                                            title={uiText("No sessions found", 'tables')}
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
                                                {session.isCurrent ? uiText(' (current session)', 'tables') : ''}
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
                                                label={!session.isValid ? uiText("Revoked", 'tables') : session.expired ? uiText('Expired', 'tables') : uiText("Active", 'tables')}
                                                color={session.isValid && !session.expired ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(session.lastActive).toLocaleString(uiDateLocale())}
                                            {session.expiresAt && <Typography variant="caption" display="block">{uiText('Expires')}: {new Date(session.expiresAt).toLocaleString(uiDateLocale())}</Typography>}
                                        </TableCell>
                                        <TableCell align="right">
                                            {session.isValid && (
                                                <Button
                                                    color="error"
                                                    size="small"
                                                    disabled={revokeSessionMutation.isPending}
                                                    onClick={async () => {
                                                        if (await confirm({title:uiText('Revoke sessions'),message:uiText('Revoke this session? If it is your current session, you will be signed out.'),severity:'warning'})) {
                                                            revokeSessionMutation.mutate(session.id);
                                                        }
                                                    }}
                                                >
                                                    {uiText("Revoke ", 'tables')}</Button>
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
