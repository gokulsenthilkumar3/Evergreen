import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Chip,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Divider,
    InputAdornment,
    Fade,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    HeadsetMic as HelpdeskIcon,
    Send as SendIcon,
    CheckCircle as ResolvedIcon,
    HourglassEmpty as PendingIcon,
    Help as HelpIcon,
    SupportAgent as SupportAgentIcon,
    LocalActivity as SLAIcon,
    MarkChatRead as TicketIcon,
} from '@mui/icons-material';
import { usePersist } from '../hooks/usePersist';

const FAQ_ITEMS = [
    {
        q: 'How do I create a new invoice?',
        a: 'Navigate to Billing → Invoices tab and click the "New Invoice" button at the top right. Fill in the customer details, add line items, and click "Save Invoice".',
        category: 'Billing',
    },
    {
        q: 'How do I record a payment against an invoice?',
        a: 'In the Invoices list, click the payment icon (₹) on any unpaid invoice, enter the payment amount and method, then click "Record Payment".',
        category: 'Billing',
    },
    {
        q: 'How do I add inward stock (cotton)?',
        a: 'Go to Inward / Batch from the sidebar. Click "New Inward Entry", fill in the batch details including source, count, bags, weight, and rate, then save.',
        category: 'Inventory',
    },
    {
        q: 'How do I record production output?',
        a: 'Navigate to Production from the sidebar. Click "New Production Entry", select the input batch, enter the output yarn count and weight, then save.',
        category: 'Production',
    },
    {
        q: 'How do I manage user roles?',
        a: 'Go to User Management (Admin only). You can create users with roles: VIEWER, MODIFIER, AUTHOR, or ADMIN.',
        category: 'Admin',
    },
    {
        q: 'How do I change the company name or logo?',
        a: 'Go to Settings from the sidebar. Update the Company Name, Address, GSTIN, and upload a logo. These will appear on all your invoices.',
        category: 'Settings',
    },
    {
        q: 'What is the difference between Inward and Production?',
        a: 'Inward Entry records incoming raw cotton stock into your inventory. Production Entry records the conversion of cotton into yarn, tracking wastage automatically.',
        category: 'Inventory',
    },
    {
        q: 'How do I export data to Excel or PDF?',
        a: 'On most list pages there are export buttons at the top right. Invoices can be printed as PDF directly from the invoice view.',
        category: 'Export',
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    Billing: '#059669',
    Inventory: '#0284c7',
    Production: '#7c3aed',
    Admin: '#dc2626',
    Settings: '#d97706',
    Export: '#0891b2',
};

const statusIconMap: Record<string, React.ReactNode> = {
    Resolved: <ResolvedIcon color="success" fontSize="small" />,
    Pending: <PendingIcon color="warning" fontSize="small" />,
    'In Progress': <PendingIcon color="info" fontSize="small" />,
};

const supportCards = [
    { label: 'Typical reply', value: 'Under 24h', icon: <SLAIcon fontSize="small" />, tone: '#0891b2' },
    { label: 'Live support', value: 'Mon–Sat', icon: <SupportAgentIcon fontSize="small" />, tone: '#7c3aed' },
    { label: 'Open channels', value: 'FAQ + Ticket', icon: <TicketIcon fontSize="small" />, tone: '#059669' },
];

const Helpdesk: React.FC = () => {
    const { items: tickets, add: addTicket } = usePersist<any>('helpdesk_tickets', []);
    const [faqSearch, setFaqSearch] = useState('');
    const [ticketForm, setTicketForm] = useState({ subject: '', type: 'Bug', description: '' });
    const [submitted, setSubmitted] = useState(false);

    const filteredFAQs = useMemo(
        () =>
            FAQ_ITEMS.filter(
                (item) =>
                    !faqSearch ||
                    item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
                    item.a.toLowerCase().includes(faqSearch.toLowerCase())
            ),
        [faqSearch]
    );

    const stats = [
        { label: 'Tickets raised', value: tickets.length.toString().padStart(2, '0') },
        { label: 'Resolved', value: tickets.filter((ticket: any) => ticket.status === 'Resolved').length.toString().padStart(2, '0') },
        { label: 'Pending', value: tickets.filter((ticket: any) => ticket.status !== 'Resolved').length.toString().padStart(2, '0') },
    ];

    const handleSubmitTicket = () => {
        if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;
        addTicket({
            id: `TKT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            subject: ticketForm.subject,
            type: ticketForm.type,
            description: ticketForm.description,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            priority: ticketForm.type === 'Bug' ? 'High' : 'Medium',
        });
        setSubmitted(true);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg, rgba(8,145,178,0.12) 0%, rgba(124,58,237,0.08) 100%)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <HelpdeskIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>Helpdesk</Typography>
                        <Typography variant="body2" color="text.secondary">Find answers fast, raise a clean ticket, and keep track of progress in one place.</Typography>
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    {supportCards.map((card) => (
                        <Grid key={card.label} size={{ xs: 12, md: 4 }}>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: `${card.tone}18`, color: card.tone, width: 40, height: 40 }}>{card.icon}</Avatar>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                                        <Typography variant="body1" fontWeight={700}>{card.value}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <HelpIcon color="primary" />
                                    <Typography variant="h6" fontWeight={800}>Frequently Asked Questions</Typography>
                                </Box>
                                <Chip label={`${filteredFAQs.length} found`} size="small" variant="outlined" />
                            </Box>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search questions, features, or workflows..."
                                value={faqSearch}
                                onChange={(e) => setFaqSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            />
                        </Box>
                        <Box sx={{ maxHeight: 520, overflowY: 'auto' }}>
                            {filteredFAQs.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography fontWeight={700}>No matching questions found.</Typography>
                                    <Typography variant="body2" color="text.secondary">Try a broader search or raise a ticket below.</Typography>
                                </Box>
                            ) : (
                                filteredFAQs.map((item, i) => (
                                    <Accordion key={i} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid', borderColor: 'divider', transition: 'transform 180ms ease, background-color 180ms ease', '&:hover': { bgcolor: 'action.hover' } }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                <Chip label={item.category} size="small" sx={{ bgcolor: `${CATEGORY_COLORS[item.category]}15`, color: CATEGORY_COLORS[item.category], fontWeight: 700, fontSize: '0.65rem' }} />
                                                <Typography variant="body2" fontWeight={700}>{item.q}</Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ px: 3, py: 2, bgcolor: 'background.default' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{item.a}</Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}><HelpdeskIcon fontSize="small" /></Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={800}>Raise a Ticket</Typography>
                                <Typography variant="body2" color="text.secondary">Keep it short, specific, and easy to route.</Typography>
                            </Box>
                        </Box>
                        {submitted ? (
                            <Fade in>
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <ResolvedIcon color="success" sx={{ fontSize: 48, mb: 1.5 }} />
                                    <Typography variant="h6" fontWeight={800} gutterBottom>Ticket submitted</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>We’ll get back to you within 24 hours.</Typography>
                                    <Button variant="outlined" size="small" onClick={() => { setSubmitted(false); setTicketForm({ subject: '', type: 'Bug', description: '' }); }}>Raise another</Button>
                                </Box>
                            </Fade>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField label="Subject" fullWidth size="small" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} />
                                <TextField select label="Type" fullWidth size="small" value={ticketForm.type} onChange={(e) => setTicketForm({ ...ticketForm, type: e.target.value })} SelectProps={{ native: true }}>
                                    <option value="Bug">🐛 Bug Report</option>
                                    <option value="Feature">💡 Feature Request</option>
                                    <option value="Question">❓ Question</option>
                                    <option value="Other">📋 Other</option>
                                </TextField>
                                <TextField label="Description" fullWidth size="small" multiline rows={4} value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} placeholder="Tell us what happened, what you expected, and any steps to reproduce." />
                                <Button variant="contained" startIcon={<SendIcon />} onClick={handleSubmitTicket} disabled={!ticketForm.subject.trim() || !ticketForm.description.trim()} sx={{ py: 1.1, borderRadius: 2 }}>Submit ticket</Button>
                            </Box>
                        )}
                    </Paper>

                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                        <Typography variant="h6" fontWeight={800} gutterBottom>Recent Tickets</Typography>
                        <Grid container spacing={1.5} sx={{ mb: 2 }}>
                            {stats.map((stat) => (
                                <Grid key={stat.label} size={{ xs: 4 }}>
                                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                        <Typography variant="h6" fontWeight={800}>{stat.value}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {tickets.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <Typography fontWeight={700}>No tickets raised yet.</Typography>
                                    <Typography variant="body2" color="text.secondary">Your submitted tickets will appear here.</Typography>
                                </Box>
                            )}
                            {tickets.map((ticket: any) => (
                                <Card key={ticket.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, transition: 'transform 180ms ease, box-shadow 180ms ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" fontWeight={700} gutterBottom noWrap>{ticket.subject}</Typography>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Typography variant="caption" color="text.disabled">{ticket.id}</Typography>
                                                    <Divider orientation="vertical" flexItem />
                                                    <Typography variant="caption" color="text.disabled">{ticket.date}</Typography>
                                                    <Chip label={ticket.priority} size="small" color={ticket.priority === 'High' ? 'error' : 'warning'} variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}>
                                                {statusIconMap[ticket.status]}
                                                <Typography variant="caption" color="text.secondary">{ticket.status}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Helpdesk;
