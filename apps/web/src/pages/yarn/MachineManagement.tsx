import { uiText, useUiLanguage, uiLocale, uiTemplate, uiScopedTemplate, uiDateLocale } from "../../i18n";
import React, { useState } from 'react';
import {
  Add as AddIcon,
  Build as MaintenanceIcon,
  PrecisionManufacturing as MachineIcon,
  Refresh as RefreshIcon,
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../utils/api';

interface Machine {
  id: number;
  serialNo?: string;
  name: string;
  type: string;
  manufacturer?: string;
  active: boolean;
  purchasedAt?: string;
  notes?: string;
  inspections?: { type: string; date: string; createdBy?: string }[];
}

interface MachineInspection {
  id: number;
  machineId: number;
  machine?: { name: string; type: string };
  type: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | string;
  cost?: number;
  createdBy?: string;
  date: string;
  resolvedAt?: string;
}

const initialMachineForm = {
  name: '',
  type: 'Ring Frame',
  serialNo: '',
  manufacturer: '',
  purchasedAt: new Date().toISOString().slice(0, 10),
  notes: '',
};

const initialInspectionForm = {
  machineId: '' as number | '',
  type: 'ROUTINE',
  status: 'PENDING',
  description: '',
  cost: 0,
  createdBy: '',
};

const MachineManagement: React.FC = () => {
  useUiLanguage();
  const [tab, setTab] = useState(0);
  const [openMachineDialog, setOpenMachineDialog] = useState(false);
  const [openInspectionDialog, setOpenInspectionDialog] = useState(false);
  const [machineForm, setMachineForm] = useState(initialMachineForm);
  const [inspectionForm, setInspectionForm] = useState(initialInspectionForm);

  const queryClient = useQueryClient();

  const {
    data: machines = [],
    isLoading: loadingMachines,
    isRefetching: refetchingMachines,
    error: machineError,
  } = useQuery<Machine[]>({
    queryKey: ['machines'],
    queryFn: () => api.get('/machines').then((r) => r.data),
  });

  const {
    data: inspections = [],
    isLoading: loadingInsp,
    isRefetching: refetchingInsp,
    error: inspectionError,
  } = useQuery<MachineInspection[]>({
    queryKey: ['machine-inspections'],
    queryFn: () => api.get('/machines/inspections').then((r) => r.data),
  });

  const createMachineMutation = useMutation({
    mutationFn: (newMachine: typeof machineForm) =>
      api.post('/machines', {
        name: newMachine.name.trim(),
        type: newMachine.type.trim(),
        serialNo: newMachine.serialNo.trim() || undefined,
        manufacturer: newMachine.manufacturer.trim() || undefined,
        purchasedAt: newMachine.purchasedAt ? new Date(newMachine.purchasedAt).toISOString() : undefined,
        notes: newMachine.notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      toast.success(uiText('Machine registered successfully', 'feedback'));
      setOpenMachineDialog(false);
      setMachineForm(initialMachineForm);
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to register machine', 'feedback'));
    },
  });

  const createInspectionMutation = useMutation({
    mutationFn: (newInsp: typeof inspectionForm) =>
      api.post('/machines/inspections', {
        machineId: Number(newInsp.machineId),
        type: newInsp.type,
        status: newInsp.status,
        description: newInsp.description.trim() || undefined,
        cost: Number(newInsp.cost) || undefined,
        createdBy: newInsp.createdBy.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machine-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      toast.success(uiText('Maintenance inspection logged successfully', 'feedback'));
      setOpenInspectionDialog(false);
      setInspectionForm(initialInspectionForm);
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to log inspection', 'feedback'));
    },
  });

  const activeCount = machines.filter((m) => m.active).length;
  const underMaint = inspections.filter((i) => i.status !== 'COMPLETED').length;
  const inactiveCount = machines.filter((m) => !m.active).length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
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
          <MachineIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>
              {uiText("Machine Management ")}</Typography>
            <Typography color="text.secondary">
              {uiText("Plant asset registry, maintenance schedules & breakdown logging ")}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loadingMachines || loadingInsp || refetchingMachines || refetchingInsp}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['machines'] });
              queryClient.invalidateQueries({ queryKey: ['machine-inspections'] });
            }}
          >
            {uiText("Refresh ")}</Button>

          {tab === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenMachineDialog(true)}
            >
              {uiText("Register Machine ")}</Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<MaintenanceIcon />}
              onClick={() => setOpenInspectionDialog(true)}
              disabled={machines.length === 0}
            >
              {uiText("Log Maintenance ")}</Button>
          )}
        </Box>
      </Box>

      {(machineError || inspectionError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uiText("Failed to load machine or maintenance data from server. ")}</Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("TOTAL REGISTERED ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#3b82f6">
                {machines.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("OPERATIONAL ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#059669">
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("OPEN INSPECTIONS / REPAIRS ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#ef4444">
                {underMaint}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("INACTIVE / STANDBY ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#8b5cf6">
                {inactiveCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            bgcolor: 'action.hover',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          }}
        >
          <Tab label={uiScopedTemplate('tabs')`Machine Registry (${machines.length})`} />
          <Tab label={uiScopedTemplate('tabs')`Maintenance & Inspections (${inspections.length})`} />
        </Tabs>

        {/* Tab 0: Registry */}
        {tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Serial No", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Machine Name", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Type", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Manufacturer", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Commission Date ", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Status", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingMachines ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : machines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      {uiText("No machines registered yet. Click \"Register Machine\" to add. ", 'tables')}</TableCell>
                  </TableRow>
                ) : (
                  machines.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Chip label={m.serialNo || uiScopedTemplate('tables')`M-${m.id}`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {m.name}
                        </Typography>
                        {m.notes && (
                          <Typography variant="caption" color="text.secondary">
                            {m.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{m.type}</TableCell>
                      <TableCell>{m.manufacturer || '—'}</TableCell>
                      <TableCell align="right">
                        {m.purchasedAt ? new Date(m.purchasedAt).toLocaleDateString(uiDateLocale()) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.active ? uiText("Operational", 'tables') : uiText("Decommissioned", 'tables')}
                          size="small"
                          color={m.active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: Maintenance Log */}
        {tab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Machine", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Inspection Type", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Description", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Service Cost ", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Logged By", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Date", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Status", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingInsp ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : inspections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      {uiText("No maintenance or inspection records yet. ", 'tables')}</TableCell>
                  </TableRow>
                ) : (
                  inspections.map((i) => (
                    <TableRow key={i.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {i.machine?.name || uiScopedTemplate('tables')`Machine #${i.machineId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {i.machine?.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={i.type}
                          size="small"
                          color={
                            i.type === 'BREAKDOWN'
                              ? 'error'
                              : i.type === 'PREVENTIVE'
                              ? 'primary'
                              : 'info'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{i.description || '—'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        {i.cost ? uiScopedTemplate('tables')`₹${i.cost.toLocaleString(uiLocale())}` : '—'}
                      </TableCell>
                      <TableCell>{i.createdBy || 'Technician'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(i.date).toLocaleDateString(uiDateLocale())}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={i.status}
                          size="small"
                          color={
                            i.status === 'COMPLETED'
                              ? 'success'
                              : i.status === 'IN_PROGRESS'
                              ? 'warning'
                              : 'error'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Register Machine Dialog */}
      <Dialog
        open={openMachineDialog}
        onClose={() => setOpenMachineDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
          {uiText("Register New Machine Asset ")}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Machine Name / Designation", 'forms')}
                placeholder={uiText("e.g. Ring Frame #04", 'forms')}
                fullWidth
                size="small"
                required
                value={machineForm.name}
                onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{uiText("Machine Type", 'forms')}</InputLabel>
                <Select
                  value={machineForm.type}
                  label={uiText("Machine Type", 'forms')}
                  onChange={(e) => setMachineForm({ ...machineForm, type: e.target.value })}
                >
                  <MenuItem value="Ring Frame">{uiText("Ring Frame", 'forms')}</MenuItem>
                  <MenuItem value="Carding Machine">{uiText("Carding Machine", 'forms')}</MenuItem>
                  <MenuItem value="Draw Frame">{uiText("Draw Frame", 'forms')}</MenuItem>
                  <MenuItem value="Comber">{uiText("Comber", 'forms')}</MenuItem>
                  <MenuItem value="Simplex / Speed Frame">{uiText("Simplex / Speed Frame", 'forms')}</MenuItem>
                  <MenuItem value="Auto Coner / Winding">{uiText("Auto Coner / Winding", 'forms')}</MenuItem>
                  <MenuItem value="Blow Room">{uiText("Blow Room", 'forms')}</MenuItem>
                  <MenuItem value="OE Rotor">{uiText("OE Rotor", 'forms')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Serial Number", 'forms')}
                placeholder={uiText("SN-LR9-8823", 'forms')}
                fullWidth
                size="small"
                value={machineForm.serialNo}
                onChange={(e) => setMachineForm({ ...machineForm, serialNo: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Manufacturer / OEM", 'forms')}
                placeholder={uiText("e.g. LMW / Rieter / Saurer", 'forms')}
                fullWidth
                size="small"
                value={machineForm.manufacturer}
                onChange={(e) => setMachineForm({ ...machineForm, manufacturer: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="date"
                label={uiText("Purchased / Commission Date", 'forms')}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                value={machineForm.purchasedAt}
                onChange={(e) => setMachineForm({ ...machineForm, purchasedAt: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Notes / Location Tag", 'forms')}
                placeholder={uiText("Shed B, Row 2", 'forms')}
                fullWidth
                size="small"
                value={machineForm.notes}
                onChange={(e) => setMachineForm({ ...machineForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenMachineDialog(false)} color="inherit">
            {uiText("Cancel ")}</Button>
          <Button
            variant="contained"
            disabled={!machineForm.name.trim() || !machineForm.type.trim() || createMachineMutation.isPending}
            onClick={() => createMachineMutation.mutate(machineForm)}
          >
            {createMachineMutation.isPending ? uiText("Registering...") : uiText("Register Machine")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Maintenance Dialog */}
      <Dialog
        open={openInspectionDialog}
        onClose={() => setOpenInspectionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
          {uiText("Log Machine Maintenance / Inspection ")}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>{uiText("Select Machine", 'forms')}</InputLabel>
                <Select
                  value={inspectionForm.machineId}
                  label={uiText("Select Machine", 'forms')}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, machineId: Number(e.target.value) })
                  }
                >
                  {machines.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name} ({m.type} - {m.serialNo || uiScopedTemplate('forms')`ID #${m.id}`})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{uiText("Inspection Type", 'forms')}</InputLabel>
                <Select
                  value={inspectionForm.type}
                  label={uiText("Inspection Type", 'forms')}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, type: e.target.value })
                  }
                >
                  <MenuItem value="ROUTINE">{uiText("Routine", 'forms')}</MenuItem>
                  <MenuItem value="PREVENTIVE">{uiText("Preventive", 'forms')}</MenuItem>
                  <MenuItem value="BREAKDOWN">{uiText("Breakdown", 'forms')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{uiText("Status", 'forms')}</InputLabel>
                <Select
                  value={inspectionForm.status}
                  label={uiText("Status", 'forms')}
                  onChange={(e) =>
                    setInspectionForm({ ...inspectionForm, status: e.target.value })
                  }
                >
                  <MenuItem value="PENDING">{uiText("Pending Action", 'forms')}</MenuItem>
                  <MenuItem value="IN_PROGRESS">{uiText("In Progress", 'forms')}</MenuItem>
                  <MenuItem value="COMPLETED">{uiText("Completed", 'forms')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label={uiText("Repair / Service Cost (₹)", 'forms')}
                fullWidth
                size="small"
                value={inspectionForm.cost || ''}
                onChange={(e) =>
                  setInspectionForm({ ...inspectionForm, cost: Number(e.target.value) || 0 })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={uiText("Description / Fault Details", 'forms')}
                placeholder={uiText("Spindle bearing replacement, lubrication, vibration check...", 'forms')}
                fullWidth
                multiline
                rows={3}
                size="small"
                value={inspectionForm.description}
                onChange={(e) =>
                  setInspectionForm({ ...inspectionForm, description: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={uiText("Technician / Inspector Name", 'forms')}
                placeholder={uiText("Gokul S.", 'forms')}
                fullWidth
                size="small"
                value={inspectionForm.createdBy}
                onChange={(e) =>
                  setInspectionForm({ ...inspectionForm, createdBy: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenInspectionDialog(false)} color="inherit">
            {uiText("Cancel ")}</Button>
          <Button
            variant="contained"
            disabled={!inspectionForm.machineId || createInspectionMutation.isPending}
            onClick={() => createInspectionMutation.mutate(inspectionForm)}
          >
            {createInspectionMutation.isPending ? uiText("Logging...") : uiText("Save Inspection")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MachineManagement;
