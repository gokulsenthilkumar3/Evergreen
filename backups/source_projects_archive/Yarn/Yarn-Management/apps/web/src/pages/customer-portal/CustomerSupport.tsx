import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { apiClient } from '../../lib/api';

export default function CustomerSupport() {
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/customer-portal/support/tickets');
            setTickets(res.data.tickets);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage('');
            await apiClient.post('/customer-portal/support/tickets', formData);
            setMessage('Support ticket created successfully!');
            setFormData({
                title: '',
                description: '',
                category: 'GENERAL',
                priority: 'MEDIUM',
            });
            setShowForm(false);
            fetchTickets();
        } catch (error) {
            console.error('Failed to create ticket:', error);
            setMessage('Failed to create support ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Support Center</Typography>
                <Button
                    variant="contained"
                    onClick={() => setShowForm(!showForm)}
                    disabled={loading}
                >
                    {showForm ? 'Cancel' : 'New Ticket'}
                </Button>
            </Box>

            {message && (
                <Alert severity={message.includes('success') ? 'success' : 'info'} sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            {/* Create Support Ticket Form */}
            {showForm && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Create Support Ticket
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Brief description of your issue"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={formData.category}
                                        label="Category"
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <MenuItem value="GENERAL">General</MenuItem>
                                        <MenuItem value="TECHNICAL">Technical</MenuItem>
                                        <MenuItem value="BILLING">Billing</MenuItem>
                                        <MenuItem value="FEATURE_REQUEST">Feature Request</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={formData.priority}
                                        label="Priority"
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <MenuItem value="LOW">Low</MenuItem>
                                        <MenuItem value="MEDIUM">Medium</MenuItem>
                                        <MenuItem value="HIGH">High</MenuItem>
                                        <MenuItem value="CRITICAL">Critical</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Please provide detailed information about your issue"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SendIcon />}
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit Ticket'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            )}

            {/* Support Tickets List */}
            <Paper>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">Your Support Tickets</Typography>
                </Box>
                {loading && !showForm ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : tickets.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No support tickets found. Create one if you need assistance.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ticket #</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tickets.map((ticket: any) => (
                                    <TableRow key={ticket.id} hover>
                                        <TableCell>{ticket.ticketNumber}</TableCell>
                                        <TableCell>{ticket.title}</TableCell>
                                        <TableCell>{ticket.category}</TableCell>
                                        <TableCell>
                                            <Chip label={ticket.priority} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={ticket.status} color="primary" size="small" />
                                        </TableCell>
                                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
}
