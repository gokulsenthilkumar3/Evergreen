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
    Typography
} from '@mui/material';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
};

export default function StartBatchDialog({ open, onClose, onSave }: Props) {
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [values, setValues] = useState({
        batchNumber: '',
        rawMaterialId: '',
        inputQuantity: ''
    });

    useEffect(() => {
        if (open) {
            http.get('/raw-materials').then(res => {
                // Only show IN_STOCK materials
                const stock = res.data.rawMaterials.filter((r: any) => r.status === 'IN_STOCK');
                setRawMaterials(stock);
            });
            // Generate suggestion for batch number
            setValues(v => ({ ...v, batchNumber: `BATCH-${Date.now().toString().slice(-6)}` }));
        }
    }, [open]);

    async function handleSubmit() {
        try {
            await http.post('/manufacturing/batches', {
                ...values,
                inputQuantity: Number(values.inputQuantity)
            });
            notify.showSuccess(`Batch ${values.batchNumber} started`);
            onSave();
        } catch (err: any) {
            // Handled by global interceptor
        }
    }

    const selectedRM = rawMaterials.find(r => r.id === values.rawMaterialId);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Start Production Batch</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <TextField
                        label="Batch Number"
                        value={values.batchNumber}
                        onChange={e => setValues({ ...values, batchNumber: e.target.value })}
                        required
                    />
                    <TextField
                        select
                        label="Raw Material"
                        value={values.rawMaterialId}
                        onChange={e => setValues({ ...values, rawMaterialId: e.target.value })}
                        required
                        helperText="Select from available stock"
                    >
                        {rawMaterials.map(r => (
                            <MenuItem key={r.id} value={r.id}>
                                {r.batchNo} - {r.materialType} ({r.quantity} {r.unit})
                            </MenuItem>
                        ))}
                    </TextField>

                    {selectedRM && (
                        <Typography variant="body2" color="text.secondary">
                            Available: {selectedRM.quantity} {selectedRM.unit} (Quality: {selectedRM.qualityScore})
                        </Typography>
                    )}

                    <TextField
                        label="Input Quantity"
                        type="number"
                        value={values.inputQuantity}
                        onChange={e => setValues({ ...values, inputQuantity: e.target.value })}
                        required
                        helperText={selectedRM ? `Max: ${selectedRM.quantity}` : ''}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>Start Production</Button>
            </DialogActions>
        </Dialog>
    );
}
