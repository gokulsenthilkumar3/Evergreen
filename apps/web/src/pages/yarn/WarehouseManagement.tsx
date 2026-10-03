import React, { useState } from 'react';
import {
  Add as AddIcon,
  CompareArrows as TransferIcon,
  Refresh as RefreshIcon,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../utils/api';

interface WarehouseLocation {
  id: number;
  name: string;
  zone?: string;
  description?: string;
  active: boolean;
}

interface WarehouseMovement {
  id: number;
  locationId: number;
  location?: { name: string };
  itemId: number;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | string;
  quantity: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

const initialLocationForm = {
  name: '',
  zone: 'Zone A',
  description: '',
};

const initialMovementForm = {
  locationId: '' as number | '',
  itemId: 1,
  movementType: 'IN',
  quantity: 50,
  referenceId: '',
  notes: '',
};

const WarehouseManagement: React.FC = () => {
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openMovementDialog, setOpenMovementDialog] = useState(false);
  const [locationForm, setLocationForm] = useState(initialLocationForm);
  const [movementForm, setMovementForm] = useState(initialMovementForm);

  const queryClient = useQueryClient();

  const {
    data: locations = [],
    isLoading: loadingLoc,
    isRefetching: refetchingLoc,
    error: errorLoc,
  } = useQuery<WarehouseLocation[]>({
    queryKey: ['warehouse-locations'],
    queryFn: () => api.get('/warehouse/locations').then((r) => r.data),
  });

  const {
    data: movements = [],
    isLoading: loadingMov,
    isRefetching: refetchingMov,
    error: errorMov,
  } = useQuery<WarehouseMovement[]>({
    queryKey: ['warehouse-movements'],
    queryFn: () => api.get('/warehouse/movements').then((r) => r.data),
  });

  const createLocationMutation = useMutation({
    mutationFn: (data: typeof locationForm) =>
      api.post('/warehouse/locations', {
        name: data.name.trim(),
        zone: data.zone.trim() || undefined,
        description: data.description.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-locations'] });
      toast.success('Warehouse location added successfully');
      setOpenLocationDialog(false);
      setLocationForm(initialLocationForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add location');
    },
  });

  const createMovementMutation = useMutation({
    mutationFn: (data: typeof movementForm) =>
      api.post('/warehouse/movements', {
        locationId: Number(data.locationId),
        itemId: Number(data.itemId),
        movementType: data.movementType,
        quantity: Number(data.quantity),
        referenceId: data.referenceId.trim() || undefined,
        notes: data.notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-movements'] });
      toast.success('Stock movement logged successfully');
      setOpenMovementDialog(false);
      setMovementForm(initialMovementForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to log stock movement');
    },
  });

  const totalIn = movements
    .filter((m) => m.movementType === 'IN')
    .reduce((s, m) => s + (Number(m.quantity) || 0), 0);
  const totalOut = movements
    .filter((m) => m.movementType === 'OUT')
    .reduce((s, m) => s + (Number(m.quantity) || 0), 0);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarehouseIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Warehouse Management
            </Typography>
            <Typography color="text.secondary">
              Multi-godown stock, bin tracking, internal transfers & dispatch logs
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loadingLoc || loadingMov || refetchingLoc || refetchingMov}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['warehouse-locations'] });
              queryClient.invalidateQueries({ queryKey: ['warehouse-movements'] });
            }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenLocationDialog(true)}
          >
            Add Location
          </Button>

          <Button
            variant="contained"
            startIcon={<TransferIcon />}
            onClick={() => setOpenMovementDialog(true)}
            disabled={locations.length === 0}
          >
            Log Movement
          </Button>
        </Box>
      </Box>

      {(errorLoc || errorMov) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load warehouse records from server.
        </Alert>
      )}

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ACTIVE GODOWNS & BINS
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#3b82f6">
                {locations.length} Locations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL INWARD FLOW
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#059669">
                {totalIn.toLocaleString('en-IN')} units
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL DISPATCH / OUTWARD
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#f59e0b">
                {totalOut.toLocaleString('en-IN')} units
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                LOGGED TRANSACTIONS
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#8b5cf6">
                {movements.length} Movements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warehouse Locations Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
          Storage Locations & Godowns
        </Typography>

        {loadingLoc ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : locations.length === 0 ? (
          <Alert severity="info">
            No storage locations configured yet. Click &quot;Add Location&quot; to set up your godowns
            and bays.
          </Alert>
        ) : (
          <Grid container spacing={2.5}>
            {locations.map((w) => (
              <Grid key={w.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarehouseIcon color="primary" />
                      <Typography fontWeight={800} variant="subtitle1">
                        {w.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={w.zone || 'General'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {w.description || 'No description provided'}
                  </Typography>
                  <Chip
                    label={w.active ? 'Active Godown' : 'Inactive'}
                    size="small"
                    color={w.active ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Stock Movement Log */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Recent Stock Movement & Dispatch Register ({movements.length})
          </Typography>
          {loadingMov && <CircularProgress size={16} />}
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Item / Batch ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Godown / Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Movement Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reference Doc</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingMov ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    No stock movements recorded yet. Click &quot;Log Movement&quot; to create a
                    record.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>Item #{m.itemId}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {m.location?.name || `Location #${m.locationId}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.movementType}
                        size="small"
                        color={
                          m.movementType === 'IN'
                            ? 'success'
                            : m.movementType === 'OUT'
                            ? 'error'
                            : 'info'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>
                        {m.quantity.toLocaleString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.referenceId || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {m.notes || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(m.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Location Dialog */}
      <Dialog
        open={openLocationDialog}
        onClose={() => setOpenLocationDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
          Add Warehouse Location
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Location / Godown Name"
                placeholder="e.g. Raw Cotton Godown #1"
                fullWidth
                size="small"
                required
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Zone / Bay"
                placeholder="Zone A - North Wing"
                fullWidth
                size="small"
                value={locationForm.zone}
                onChange={(e) => setLocationForm({ ...locationForm, zone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                placeholder="Capacity: 500 bales, fire-suppression equipped"
                fullWidth
                multiline
                rows={2}
                size="small"
                value={locationForm.description}
                onChange={(e) =>
                  setLocationForm({ ...locationForm, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenLocationDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!locationForm.name.trim() || createLocationMutation.isPending}
            onClick={() => createLocationMutation.mutate(locationForm)}
          >
            {createLocationMutation.isPending ? 'Saving...' : 'Save Location'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Movement Dialog */}
      <Dialog
        open={openMovementDialog}
        onClose={() => setOpenMovementDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
          Log Stock Movement
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Storage Location</InputLabel>
                <Select
                  value={movementForm.locationId}
                  label="Storage Location"
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, locationId: Number(e.target.value) })
                  }
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name} ({loc.zone || 'General'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Movement Type</InputLabel>
                <Select
                  value={movementForm.movementType}
                  label="Movement Type"
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, movementType: e.target.value })
                  }
                >
                  <MenuItem value="IN">IN (Receipt / Inward)</MenuItem>
                  <MenuItem value="OUT">OUT (Dispatch / Outward)</MenuItem>
                  <MenuItem value="TRANSFER">TRANSFER (Internal Relocation)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label="Item / Batch Reference ID"
                fullWidth
                size="small"
                required
                value={movementForm.itemId}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, itemId: Number(e.target.value) || 1 })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label="Quantity (kg / bags / units)"
                fullWidth
                size="small"
                required
                value={movementForm.quantity}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, quantity: Number(e.target.value) || 0 })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Reference Doc / Delivery Challan"
                placeholder="DC-2026-092"
                fullWidth
                size="small"
                value={movementForm.referenceId}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, referenceId: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Notes"
                placeholder="Pallet #4, verified by supervisor"
                fullWidth
                size="small"
                value={movementForm.notes}
                onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenMovementDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              !movementForm.locationId ||
              !movementForm.quantity ||
              createMovementMutation.isPending
            }
            onClick={() => createMovementMutation.mutate(movementForm)}
          >
            {createMovementMutation.isPending ? 'Logging...' : 'Save Movement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseManagement;
