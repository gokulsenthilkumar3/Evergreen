import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    MenuItem,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiClient } from '../../lib/api';

interface GRNFormProps {
    onClose: () => void;
    initialData?: any;
}

export default function GRNForm({ onClose, initialData }: GRNFormProps) {
    const [suppliers, setSuppliers] = useState([]);
    const [pos, setPos] = useState([]);
    const [formData, setFormData] = useState({
        supplierId: '',
        purchaseOrderId: '',
        receivedDate: new Date().toISOString().split('T')[0],
        challanNumber: '',
        invoiceNumber: '',
        notes: ''
    });
    const [items, setItems] = useState<any[]>([{ materialType: '', quantity: 0, unit: 'kg', batchNumber: '', remarks: '' }]);

    useEffect(() => {
        apiClient.get('/suppliers').then(res => setSuppliers(res.data.suppliers || []));
        apiClient.get('/procurement/purchase-orders').then(res => setPos(res.data.purchaseOrders || []));
    }, []);

    useEffect(() => {
        if (initialData) {
            // View mode mostly
            setFormData({
                supplierId: initialData.supplierId,
                purchaseOrderId: initialData.purchaseOrderId || '',
                receivedDate: initialData.receivedDate ? initialData.receivedDate.split('T')[0] : '',
                challanNumber: initialData.challanNumber || '',
                invoiceNumber: initialData.invoiceNumber || '',
                notes: initialData.notes || ''
            });
            // fetch items if needed, simplistic
        }
    }, [initialData]);

    // When PO is selected, auto-fill items
    const handlePOChange = async (poId: string) => {
        setFormData({ ...formData, purchaseOrderId: poId });
        if (poId) {
            try {
                const res = await apiClient.get(`/procurement/purchase-orders/${poId}`);
                const po = res.data.purchaseOrder;
                setFormData(prev => ({ ...prev, supplierId: po.supplierId })); // Auto-set supplier
                // Pre-fill items from PO
                const poItems = po.items.map((item: any) => ({
                    materialType: item.materialType,
                    quantity: item.quantity, // Default to full quantity, user can adjust
                    unit: item.unit,
                    batchNumber: '',
                    remarks: ''
                }));
                setItems(poItems);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { materialType: '', quantity: 0, unit: 'kg', batchNumber: '', remarks: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            if (initialData) {
                onClose(); return;
            }

            const payload = {
                ...formData,
                purchaseOrderId: formData.purchaseOrderId || undefined,
                receivedDate: formData.receivedDate ? new Date(formData.receivedDate).toISOString() : undefined,
                items: items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                }))
            };

            await apiClient.post('/procurement/grns', payload);
            onClose();
        } catch (error) {
            console.error('Error saving GRN', error);
            alert('Failed to save GRN');
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{initialData ? 'View GRN' : 'Create GRN'}</Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Purchase Order (Optional)"
                        value={formData.purchaseOrderId}
                        onChange={(e) => handlePOChange(e.target.value)}
                        disabled={!!initialData}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {pos.map((p: any) => (
                            <MenuItem key={p.id} value={p.id}>{p.poNumber} - {p.supplier?.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Supplier"
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        disabled={!!initialData || !!formData.purchaseOrderId}
                    >
                        {suppliers.map((s: any) => (
                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        type="date"
                        label="Received Date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.receivedDate}
                        onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                        disabled={!!initialData}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Challan Number"
                        value={formData.challanNumber}
                        onChange={(e) => setFormData({ ...formData, challanNumber: e.target.value })}
                        disabled={!!initialData}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Invoice Number"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        disabled={!!initialData}
                    />
                </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom>received Items</Typography>
            <TableContainer sx={{ mb: 2, border: '1px solid #ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Material Type</TableCell>
                            <TableCell width={120}>Quantity Received</TableCell>
                            <TableCell width={100}>Unit</TableCell>
                            <TableCell>Batch No. (Auto/Manual)</TableCell>
                            <TableCell>Remarks</TableCell>
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
                                        value={item.batchNumber}
                                        onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                                        placeholder="Auto-generated if empty"
                                        disabled={!!initialData}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={item.remarks}
                                        onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
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

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        disabled={!!initialData}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={onClose}>Cancel</Button>
                {!initialData && (
                    <Button variant="contained" onClick={handleSubmit}>Create GRN</Button>
                )}
            </Box>
        </Paper>
    );
}
