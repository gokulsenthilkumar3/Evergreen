import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Tabs,
    Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiClient } from '../../lib/api';

interface RFQFormProps {
    onClose: () => void;
    initialData?: any;
}

export default function RFQForm({ onClose, initialData }: RFQFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
    });
    const [items, setItems] = useState<any[]>([{ materialType: '', quantity: 0, unit: 'kg', specifications: '' }]);
    const [activeTab, setActiveTab] = useState(0);
    const [details, setDetails] = useState<any>(null); // Full details including quotations

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || '',
                deadline: initialData.deadline ? initialData.deadline.split('T')[0] : '',
            });
            // Fetch full details if viewing
            apiClient.get(`/procurement/rfqs/${initialData.id}`).then(res => {
                setDetails(res.data.rfq);
                if (res.data.rfq.items) setItems(res.data.rfq.items);
            });
        }
    }, [initialData]);

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { materialType: '', quantity: 0, unit: 'kg', specifications: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            if (initialData) {
                // simplified, no edit for now
                onClose();
                return;
            }
            const payload = {
                ...formData,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
                items: items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                }))
            };

            await apiClient.post('/procurement/rfqs', payload);
            onClose();
        } catch (error) {
            console.error('Error saving RFQ', error);
            alert('Failed to save RFQ');
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{initialData ? 'View RFQ' : 'Create RFQ'}</Typography>

            {initialData && (
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                    <Tab label="Details" />
                    <Tab label={`Quotations (${details?.quotations?.length || 0})`} />
                </Tabs>
            )}

            {activeTab === 0 && (
                <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                disabled={!!initialData}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Deadline"
                                InputLabelProps={{ shrink: true }}
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                disabled={!!initialData}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={!!initialData}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle1" gutterBottom>Items Required</Typography>
                    <TableContainer sx={{ mb: 2, border: '1px solid #ddd' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Material Type</TableCell>
                                    <TableCell width={120}>Quantity</TableCell>
                                    <TableCell width={100}>Unit</TableCell>
                                    <TableCell>Specifications</TableCell>
                                    <TableCell width={50}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                value={item.materialType}
                                                onChange={(e) => handleItemChange(index, 'materialType', e.target.value)}
                                                disabled={!!initialData}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                disabled={!!initialData}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={item.unit}
                                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                disabled={!!initialData}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                value={item.specifications}
                                                onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                                                disabled={!!initialData}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {!initialData && (
                                                <IconButton size="small" onClick={() => removeItem(index)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {!initialData && (
                        <Button startIcon={<AddIcon />} onClick={addItem} sx={{ mb: 3 }}>
                            Add Item
                        </Button>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Back</Button>
                        {!initialData && (
                            <Button variant="contained" onClick={handleSubmit}>Create RFQ</Button>
                        )}
                    </Box>
                </>
            )}

            {activeTab === 1 && details && (
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Received Quotations</Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell>Quote Number</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Valid Until</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {details.quotations.map((q: any) => (
                                    <TableRow key={q.id}>
                                        <TableCell>{q.supplier?.name}</TableCell>
                                        <TableCell>{q.quotationNumber}</TableCell>
                                        <TableCell>₹{Number(q.totalAmount).toLocaleString()}</TableCell>
                                        <TableCell>{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>{q.status}</TableCell>
                                    </TableRow>
                                ))}
                                {details.quotations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No quotations received yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose}>Back</Button>
                    </Box>
                </Box>
            )}
        </Paper>
    );
}
