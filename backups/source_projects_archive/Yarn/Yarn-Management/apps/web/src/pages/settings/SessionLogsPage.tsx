import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import { http } from '../../lib/http';
import { format } from 'date-fns';
import { notify } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface Session {
    id: string;
    deviceInfo: string;
    ipAddress: string;
    location: string | null;
    loginAt: string;
    logoutAt: string | null;
    isActive: boolean;
    isCurrent?: boolean;
    revokedAt: string | null;
    user: {
        email: string;
        name: string | null;
    };
}

export default function SessionLogsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
    const { logout } = useAuth();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await http.get('/session-logs');
            setSessions(response.data.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            notify.showError('Failed to load session logs');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!revokeConfirmId) return;

        // Find session to check if it's current
        const sessionToRevoke = sessions.find(s => s.id === revokeConfirmId);
        const isCurrent = sessionToRevoke?.isCurrent;

        try {
            await http.delete(`/session-logs/${revokeConfirmId}`);
            notify.showSuccess('Session revoked successfully');

            if (isCurrent) {
                // Determine if we should logout immediately
                // Wait briefly to show success message then logout
                setTimeout(() => {
                    logout();
                }, 1000);
            } else {
                fetchSessions(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to revoke session:', error);
            notify.showError('Failed to revoke session');
        } finally {
            setRevokeConfirmId(null);
        }
    };

    const getStatusChip = (session: Session) => {
        if (session.revokedAt) {
            return <Chip label="Revoked" color="error" size="small" />;
        }
        if (!session.isActive || session.logoutAt) {
            return <Chip label="Expired" color="default" size="small" />;
        }
        if (session.isCurrent) {
            return <Chip label="Active (Current)" color="primary" size="small" />;
        }
        return <Chip label="Active" color="success" size="small" />;
    };

    const parseDeviceInfo = (info: string) => {
        // Basic parsing, assuming simple string for now. 
        // Ideally use ua-parser-js on frontend too or backend provided parsed fields.
        return info.length > 50 ? info.substring(0, 50) + '...' : info;
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Session Activity</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                Review your login history. If you see any suspicious activity, revoke the session immediately.
            </Alert>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Device / Browser</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Login Time</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : sessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No session history found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell>
                                        <Typography variant="body2">{session.user.name || session.user.email}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{parseDeviceInfo(session.deviceInfo)}</Typography>
                                    </TableCell>
                                    <TableCell>{session.ipAddress}</TableCell>
                                    <TableCell>{session.location || 'Unknown'}</TableCell>
                                    <TableCell>
                                        {format(new Date(session.loginAt), 'PP pp')}
                                    </TableCell>
                                    <TableCell>{getStatusChip(session)}</TableCell>
                                    <TableCell align="right">
                                        {session.isActive && !session.revokedAt && !session.logoutAt && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<LogoutIcon />}
                                                onClick={() => setRevokeConfirmId(session.id)}
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

            {/* Revoke Confirmation Dialog */}
            <Dialog open={!!revokeConfirmId} onClose={() => setRevokeConfirmId(null)}>
                <DialogTitle>Revoke Session?</DialogTitle>
                <DialogContent>
                    Are you sure you want to revoke this session? The user will be logged out immediately.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevokeConfirmId(null)}>Cancel</Button>
                    <Button onClick={handleRevoke} color="error" variant="contained">
                        Revoke Session
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
