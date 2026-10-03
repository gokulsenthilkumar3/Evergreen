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
    Typography,
    Divider
} from '@mui/material';
import { http } from '../../lib/http';

type Props = {
    open: boolean;
    batch: any;
    onClose: () => void;
    onSave: () => void;
};

const STAGES = [
    'PLANNED', 'MIXING', 'CARDING', 'DRAWING', 'ROVING', 'SPINNING', 'WINDING', 'COMPLETED'
];

const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function EditBatchDialog({ open, batch, onClose, onSave }: Props) {
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [values, setValues] = useState({
        batchNumber: '',
        rawMaterialId: '',
        inputQuantity: '',
        currentStage: '',
        status: ''
    });

    useEffect(() => {
        if (open && batch) {
            setValues({
                batchNumber: batch.batchNumber,
                rawMaterialId: batch.rawMaterialId || '',
                inputQuantity: String(batch.inputQuantity),
                currentStage: batch.currentStage,
                status: batch.status
            });

            http.get('/raw-materials').then(res => {
                const stock = res.data.rawMaterials.filter((r: any) =>
                    r.status === 'IN_STOCK' || r.id === batch.rawMaterialId
                );
                setRawMaterials(stock);
            });
        }
    }, [open, batch]);

    async function handleSubmit() {
        try {
            await http.patch(`/manufacturing/batches/${batch.id}`, {
                ...values,
                inputQuantity: Number(values.inputQuantity)
            });
            onSave();
        } catch (err: any) {
            // Handled by global interceptor
        }
    }

    const selectedRM = rawMaterials.find(r => r.id === values.rawMaterialId);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Production Batch</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <Typography variant="overline" color="text.secondary">General Info</Typography>
                    <TextField
                        label="Batch Number"
                        value={values.batchNumber}
                        onChange={e => setValues({ ...values, batchNumber: e.target.value })}
                        required
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            select
                            label="Raw Material"
                            value={values.rawMaterialId}
                            onChange={e => setValues({ ...values, rawMaterialId: e.target.value })}
                            required
                            fullWidth
                        >
                            {rawMaterials.map(r => (
                                <MenuItem key={r.id} value={r.id}>
                                    {r.batchNo} - {r.materialType} ({r.quantity} {r.unit})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Input Quantity"
                            type="number"
                            value={values.inputQuantity}
                            onChange={e => setValues({ ...values, inputQuantity: e.target.value })}
                            required
                            fullWidth
                            helperText={selectedRM ? `Available: ${selectedRM.quantity} ${selectedRM.unit}` : ''}
                        />
                    </Box>

                    <Divider sx={{ my: 1 }} />
                    <Typography variant="overline" color="text.secondary">Operational Status</Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            select
                            label="Current Stage"
                            value={values.currentStage}
                            onChange={e => setValues({ ...values, currentStage: e.target.value })}
                            fullWidth
                        >
                            {STAGES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                        <TextField
                            select
                            label="Batch Status"
                            value={values.status}
                            onChange={e => setValues({ ...values, status: e.target.value })}
                            fullWidth
                        >
                            {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} sx={{ px: 4 }}>Save Changes</Button>
            </DialogActions>
        </Dialog>
    );
}
