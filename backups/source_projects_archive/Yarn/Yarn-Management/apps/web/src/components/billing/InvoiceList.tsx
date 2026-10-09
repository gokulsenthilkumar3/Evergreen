import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Chip,
    Typography
} from '@mui/material';
import { TextField, InputAdornment } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { http } from '../../lib/http';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import ResponsiveTable, { Column } from '../common/ResponsiveTable';
import FilterToolbar from '../common/FilterToolbar';
import MultiSelectFilter from '../common/MultiSelectFilter';
import DateRangePicker from '../common/DateRangePicker';

type Invoice = {
    id: string;
    invoiceNumber: string;
    date: string;
    customer: { name: string };
    totalAmount: string;
    status: string;
};

export default function InvoiceList() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCreate, setOpenCreate] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<(string | number)[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    async function load() {
        setLoading(true);
        try {
            const res = await http.get('/billing/invoices');
            setInvoices(res.data.invoices);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        return invoices.filter(inv => {
            const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(inv.status);

            let matchesDate = true;
            if (startDate && endDate) {
                const invDate = new Date(inv.date).getTime();
                const start = new Date(startDate).getTime();
                const end = new Date(endDate).getTime();
                matchesDate = invDate >= start && invDate <= end;
            }

            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices, searchQuery, statusFilter, startDate, endDate]);

    const paginated = useMemo(() => {
        return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    const columns: Column<Invoice>[] = [
        { id: 'invoiceNumber', label: 'Invoice #', minWidth: 100 },
        { id: 'date', label: 'Date', format: (val) => new Date(val).toLocaleDateString() },
        { id: 'customer', label: 'Customer', format: (_val, row) => row.customer?.name || '-' },
        { id: 'totalAmount', label: 'Total', format: (val) => Number(val).toFixed(2) },
        { id: 'status', label: 'Status', format: (val) => <Chip label={val} size="small" /> }
    ];

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Invoices</Typography>
                <Button variant="contained" onClick={() => setOpenCreate(true)}>New Invoice</Button>
            </Box>

            <FilterToolbar
                onClear={() => {
                    setSearchQuery('');
                    setStatusFilter([]);
                    setStartDate('');
                    setEndDate('');
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search Invoice, Customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 250 }}
                />

                <MultiSelectFilter
                    label="Status"
                    options={[
                        { value: 'Paid', label: 'Paid' },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Overdue', label: 'Overdue' },
                        { value: 'Draft', label: 'Draft' },
                    ]}
                    selected={statusFilter}
                    onChange={setStatusFilter}
                />

                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                />
            </FilterToolbar>


            <ResponsiveTable
                columns={columns}
                rows={paginated}
                keyField="id"
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                count={filtered.length}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                mobileMainField="invoiceNumber"
                mobileSecondaryField="date"
            />

            <CreateInvoiceDialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSave={() => { setOpenCreate(false); load(); }}
            />
        </Box>
    );
}
