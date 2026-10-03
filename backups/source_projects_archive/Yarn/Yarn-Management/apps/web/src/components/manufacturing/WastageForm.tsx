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
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
};

export default function WastageForm({ open, onClose, onSave }: Props) {
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        batchId: '',
        stage: 'SPINNING',
        quantity: '',
        wasteType: 'Hard Waste',
        reason: ''
    });

    useEffect(() => {
        if (open) {
            http.get('/manufacturing/batches').then(res => {
                // Filter only active batches ideally, but for now show all non-completed or recent
                setBatches(res.data.batches.filter((b: any) => b.status !== 'COMPLETED'));
            });
            setValues({
                batchId: '',
                stage: 'SPINNING',
                quantity: '',
                wasteType: 'Hard Waste',
                reason: ''
            });
        }
    }, [open]);

    async function handleSubmit() {
        if (!values.batchId || !values.quantity) {
            notify.showError('Please select a batch and enter quantity');
            return;
        }

        setLoading(true);
        try {
            await http.post('/manufacturing/wastage', {
                ...values,
                quantity: Number(values.quantity)
            });
            notify.showSuccess('Wastage logged successfully');
            onSave();
            onClose();
        } catch (err: any) {
            // Handled by interceptor
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Log Wastage</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <TextField
                        select
                        label="Production Batch"
                        value={values.batchId}
                        onChange={e => setValues({ ...values, batchId: e.target.value })}
                        required
                    >
                        {batches.map(b => (
                            <MenuItem key={b.id} value={b.id}>
                                {b.batchNumber} ({b.currentStage})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Stage"
                        value={values.stage}
                        onChange={e => setValues({ ...values, stage: e.target.value })}
                        required
                    >
                        {['MIXING', 'CARDING', 'DRAWING', 'ROVING', 'SPINNING', 'WINDING'].map(s => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            label="Quantity (kg)"
                            type="number"
                            value={values.quantity}
                            onChange={e => setValues({ ...values, quantity: e.target.value })}
                            required
                        />
                        <TextField
                            select
                            label="Waste Type"
                            value={values.wasteType}
                            onChange={e => setValues({ ...values, wasteType: e.target.value })}
                        >
                            {['Hard Waste', 'Soft Waste', 'Sweepings', 'Invisible Loss'].map(t => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <TextField
                        label="Reason / Notes"
                        multiline
                        rows={2}
                        value={values.reason}
                        onChange={e => setValues({ ...values, reason: e.target.value })}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Logging...' : 'Log Waste'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
