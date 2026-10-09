import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
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
    MenuItem,
    Chip,
    Alert
} from '@mui/material';
import { Delete, Add, Event, Send } from '@mui/icons-material';
import { http } from '../../lib/http';
import { useNotification } from '../../context/NotificationContext';

interface ReportSchedule {
    id: string;
    name: string;
    reportType: string;
    frequency: string;
    recipients: string[];
    lastRun: string | null;
    nextRun: string;
    isActive: boolean;
}

export default function ReportSchedulePage() {
    const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useNotification();

    const [formData, setFormData] = useState({
        name: '',
        reportType: 'orders',
        frequency: 'DAILY',
        recipients: '',
    });

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        try {
            const res = await http.get('/reporting/schedules');
            setSchedules(res.data);
        } catch (err) {
            showError('Failed to load schedules');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await http.delete(`/reporting/schedules/${id}`);
            showSuccess('Schedule deleted');
            loadSchedules();
        } catch (err) {
            showError('Failed to delete schedule');
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.recipients) return;
        setLoading(true);
        try {
            const recipients = formData.recipients.split(',').map(r => r.trim());
            const nextRun = new Date();
            nextRun.setDate(nextRun.getDate() + 1); // Set for tomorrow

            await http.post('/reporting/schedules', {
                ...formData,
                recipients,
                nextRun
            });
            showSuccess('Schedule created successfully');
            setOpen(false);
            loadSchedules();
        } catch (err) {
            showError('Failed to create schedule');
        } finally {
            setLoading(false);
        }
    };

    const triggerEngine = async () => {
        try {
            await http.post('/reporting/engine/run');
            showSuccess('Reporting engine triggered manually');
            loadSchedules();
        } catch (err) {
            showError('Engine trigger failed');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Automated Report Distributions</Typography>
                <Box>
                    <Button
                        startIcon={<Send />}
                        onClick={triggerEngine}
                        sx={{ mr: 2 }}
                    >
                        Run Engine Now
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpen(true)}
                    >
                        New Schedule
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Recipients</TableCell>
                            <TableCell>Last Run</TableCell>
                            <TableCell>Next Run</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {schedules.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell sx={{ fontWeight: 'medium' }}>{s.name}</TableCell>
                                <TableCell>
                                    <Chip label={s.reportType.toUpperCase()} size="small" />
                                </TableCell>
                                <TableCell>{s.frequency}</TableCell>
                                <TableCell>{s.recipients.length} recipients</TableCell>
                                <TableCell>{s.lastRun ? new Date(s.lastRun).toLocaleDateString() : 'Never'}</TableCell>
                                <TableCell>{new Date(s.nextRun).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="error" onClick={() => handleDelete(s.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {schedules.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    No active schedules found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Report Schedule</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Schedule Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            select
                            label="Report Type"
                            fullWidth
                            value={formData.reportType}
                            onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                        >
                            <MenuItem value="orders">Orders Report</MenuItem>
                            <MenuItem value="inventory">Inventory Summary</MenuItem>
                            <MenuItem value="production">Production Efficiency</MenuItem>
                            <MenuItem value="suppliers">Supplier Performance</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Frequency"
                            fullWidth
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        >
                            <MenuItem value="DAILY">Daily</MenuItem>
                            <MenuItem value="WEEKLY">Weekly</MenuItem>
                            <MenuItem value="MONTHLY">Monthly</MenuItem>
                        </TextField>
                        <TextField
                            label="Recipients (comma separated emails)"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.recipients}
                            onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                            placeholder="manager@example.com, admin@example.com"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={loading || !formData.name || !formData.recipients}
                    >
                        Create Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
