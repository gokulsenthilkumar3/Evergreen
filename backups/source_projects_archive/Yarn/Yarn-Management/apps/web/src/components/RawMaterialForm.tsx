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
} from '@mui/material';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    rawMaterial?: any;
    initialValues?: any;
};

export default function RawMaterialForm({ open, onClose, onSave, rawMaterial, initialValues }: Props) {
    const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        batchNo: '',
        supplierId: '',
        materialType: 'Cotton Waste',
        quantity: '',
        unit: 'kg',
        costPerUnit: '',
        qualityScore: '5',
        moistureContent: '',
        receivedDate: new Date().toISOString().split('T')[0],
        warehouseLocationId: '',
        status: 'IN_STOCK',
        notes: ''
    });
    const [warehouses, setWarehouses] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            Promise.all([
                http.get('/suppliers'),
                http.get('/inventory/warehouses')
            ]).then(([sRes, wRes]) => {
                setSuppliers(sRes.data.suppliers);
                setWarehouses(wRes.data.warehouses);
            });

            if (rawMaterial) {
                // Edit Mode
                setValues({
                    ...rawMaterial,
                    supplierId: rawMaterial.supplier?.id || '',
                    quantity: String(rawMaterial.quantity),
                    costPerUnit: String(rawMaterial.costPerUnit || ''),
                    qualityScore: String(rawMaterial.qualityScore),
                    moistureContent: String(rawMaterial.moistureContent || ''),
                    receivedDate: rawMaterial.receivedDate.split('T')[0],
                    warehouseLocationId: rawMaterial.warehouseLocationId || '',
                });
            } else if (initialValues) {
                // Clone Mode - Clear unique fields if needed
                setValues({
                    ...values,
                    ...initialValues,
                    batchNo: '', // Batch No must be unique
                    supplierId: initialValues.supplier?.id || initialValues.supplierId || '',
                    quantity: String(initialValues.quantity),
                    costPerUnit: String(initialValues.costPerUnit || ''),
                    qualityScore: String(initialValues.qualityScore),
                    moistureContent: String(initialValues.moistureContent || ''),
                    receivedDate: new Date().toISOString().split('T')[0], // Reset date for new batch
                });
            } else {
                // Create Mode
                setValues({
                    batchNo: '',
                    supplierId: '',
                    materialType: 'Cotton Waste',
                    quantity: '',
                    unit: 'kg',
                    costPerUnit: '',
                    qualityScore: '5',
                    moistureContent: '',
                    receivedDate: new Date().toISOString().split('T')[0],
                    warehouseLocationId: '',
                    status: 'IN_STOCK',
                    notes: ''
                });
            }
        }
    }, [open, rawMaterial, initialValues]);

    async function handleSubmit() {
        if (!values.batchNo || !values.supplierId || !values.quantity) {
            notify.showError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...values,
                quantity: Number(values.quantity),
                costPerUnit: Number(values.costPerUnit),
                qualityScore: Number(values.qualityScore),
                moistureContent: values.moistureContent ? Number(values.moistureContent) : undefined,
                receivedDate: new Date(values.receivedDate).toISOString(),
            };

            if (rawMaterial) {
                await http.patch(`/raw-materials/${rawMaterial.id}`, payload);
                notify.showSuccess('Raw material updated successfully');
            } else {
                await http.post('/raw-materials', payload);
                notify.showSuccess('Raw material added to stock');
            }
            onSave();
        } catch (err: any) {
            // Handled by global interceptor
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{rawMaterial ? 'Edit Batch' : (initialValues ? 'Clone Batch' : 'Add Raw Material')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <TextField
                        label="Batch No"
                        value={values.batchNo}
                        onChange={e => setValues({ ...values, batchNo: e.target.value })}
                        required
                        helperText={initialValues ? "Enter new batch number" : ""}
                    />
                    <TextField
                        select
                        label="Supplier"
                        value={values.supplierId}
                        onChange={e => setValues({ ...values, supplierId: e.target.value })}
                        required
                    >
                        {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </TextField>
                    <TextField
                        select
                        label="Material Type"
                        value={values.materialType}
                        onChange={e => setValues({ ...values, materialType: e.target.value })}
                    >
                        {['Cotton Waste', 'Comber Noil', 'Flat Strips', 'Droppings'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={values.quantity}
                            onChange={e => setValues({ ...values, quantity: e.target.value })}
                            required
                            InputProps={{ endAdornment: <span style={{ marginLeft: 8, fontSize: 12 }}>{values.unit}</span> }}
                        />
                        <TextField
                            label="Cost Per Unit"
                            type="number"
                            value={values.costPerUnit}
                            onChange={e => setValues({ ...values, costPerUnit: e.target.value })}
                            required
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            label="Quality Score (1-10)"
                            type="number"
                            inputProps={{ min: 1, max: 10, step: 0.1 }}
                            value={values.qualityScore}
                            onChange={e => setValues({ ...values, qualityScore: e.target.value })}
                            required
                        />
                        <TextField
                            label="Moisture (%)"
                            type="number"
                            value={values.moistureContent}
                            onChange={e => setValues({ ...values, moistureContent: e.target.value })}
                        />
                    </Box>

                    <TextField
                        label="Received Date"
                        type="date"
                        value={values.receivedDate}
                        onChange={e => setValues({ ...values, receivedDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        select
                        label="Warehouse Location"
                        value={values.warehouseLocationId}
                        onChange={e => setValues({ ...values, warehouseLocationId: e.target.value })}
                        helperText="Assign to a storage location"
                    >
                        <MenuItem value=""><em>None / Unassigned</em></MenuItem>
                        {warehouses.map(w => (
                            <Box key={w.id}>
                                <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold' }}>{w.name}</MenuItem>
                                {(w.locations || []).map((l: any) => (
                                    <MenuItem key={l.id} value={l.id} sx={{ pl: 4 }}>
                                        {l.code} ({l.zone || 'No Zone'})
                                    </MenuItem>
                                ))}
                            </Box>
                        ))}
                    </TextField>

                    <TextField
                        label="Notes"
                        multiline
                        rows={2}
                        value={values.notes}
                        onChange={e => setValues({ ...values, notes: e.target.value })}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving...' : (rawMaterial ? 'Update' : 'Save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
