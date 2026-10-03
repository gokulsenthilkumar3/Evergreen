import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    IconButton,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { http } from '../../lib/http';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
};

export default function CreateInvoiceDialog({ open, onClose, onSave }: Props) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [items, setItems] = useState<{ description: string; quantity: string; unitPrice: string; total: number }[]>([
        { description: '', quantity: '1', unitPrice: '0', total: 0 }
    ]);
    const [values, setValues] = useState({
        customerId: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxRate: '0.18',
        notes: ''
    });

    useEffect(() => {
        if (open) {
            http.get('/billing/customers').then(res => setCustomers(res.data.customers));
        }
    }, [open]);

    function updateItem(index: number, field: string, value: string) {
        const newItems = [...items];
        (newItems as any)[index][field] = value;

        // Auto calm total
        const q = Number(newItems[index].quantity);
        const p = Number(newItems[index].unitPrice);
        newItems[index].total = q * p;

        setItems(newItems);
    }

    function addItem() {
        setItems([...items, { description: '', quantity: '1', unitPrice: '0', total: 0 }]);
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index));
    }

    const subTotal = items.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = subTotal * Number(values.taxRate);
    const totalAmount = subTotal + taxAmount;

    async function handleSubmit() {
        try {
            await http.post('/billing/invoices', {
                ...values,
                dueDate: new Date(values.dueDate).toISOString(),
                taxRate: Number(values.taxRate),
                items: items.map(i => ({
                    description: i.description,
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice)
                }))
            });
            onSave();
        } catch (err: any) {
            // Handled by global interceptor
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            select
                            label="Customer"
                            value={values.customerId}
                            onChange={e => setValues({ ...values, customerId: e.target.value })}
                            fullWidth
                            required
                        >
                            {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </TextField>
                        <TextField
                            label="Due Date"
                            type="date"
                            value={values.dueDate}
                            onChange={e => setValues({ ...values, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                        />
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2 }}>Items</Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Description</TableCell>
                                <TableCell width={100}>Qty</TableCell>
                                <TableCell width={120}>Price</TableCell>
                                <TableCell width={120}>Total</TableCell>
                                <TableCell width={50}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            value={item.description}
                                            onChange={e => updateItem(index, 'description', e.target.value)}
                                            size="small" fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', e.target.value)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{item.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => removeItem(index)} color="error" disabled={items.length === 1}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button startIcon={<AddIcon />} onClick={addItem} sx={{ alignSelf: 'start' }}>Add Item</Button>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Typography>Subtotal: {subTotal.toFixed(2)}</Typography>
                        <Typography>Tax (18%): {taxAmount.toFixed(2)}</Typography>
                        <Typography variant="h6">Total: {totalAmount.toFixed(2)}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>Create Invoice</Button>
            </DialogActions>
        </Dialog>
    );
}
