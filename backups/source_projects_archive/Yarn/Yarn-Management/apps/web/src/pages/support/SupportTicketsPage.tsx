import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Grid,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Plus, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const SupportTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        category: ''
    });
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        category: 'GENERAL',
        priority: 'MEDIUM'
    });

    useEffect(() => {
        fetchTickets();
        fetchStats();
    }, [filters]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await http.get('/support/tickets', { params: filters });
            setTickets(response.data.tickets);
        } catch (error) {
            notify.showError('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await http.get('/support/tickets/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleCreateTicket = async () => {
        try {
            await http.post('/support/tickets', {
                ...newTicket,
                createdBy: 'current-user'
            });
            notify.showSuccess('Ticket created successfully');
            setCreateDialogOpen(false);
            setNewTicket({
                title: '',
                description: '',
                category: 'GENERAL',
                priority: 'MEDIUM'
            });
            fetchTickets();
            fetchStats();
        } catch (error) {
            notify.showError('Failed to create ticket');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'error';
            case 'IN_PROGRESS': return 'warning';
            case 'WAITING_FOR_CUSTOMER': return 'info';
            case 'RESOLVED': return 'success';
            case 'CLOSED': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'error';
            case 'HIGH': return 'warning';
            case 'MEDIUM': return 'info';
            case 'LOW': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <AlertCircle size={28} style={{ marginRight: 12 }} />
                    <Typography variant="h4">Support Tickets</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setCreateDialogOpen(true)}
                >
                    Create Ticket
                </Button>
            </Box>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Total Tickets</Typography>
                            <Typography variant="h3">{stats.total || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Open</Typography>
                                    <Typography variant="h3">{stats.open || 0}</Typography>
                                </Box>
                                <AlertCircle size={40} style={{ opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'warning.light' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="subtitle2">In Progress</Typography>
                                    <Typography variant="h3">{stats.inProgress || 0}</Typography>
                                </Box>
                                <Clock size={40} style={{ opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Resolved</Typography>
                                    <Typography variant="h3">{stats.resolved || 0}</Typography>
                                </Box>
                                <CheckCircle size={40} style={{ opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="OPEN">Open</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="WAITING_FOR_CUSTOMER">Waiting for Customer</MenuItem>
                            <MenuItem value="RESOLVED">Resolved</MenuItem>
                            <MenuItem value="CLOSED">Closed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Priority"
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        >
                            <MenuItem value="">All Priorities</MenuItem>
                            <MenuItem value="CRITICAL">Critical</MenuItem>
                            <MenuItem value="HIGH">High</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="LOW">Low</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Category"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            <MenuItem value="TECHNICAL">Technical</MenuItem>
                            <MenuItem value="BILLING">Billing</MenuItem>
                            <MenuItem value="GENERAL">General</MenuItem>
                            <MenuItem value="FEATURE_REQUEST">Feature Request</MenuItem>
                            <MenuItem value="BUG_REPORT">Bug Report</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket #</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map((ticket: any) => (
                            <TableRow key={ticket.id} hover sx={{ cursor: 'pointer' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{ticket.ticketNumber}</TableCell>
                                <TableCell>{ticket.title}</TableCell>
                                <TableCell>{ticket.category}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={ticket.priority}
                                        color={getPriorityColor(ticket.priority) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={ticket.status.replace('_', ' ')}
                                        color={getStatusColor(ticket.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{ticket._count?.comments || 0}</TableCell>
                            </TableRow>
                        ))}
                        {tickets.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Box p={3}>
                                        <Typography color="textSecondary">No tickets found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Ticket Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Category"
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="TECHNICAL">Technical</MenuItem>
                        <MenuItem value="BILLING">Billing</MenuItem>
                        <MenuItem value="GENERAL">General</MenuItem>
                        <MenuItem value="FEATURE_REQUEST">Feature Request</MenuItem>
                        <MenuItem value="BUG_REPORT">Bug Report</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        select
                        label="Priority"
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    >
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="CRITICAL">Critical</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateTicket}>Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupportTicketsPage;
