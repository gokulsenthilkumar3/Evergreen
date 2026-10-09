import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Stack
} from '@mui/material';
import { http } from '../../lib/http';
import AddCustomerDialog from './AddCustomerDialog';
import ConfirmDeleteDialog from '../ConfirmDeleteDialog';
import { notify } from '../../context/NotificationContext';
import DeleteIcon from '@mui/icons-material/Delete';
import ResponsiveTable, { Column } from '../common/ResponsiveTable';

type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    gstin: string;
};

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    async function load() {
        setLoading(true);
        try {
            const res = await http.get('/billing/customers');
            setCustomers(res.data.customers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const paginated = useMemo(() => {
        return customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [customers, page, rowsPerPage]);

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await http.delete(`/billing/customers/${deleteTarget.id}`);
            notify.showSuccess(`Customer "${deleteTarget.name}" has been successfully deleted.`);
            setDeleteTarget(null);
            load();
        } catch (err: any) {
            // Handled by global interceptor
        } finally {
            setDeleting(false);
        }
    }

    const columns: Column<Customer>[] = [
        { id: 'name', label: 'Name', minWidth: 150 },
        { id: 'email', label: 'Email', format: (val) => val || '-' },
        { id: 'phone', label: 'Phone', format: (val) => val || '-' },
        { id: 'gstin', label: 'GSTIN', format: (val) => val || '-' },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            format: (_val, row) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton color="error" size="small" onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(row);
                    }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ];

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Customers</Typography>
                <Button variant="contained" onClick={() => setOpenAdd(true)}>Add Customer</Button>
            </Box>

            <ResponsiveTable
                columns={columns}
                rows={paginated}
                keyField="id"
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                count={customers.length}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                mobileMainField="name"
                mobileSecondaryField="email"
            />

            <AddCustomerDialog
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSave={() => { setOpenAdd(false); load(); notify.showSuccess('Customer added successfully'); }}
            />

            <ConfirmDeleteDialog
                open={!!deleteTarget}
                title="Customer"
                name={deleteTarget?.name || ''}
                loading={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </Box>
    );
}
