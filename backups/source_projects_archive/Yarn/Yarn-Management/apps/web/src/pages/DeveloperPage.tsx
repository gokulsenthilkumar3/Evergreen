import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Card, CardContent,
    Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Chip, Tabs, Tab
} from '@mui/material';
import { Delete, Visibility, Add, ContentCopy } from '@mui/icons-material';
import { http } from '../lib/http';

export default function DeveloperPage() {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Developer Portal</Typography>
            <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 3 }}>
                <Tab label="API Keys" />
                <Tab label="Webhooks" />
                <Tab label="Documentation" />
            </Tabs>

            {tabIndex === 0 && <ApiKeysView />}
            {tabIndex === 1 && <WebhooksView />}
            {tabIndex === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6">API Documentation</Typography>
                        <Typography paragraph>
                            Complete REST API documentation is available via Swagger UI.
                        </Typography>
                        <Button
                            variant="contained"
                            href="http://localhost:4000/api-docs"
                            target="_blank"
                        >
                            Open Swagger Docs
                        </Button>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

function ApiKeysView() {
    const [keys, setKeys] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => { loadKeys(); }, []);

    const loadKeys = async () => {
        const res = await http.get('/developer/keys');
        setKeys(res.data);
    };

    const handleCreate = async () => {
        await http.post('/developer/keys', { name });
        setOpen(false);
        setName('');
        loadKeys();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Revoke this key?')) {
            await http.delete(`/developer/keys/${id}`);
            loadKeys();
        }
    };

    return (
        <Box>
            <Button startIcon={<Add />} variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
                Generate New Key
            </Button>
            <Table>
                <TableHead>
                    <TableRow><TableCell>Name</TableCell><TableCell>Key</TableCell><TableCell>Created</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow>
                </TableHead>
                <TableBody>
                    {keys.map(k => (
                        <TableRow key={k.id}>
                            <TableCell>{k.name}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                                {k.key.substring(0, 10)}...
                                <IconButton size="small" onClick={() => navigator.clipboard.writeText(k.key)}><ContentCopy fontSize="small" /></IconButton>
                            </TableCell>
                            <TableCell>{new Date(k.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell><Chip label={k.isActive ? 'Active' : 'Revoked'} color={k.isActive ? 'success' : 'default'} size="small" /></TableCell>
                            <TableCell>
                                {k.isActive && <IconButton color="error" onClick={() => handleDelete(k.id)}><Delete /></IconButton>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>New API Key</DialogTitle>
                <DialogContent>
                    <TextField autoFocus fullWidth label="Key Name (e.g. Mobile App)" value={name} onChange={e => setName(e.target.value)} sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Generate</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function WebhooksView() {
    const [hooks, setHooks] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ url: '', events: '', secret: '' });

    useEffect(() => { loadHooks(); }, []);

    const loadHooks = async () => {
        const res = await http.get('/developer/webhooks');
        setHooks(res.data);
    };

    const handleCreate = async () => {
        const events = form.events.split(',').map(e => e.trim());
        await http.post('/developer/webhooks', { url: form.url, events, secret: form.secret });
        setOpen(false);
        setForm({ url: '', events: '', secret: '' });
        loadHooks();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this webhook?')) {
            await http.delete(`/developer/webhooks/${id}`);
            loadHooks();
        }
    };

    return (
        <Box>
            <Button startIcon={<Add />} variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
                Register Webhook
            </Button>
            <Table>
                <TableHead>
                    <TableRow><TableCell>URL</TableCell><TableCell>Events</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell></TableRow>
                </TableHead>
                <TableBody>
                    {hooks.map(h => (
                        <TableRow key={h.id}>
                            <TableCell>{h.url}</TableCell>
                            <TableCell>{h.events.join(', ')}</TableCell>
                            <TableCell><Chip label={h.isActive ? 'Active' : 'Inactive'} color={h.isActive ? 'success' : 'default'} size="small" /></TableCell>
                            <TableCell>
                                <IconButton color="error" onClick={() => handleDelete(h.id)}><Delete /></IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Register Webhook</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Endpoint URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} sx={{ mt: 1, mb: 2 }} />
                    <TextField fullWidth label="Events (comma separated)" placeholder="order.created, stock.low" value={form.events} onChange={e => setForm({ ...form, events: e.target.value })} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Secret (Optional)" value={form.secret} onChange={e => setForm({ ...form, secret: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Register</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
