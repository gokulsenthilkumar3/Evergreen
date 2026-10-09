import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Popover,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GetAppIcon from '@mui/icons-material/GetApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';
import SupplierForm from './SupplierForm';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useTablePreferences } from '../hooks/useTablePreferences';
import ResponsiveTable, { Column } from './common/ResponsiveTable';
import FilterToolbar from './common/FilterToolbar';
import MultiSelectFilter from './common/MultiSelectFilter';
import BulkImportDialog from './common/BulkImportDialog';

type Supplier = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  status: string;
};

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | undefined>();
  const [initialValues, setInitialValues] = useState<Omit<Supplier, 'id'> | undefined>();

  // Pagination State (0-indexed for TablePagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(string | number)[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [bulkDeleteConfirmationOpen, setBulkDeleteConfirmationOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const { toggleColumn, isVisible } = useTablePreferences('suppliers', ['name', 'email', 'phone', 'gstin', 'terms', 'rating', 'status', 'actions']);

  // Filter and Sort suppliers
  const processed = useMemo(() => {
    return suppliers
      .filter((s) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          s.name.toLowerCase().includes(searchLower) ||
          (s.email && s.email.toLowerCase().includes(searchLower)) ||
          (s.phone && s.phone.includes(searchQuery)) ||
          (s.gstin && s.gstin.toLowerCase().includes(searchLower)) ||
          (s.address && s.address.toLowerCase().includes(searchLower));

        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(s.status);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers, searchQuery, statusFilter]);

  const paginated = useMemo(() => {
    return processed.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [processed, page, rowsPerPage]);

  async function load() {
    setLoading(true);
    try {
      const res = await http.get('/suppliers');
      setSuppliers(res.data.suppliers);
    } catch (err: any) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'info';
      case 'On Hold': return 'warning';
      case 'Blacklisted': return 'error';
      default: return 'default';
    }
  };

  function handleOpenForm(supplier?: Supplier) {
    setEditing(supplier);
    setInitialValues(undefined);
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditing(undefined);
    setInitialValues(undefined);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await http.delete(`/suppliers/${deleteTarget.id}`);
      notify.showSuccess(`Supplier "${deleteTarget.name}" has been successfully deleted.`);
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      notify.showError(`Could not delete supplier "${deleteTarget.name}"`);
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
      await Promise.all(selected.map(id => http.delete(`/suppliers/${id}`)));
      notify.showSuccess(`${selected.length} suppliers deleted successfully`);
      setSelected([]);
      load();
    } catch (err: any) {
      notify.showError("Failed to delete some suppliers");
    } finally {
      setBulkDeleting(false);
    }
  }

  function handleSave() {
    load();
    handleCloseForm();
  }

  async function exportToCsv() {
    try {
      const csv = [
        'Name,Email,Phone,Address,GSTIN,Payment Terms,Rating,Notes,Status',
        ...processed.map((s) =>
          [s.name, s.email || '', s.phone || '', s.address || '', s.gstin || '', s.paymentTerms || '', s.rating ?? '', s.notes || '', s.status]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(',')
        ),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      notify.showError('Export failed');
    }
  }

  const columns: Column<Supplier>[] = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'email', label: 'Email', format: (_val, row) => row.email || '-' },
    { id: 'phone', label: 'Phone', format: (_val, row) => row.phone || '-' },
    { id: 'address', label: 'Address', format: (_val, row) => row.address || '-' },
    { id: 'gstin', label: 'GSTIN', format: (_val, row) => row.gstin || '-' },
    { id: 'paymentTerms', label: 'Terms', format: (_val, row) => row.paymentTerms || '-' },
    { id: 'rating', label: 'Rating', format: (_val, row) => row.rating ?? '-' },
    { id: 'notes', label: 'Notes', format: (_val, row) => row.notes || '-' },
    {
      id: 'status',
      label: 'Status',
      format: (val) => (
        <Chip
          label={val}
          size="small"
          color={getStatusColor(val) as any}
          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, minWidth: 80 }}
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      format: (_val, row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton onClick={(e) => { e.stopPropagation(); handleOpenForm(row); }} size="small" title="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              const rest: Omit<Supplier, 'id'> & { id?: string } = { ...row };
              delete rest.id;
              setEditing(undefined);
              setInitialValues(rest);
              setFormOpen(true);
            }}
            title="Clone"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
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

  const visibleTableColumns = columns.filter(col => {
    let prefId = col.id as string;
    if (col.id === 'paymentTerms') prefId = 'terms';
    return isVisible(prefId);
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Suppliers</Typography>
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
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            onClick={exportToCsv}
            size="small"
          >
            Export
          </Button>
          <Button
            variant="outlined"
            onClick={() => setImportOpen(true)}
            size="small"
          >
            Import
          </Button>
          <Button variant="contained" onClick={() => {
            setEditing(undefined);
            setInitialValues(undefined);
            setFormOpen(true);
          }} size="small">
            Add Supplier
          </Button>
        </Box>
      </Box>

      <FilterToolbar
        pageKey="suppliers"
        currentFilters={{ searchQuery, statusFilter }}
        onPresetLoad={(filters) => {
          if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery);
          if (filters.statusFilter !== undefined) setStatusFilter(filters.statusFilter);
        }}
        onClear={() => {
          setSearchQuery('');
          setStatusFilter([]);
        }}
      >
        <TextField
          size="small"
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <FilterListIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
          sx={{ width: 250 }}
        />

        <MultiSelectFilter
          label="Status"
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' },
            { value: 'On Hold', label: 'On Hold' },
            { value: 'Blacklisted', label: 'Blacklisted' },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
        />

        <Button
          variant="outlined"
          startIcon={<ViewColumnIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
        >
          Columns
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
              { id: 'name', label: 'Name' },
              { id: 'email', label: 'Email' },
              { id: 'phone', label: 'Phone' },
              { id: 'address', label: 'Address' },
              { id: 'gstin', label: 'GSTIN' },
              { id: 'terms', label: 'Terms' },
              { id: 'rating', label: 'Rating' },
              { id: 'notes', label: 'Notes' },
              { id: 'status', label: 'Status' },
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

      <ResponsiveTable
        columns={visibleTableColumns}
        rows={paginated}
        keyField="id"
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        count={processed.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}

        mobileMainField="name"
        mobileSecondaryField="email"
        selectable
        selected={selected}
        onSelectionChange={setSelected}
      />

      <SupplierForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        supplier={editing}
        initialValues={initialValues}
      />

      <BulkImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={load}
        entityName="Suppliers"
        endpoint="/suppliers/import"
        templateUrl="/suppliers/import/template"
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Supplier"
        name={deleteTarget?.name || ''}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDeleteDialog
        open={bulkDeleteConfirmationOpen}
        title="Delete Suppliers"
        name={`${selected.length} suppliers`}
        description={
          <>
            Are you sure you want to delete <strong>{selected.length}</strong> selected suppliers?
            <br />
            This action cannot be undone.
          </>
        }
        loading={bulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirmationOpen(false)}
      />
    </Box>
  );
}
