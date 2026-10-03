import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    Chip,
    Typography,
    IconButton,
    TextField,
    Popover,
    Checkbox,
    FormControlLabel,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useTablePreferences } from '../hooks/useTablePreferences';
import { http } from '../lib/http';
import RawMaterialForm from './RawMaterialForm';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { notify } from '../context/NotificationContext';
import ResponsiveTable, { Column } from './common/ResponsiveTable';
import FilterToolbar from './common/FilterToolbar';
import MultiSelectFilter from './common/MultiSelectFilter';
import BulkImportDialog from './common/BulkImportDialog';
import DateRangePicker from './common/DateRangePicker';

type RawMaterial = {
    id: string;
    batchNo: string;
    materialType: string;
    quantity: string;
    unit: string;
    qualityScore: string;
    status: string;
    supplier: { name: string };
    receivedDate: string;
    productionBatches: { batchNumber: string }[];
    costPerUnit?: string;
    moistureContent?: string;
    warehouseLocation?: { code: string; warehouse?: { name: string } };
    legacyLocation?: string;
    notes?: string;
};

export default function RawMaterialList() {
    const [data, setData] = useState<RawMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<RawMaterial | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [selected, setSelected] = useState<(string | number)[]>([]);
    const [bulkDeleteConfirmationOpen, setBulkDeleteConfirmationOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<(string | number)[]>([]);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [editing, setEditing] = useState<RawMaterial | undefined>();
    const [initialValues, setInitialValues] = useState<any | undefined>();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [qrOpen, setQrOpen] = useState(false);
    const [qrData, setQrData] = useState<string | null>(null);
    const [qrTitle, setQrTitle] = useState('');

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { toggleColumn, isVisible } = useTablePreferences('raw-materials', [
        'batchNo', 'supplier', 'type', 'quantity', 'cost', 'quality', 'moisture', 'location', 'batches', 'status', 'received', 'notes', 'actions'
    ]);

    // Process Data
    const processed = useMemo(() => {
        return data
            .filter(row => {
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch =
                    (row.batchNo || '').toLowerCase().includes(searchLower) ||
                    (row.supplier?.name || '').toLowerCase().includes(searchLower) ||
                    (row.materialType || '').toLowerCase().includes(searchLower);
                const matchesStatus = statusFilter.length === 0 || statusFilter.includes(row.status);

                let matchesDate = true;
                if (dateRange.start && dateRange.end) {
                    const rowDate = new Date(row.receivedDate);
                    const start = new Date(dateRange.start);
                    const end = new Date(dateRange.end);
                    end.setHours(23, 59, 59, 999);
                    matchesDate = rowDate >= start && rowDate <= end;
                }

                return matchesSearch && matchesStatus && matchesDate;
            })
            // Default sort by received date desc
            .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());
    }, [data, searchQuery, statusFilter, dateRange.start, dateRange.end]);

    // Pagination Data
    const paginatedData = useMemo(() => {
        return processed.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [processed, page, rowsPerPage]);

    async function load() {
        setLoading(true);
        try {
            const res = await http.get('/raw-materials');
            setData(res.data.rawMaterials);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await http.delete(`/raw-materials/${deleteTarget.id}`);
            notify.showSuccess(`Raw Material Batch "${deleteTarget.batchNo}" has been successfully deleted.`);
            setDeleteTarget(null);
            load();
        } catch {
            notify.showError('Could not delete the raw material batch');
        } finally {
            setDeleting(false);
        }
    }

    async function handleBulkDeleteClick() {
        if (selected.length === 0) return;
        setBulkDeleteConfirmationOpen(true);
    }

    async function handleBulkDeleteConfirm() {
        setBulkDeleteConfirmationOpen(false);
        setBulkDeleting(true);
        try {
            await Promise.all(selected.map(id => http.delete(`/raw-materials/${id}`)));
            notify.showSuccess(`${selected.length} items deleted successfully`);
            setSelected([]);
            load();
        } catch (err: any) {
            notify.showError("Failed to delete some items");
        } finally {
            setBulkDeleting(false);
        }
    }

    const handleShowQr = async (text: string, title: string) => {
        try {
            const res = await http.get(`/inventory/qrcode?text=${encodeURIComponent(text)}`);
            setQrData(res.data.dataUrl);
            setQrTitle(title);
            setQrOpen(true);
        } catch (e) { notify.showError('Failed to generate QR'); }
    };

    const columns: Column<RawMaterial>[] = [
        { id: 'batchNo', label: 'Batch No', minWidth: 100 },
        { id: 'supplier', label: 'Supplier', format: (_val, row) => row.supplier?.name || '-' },
        { id: 'materialType', label: 'Type' },
        { id: 'quantity', label: 'Quantity', format: (val, row) => `${val} ${row.unit}` },
        { id: 'cost', label: 'Cost', format: (_val, row) => row.costPerUnit || '-' },
        { id: 'quality', label: 'Quality', format: (_val, row) => row.qualityScore ? Number(row.qualityScore).toFixed(1) : '-' },
        { id: 'moisture', label: 'Moisture', format: (_val, row) => row.moistureContent ? `${row.moistureContent}%` : '-' },
        { id: 'location', label: 'Location', format: (_val, row) => (row.warehouseLocation?.code ? `${row.warehouseLocation.warehouse?.name} - ${row.warehouseLocation.code}` : row.legacyLocation || '-') },
        {
            id: 'batches',
            label: 'Prod. Batches',
            format: (_val, row) => (
                <Typography variant="caption">
                    {row.productionBatches?.map(b => b.batchNumber).join(', ') || '-'}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'Status',
            format: (val) => <Chip label={val} size="small" />
        },
        {
            id: 'received',
            label: 'Received',
            format: (_val, row) => new Date(row.receivedDate).toLocaleDateString()
        },
        { id: 'notes', label: 'Notes', format: (_val, row) => row.notes || '-' },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            format: (_val, row) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditing(row);
                            setInitialValues(undefined);
                            setFormOpen(true);
                        }}
                        title="Edit"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="info"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditing(undefined);
                            setInitialValues(row);
                            setFormOpen(true);
                        }}
                        title="Clone"
                    >
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleShowQr(row.id, `Material Batch: ${row.batchNo}`);
                        }}
                        title="View QR Code"
                    >
                        <QrCodeIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(row);
                        }}
                        title="Delete"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ];

    // Filter columns based on user preferences
    // Mapping table preference IDs to column IDs (logic from previous implementation)
    // Previous implementation used explicit check: isVisible('batchNo') -> render cell
    // Here we filter the columns array.
    // Note: Column IDs in 'columns' array usually match the preference IDs.
    // Let's verify:
    // Prefs: 'batchNo', 'supplier', 'type'...
    // Columns: 'batchNo', 'supplier', 'materialType'... -> 'materialType' != 'type'
    // I need to align them.

    // Aligned Columns Definition with 'id' matching useTablePreferences keys where possible, or mapping them.
    // The previous implementation used:
    // { id: 'batchNo', label: 'Batch No' },
    // { id: 'supplier', label: 'Supplier' },
    // { id: 'type', label: 'Type' },
    // ...
    // So I should use 'type' as id in my columns array, but access 'materialType' in format or row?
    // ResponsiveTable uses `row[col.id]` if no format.
    // So I should use `id: 'materialType'` but mapped to preference `type`.

    // Better strategy: Use the ID that matches the row property for ResponsiveTable, and map the preference check.

    const visibleTableColumns = columns.filter(col => {
        // Map column ID to preference ID if they differ
        let prefId = col.id as string;
        if (col.id === 'materialType') prefId = 'type';
        if (col.id === 'costPerUnit') prefId = 'cost'; // Wait, col.id used above is 'cost'
        if (col.id === 'cost') prefId = 'cost';
        if (col.id === 'qualityScore') prefId = 'quality'; // above used 'quality'
        if (col.id === 'quality') prefId = 'quality';
        if (col.id === 'warehouseLocation') prefId = 'location';
        if (col.id === 'productionBatches') prefId = 'batches';
        if (col.id === 'receivedDate') prefId = 'received';

        // In my new columns definition above, I used IDs like 'cost', 'quality' which don't exist on row directly but work because I provided a format function.
        // But ResponsiveTable tries to access row[col.id] first.
        // If row[col.id] is undefined, it's fine if format handles it.

        return isVisible(prefId);
    });

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h6">Raw Materials Inventory</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {selected.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleBulkDeleteClick}
                            size="small"
                            disabled={bulkDeleting}
                        >
                            Delete ({selected.length})
                        </Button>
                    )}
                    <Button variant="outlined" onClick={() => setImportOpen(true)}>Import</Button>
                    <Button variant="contained" onClick={() => {
                        setEditing(undefined);
                        setInitialValues(undefined);
                        setFormOpen(true);
                    }}>Add Stock</Button>
                </Box>
            </Box>

            <FilterToolbar
                pageKey="raw-materials"
                currentFilters={{ searchQuery, statusFilter, dateRange }}
                onPresetLoad={(filters) => {
                    if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery);
                    if (filters.statusFilter !== undefined) setStatusFilter(filters.statusFilter);
                    if (filters.dateRange !== undefined) setDateRange(filters.dateRange);
                }}
                onClear={() => {
                    setSearchQuery('');
                    setStatusFilter([]);
                    setDateRange({ start: '', end: '' });
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search Batch, Supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <FilterListIcon sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{ width: 250 }}
                />

                <MultiSelectFilter
                    label="Status"
                    options={[
                        { value: 'IN_STOCK', label: 'In Stock' },
                        { value: 'USED', label: 'Used' },
                        { value: 'DEPLETED', label: 'Depleted' },
                    ]}
                    selected={statusFilter}
                    onChange={setStatusFilter}
                />

                <DateRangePicker
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onChange={(start, end) => setDateRange({ start, end })}
                />

                <Button
                    variant="outlined"
                    startIcon={<ViewColumnIcon />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                >
                    Cols
                </Button>
                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Visible Columns</Typography>
                        {[
                            { id: 'batchNo', label: 'Batch No' },
                            { id: 'supplier', label: 'Supplier' },
                            { id: 'type', label: 'Type' },
                            { id: 'quantity', label: 'Quantity' },
                            { id: 'cost', label: 'Cost' },
                            { id: 'quality', label: 'Quality' },
                            { id: 'moisture', label: 'Moisture' },
                            { id: 'location', label: 'Location' },
                            { id: 'batches', label: 'Prod. Batches' },
                            { id: 'status', label: 'Status' },
                            { id: 'received', label: 'Received' },
                            { id: 'notes', label: 'Notes' },
                            { id: 'actions', label: 'Actions' },
                        ].map((col) => (
                            <FormControlLabel
                                key={col.id}
                                control={
                                    <Checkbox
                                        checked={isVisible(col.id)}
                                        onChange={() => toggleColumn(col.id)}
                                        size="small"
                                    />
                                }
                                label={col.label}
                            />
                        ))}
                    </Box>
                </Popover>
            </FilterToolbar>

            {/* Active Filters Summary */}
            {(searchQuery || statusFilter.length > 0 || dateRange.start) && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Active Filters:</Typography>

                    {searchQuery && (
                        <Chip
                            label={`Search: "${searchQuery}"`}
                            onDelete={() => setSearchQuery('')}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}

                    {statusFilter.map(status => (
                        <Chip
                            key={status}
                            label={`Status: ${status}`}
                            onDelete={() => setStatusFilter(statusFilter.filter(s => s !== status))}
                            size="small"
                            color="secondary"
                            variant="outlined"
                        />
                    ))}

                    {dateRange.start && (
                        <Chip
                            label={`Date: ${dateRange.start} - ${dateRange.end || 'Now'}`}
                            onDelete={() => setDateRange({ start: '', end: '' })}
                            size="small"
                            color="info"
                            variant="outlined"
                        />
                    )}

                    <Button
                        size="small"
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter([]);
                            setDateRange({ start: '', end: '' });
                        }}
                        sx={{ ml: 'auto' }}
                    >
                        Clear All
                    </Button>
                </Box>
            )}

            <ResponsiveTable
                columns={visibleTableColumns}
                rows={paginatedData}
                keyField="id"
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                count={processed.length}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                mobileMainField="batchNo"
                mobileSecondaryField="supplier"
                selectable
                selected={selected}
                onSelectionChange={setSelected}
            />

            <RawMaterialForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSave={() => {
                    setFormOpen(false);
                    load();
                }}
                rawMaterial={editing}
                initialValues={initialValues}
            />

            <BulkImportDialog
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onSuccess={load}
                entityName="Raw Materials"
                endpoint="/raw-materials/import"
                templateUrl="/raw-materials/import/template"
            />

            <ConfirmDeleteDialog
                open={!!deleteTarget}
                title="Raw Material Batch"
                name={deleteTarget?.batchNo || ''}
                loading={deleting}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            <ConfirmDeleteDialog
                open={bulkDeleteConfirmationOpen}
                title="Delete Raw Materials"
                name={`${selected.length} items`}
                description={
                    <>
                        Are you sure you want to delete <strong>{selected.length}</strong> selected items?
                        <br />
                        This action cannot be undone.
                    </>
                }
                loading={bulkDeleting}
                onConfirm={handleBulkDeleteConfirm}
                onClose={() => setBulkDeleteConfirmationOpen(false)}
            />

            <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
                <DialogTitle>{qrTitle}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                    {qrData ? <img src={qrData} alt="QR Code" style={{ width: 250, height: 250 }} /> : <Typography>Generating...</Typography>}
                    <Typography variant="caption" sx={{ mt: 2, fontFamily: 'monospace' }}>Batch Identification SQ Code</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQrOpen(false)}>Close</Button>
                    <Button onClick={() => window.print()} variant="outlined">Print Label</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
