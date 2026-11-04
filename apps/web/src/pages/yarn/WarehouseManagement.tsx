import { uiText, useUiLanguage, uiLocale, uiTemplate, uiScopedTemplate, uiDateLocale } from "../../i18n";
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
  toLocationId: '' as number | '',
  itemId: '' as number | '',
  movementType: 'IN',
  quantity: 50,
  referenceId: '',
  notes: '',
};

const WarehouseManagement: React.FC = () => {
  useUiLanguage();
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
  const { data: catalogue = [] } = useQuery<Array<{ id: number; name: string; type: string; uom: string; active: boolean }>>({ queryKey: ['commerce-items'], queryFn: () => api.get('/commerce/items').then(r => r.data) });

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
      toast.success(uiText('Warehouse location added successfully', 'feedback'));
      setOpenLocationDialog(false);
      setLocationForm(initialLocationForm);
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to add location', 'feedback'));
    },
  });

  const createMovementMutation = useMutation({
    mutationFn: (data: typeof movementForm) =>
      api.post('/warehouse/movements', {
        locationId: Number(data.locationId),
        itemId: Number(data.itemId),
        toLocationId: data.movementType === 'TRANSFER' ? Number(data.toLocationId) : undefined,
        movementType: data.movementType,
        quantity: Number(data.quantity),
        referenceId: data.referenceId.trim() || undefined,
        notes: data.notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-movements'] });
      toast.success(uiText('Stock movement logged successfully', 'feedback'));
      setOpenMovementDialog(false);
      setMovementForm(initialMovementForm);
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to log stock movement', 'feedback'));
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
              {uiText("Warehouse Management ")}</Typography>
            <Typography color="text.secondary">
              {uiText("Multi-godown stock, bin tracking, internal transfers & dispatch logs ")}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loadingLoc || loadingMov || refetchingLoc || refetchingMov}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['warehouse-locations'] });
              queryClient.invalidateQueries({ queryKey: ['warehouse-movements'] });
            }}
          >
            {uiText("Refresh ")}</Button>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenLocationDialog(true)}
          >
            {uiText("Add Location ")}</Button>

          <Button
            variant="contained"
            startIcon={<TransferIcon />}
            onClick={() => setOpenMovementDialog(true)}
            disabled={locations.length === 0}
          >
            {uiText("Log Movement ")}</Button>
        </Box>
      </Box>

      {(errorLoc || errorMov) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uiText("Failed to load warehouse records from server. ")}</Alert>
      )}

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("ACTIVE GODOWNS & BINS ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#3b82f6">
                {locations.length} {uiText(" Locations ")}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("TOTAL INWARD FLOW ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#059669">
                {totalIn.toLocaleString(uiLocale())} {uiText(" units ")}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("TOTAL DISPATCH / OUTWARD ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#f59e0b">
                {totalOut.toLocaleString(uiLocale())} {uiText(" units ")}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("LOGGED TRANSACTIONS ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#8b5cf6">
                {movements.length} {uiText(" Movements ")}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warehouse Locations Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
          {uiText("Storage Locations & Godowns ")}</Typography>

        {loadingLoc ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : locations.length === 0 ? (
          <Alert severity="info">
            {uiText("No storage locations configured yet. Click \"Add Location\" to set up your godowns and bays. ")}</Alert>
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
                    label={w.active ? uiText("Active Godown") : uiText("Inactive")}
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
            {uiText("Recent Stock Movement & Dispatch Register (")}{movements.length})
          </Typography>
          {loadingMov && <CircularProgress size={16} />}
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{uiText("Item / Batch ID", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{uiText("Godown / Location", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{uiText("Movement Type", 'tables')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {uiText("Quantity ", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{uiText("Reference Doc", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{uiText("Notes", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{uiText("Timestamp", 'tables')}</TableCell>
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
                    {uiText("No stock movements recorded yet. Click \"Log Movement\" to create a record. ", 'tables')}</TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{catalogue.find(item => item.id === m.itemId)?.name || uiScopedTemplate('tables')`Item #${m.itemId}`}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {m.location?.name || uiScopedTemplate('tables')`Location #${m.locationId}`}
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
                        {m.quantity.toLocaleString(uiLocale())}
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
                        {new Date(m.createdAt).toLocaleDateString(uiDateLocale(), {
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
          {uiText("Add Warehouse Location ")}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={uiText("Location / Godown Name", 'forms')}
                placeholder={uiText("e.g. Raw Cotton Godown #1", 'forms')}
                fullWidth
                size="small"
                required
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={uiText("Zone / Bay", 'forms')}
                placeholder={uiText("Zone A - North Wing", 'forms')}
                fullWidth
                size="small"
                value={locationForm.zone}
                onChange={(e) => setLocationForm({ ...locationForm, zone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={uiText("Description", 'forms')}
                placeholder={uiText("Capacity: 500 bales, fire-suppression equipped", 'forms')}
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
            {uiText("Cancel ")}</Button>
          <Button
            variant="contained"
            disabled={!locationForm.name.trim() || createLocationMutation.isPending}
            onClick={() => createLocationMutation.mutate(locationForm)}
          >
            {createLocationMutation.isPending ? uiText("Saving...") : uiText("Save Location")}
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
          {uiText("Log Stock Movement ")}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>{uiText("Storage Location", 'forms')}</InputLabel>
                <Select
                  value={movementForm.locationId}
                  label={uiText("Storage Location", 'forms')}
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
                <InputLabel>{uiText("Movement Type", 'forms')}</InputLabel>
                <Select
                  value={movementForm.movementType}
                  label={uiText("Movement Type", 'forms')}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, movementType: e.target.value })
                  }
                >
                  <MenuItem value="IN">{uiText("IN (Place received stock here)", 'forms')}</MenuItem>
                  <MenuItem value="OUT">{uiText("OUT (Release stock for use)", 'forms')}</MenuItem>
                  <MenuItem value="TRANSFER">{uiText("TRANSFER (Internal Relocation)", 'forms')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {movementForm.movementType === 'TRANSFER' && <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label={uiText("Destination location", 'forms')} fullWidth size="small" value={movementForm.toLocationId} onChange={e => setMovementForm({ ...movementForm, toLocationId: Number(e.target.value) })}>
                {locations.filter(loc => loc.active && loc.id !== movementForm.locationId).map(loc => <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>)}
              </TextField>
            </Grid>}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label={uiText("Stock item", 'forms')}
                fullWidth
                size="small"
                required
                value={movementForm.itemId}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, itemId: Number(e.target.value) || '' })
                }
                helperText={uiText("Locations track existing company stock; they do not create new stock.", 'forms')}
              >{catalogue.filter(item => item.active && item.type !== 'SERVICE').map(item => <MenuItem key={item.id} value={item.id}>{item.name} · {item.uom}</MenuItem>)}</TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label={uiText("Quantity (kg / bags / units)", 'forms')}
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
                label={uiText("Reference Doc / Delivery Challan", 'forms')}
                placeholder={uiText("DC-2026-092", 'forms')}
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
                label={uiText("Notes", 'forms')}
                placeholder={uiText("Pallet #4, verified by supervisor", 'forms')}
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
            {uiText("Cancel ")}</Button>
          <Button
            variant="contained"
            disabled={
              !movementForm.locationId ||
              !movementForm.quantity ||
              createMovementMutation.isPending
            }
            onClick={() => createMovementMutation.mutate(movementForm)}
          >
            {createMovementMutation.isPending ? uiText("Logging...") : uiText("Save Movement")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseManagement;
