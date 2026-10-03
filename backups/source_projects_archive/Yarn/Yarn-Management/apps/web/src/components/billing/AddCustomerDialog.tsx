import { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import { http } from '../../lib/http';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
};

export default function AddCustomerDialog({ open, onClose, onSave }: Props) {
    const [values, setValues] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        gstin: ''
    });

    async function handleSubmit() {
        try {
            await http.post('/billing/customers', values);
            onSave();
        } catch (err: any) {
            // Handled by global interceptor
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
                    <TextField
                        label="Name"
                        value={values.name}
                        onChange={e => setValues({ ...values, name: e.target.value })}
                        required
                    />
                    <TextField
                        label="Email"
                        value={values.email}
                        onChange={e => setValues({ ...values, email: e.target.value })}
                    />
                    <TextField
                        label="Phone"
                        value={values.phone}
                        onChange={e => setValues({ ...values, phone: e.target.value })}
                    />
                    <TextField
                        label="GSTIN (Tax ID)"
                        value={values.gstin}
                        onChange={e => setValues({ ...values, gstin: e.target.value })}
                    />
                    <TextField
                        label="Address"
                        value={values.address}
                        onChange={e => setValues({ ...values, address: e.target.value })}
                        multiline rows={2}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>Add Customer</Button>
            </DialogActions>
        </Dialog>
    );
}
