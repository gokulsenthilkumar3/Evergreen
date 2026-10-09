import { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
    IconButton, Chip, Tooltip, Skeleton
} from '@mui/material';
import { Delete, Laptop, PhoneAndroid, Public } from '@mui/icons-material';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';
import { UAParser } from 'ua-parser-js';

export default function SessionManagement() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        try {
            const { data } = await http.get('/auth/sessions');
            setSessions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to log out this device?')) return;
        try {
            await http.delete(`/auth/sessions/${id}`);
            setSessions(prev => prev.filter(s => s.id !== id));
            notify.showSuccess('Session revoked');
        } catch (e) {
            notify.showError('Failed to revoke session');
        }
    };

    const parseUA = (uaString: string) => {
        const parser = new UAParser(uaString);
        const result = parser.getResult();
        return {
            browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`,
            os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`,
            device: result.device.type || 'Desktop'
        };
    };

    if (loading) return <Skeleton variant="rectangular" height={200} />;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Active Sessions</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Manage devices where you are currently logged in.
            </Typography>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Device</TableCell>
                        <TableCell>Location (IP)</TableCell>
                        <TableCell>Last Active</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sessions.map(session => {
                        const ua = parseUA(session.userAgent);
                        return (
                            <TableRow key={session.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {ua.device === 'mobile' ? <PhoneAndroid /> : <Laptop />}
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{ua.browser} on {ua.os}</Typography>
                                            {/* <Typography variant="caption" color="text.secondary">{session.userAgent}</Typography> */}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Public fontSize="small" color="disabled" />
                                        {session.ipAddress || 'Unknown'}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {new Date(session.lastActive).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Revoke Session">
                                        <IconButton color="error" onClick={() => handleRevoke(session.id)}>
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {sessions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center">No active sessions found (Wait, you are reading this?)</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}
