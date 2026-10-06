import React, { useState } from 'react';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  VerifiedUser as QualityIcon,
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

interface QualityInspection {
  id: number;
  batchId?: string;
  yarnCount?: string;
  date: string;
  sampleWeight?: number;
  tenacity?: number;
  elongation?: number;
  unevenness?: number;
  imperfections?: number;
  classimateFaults?: number;
  status: 'PASS' | 'FAIL' | 'HOLD' | 'PENDING' | string;
  disposition?: 'RELEASE' | 'REPROCESS' | 'SCRAP' | string;
  remarks?: string;
  inspectedBy?: string;
}

const initialInspectionForm = {
  batchId: '',
  yarnCount: '',
  lotId: '',
  holdQuantity: '',
  sampleWeight: '' as string | number,
  tenacity: '' as string | number,
  elongation: '' as string | number,
  unevenness: '' as string | number,
  imperfections: '' as string | number,
  classimateFaults: '' as string | number,
  status: 'PENDING',
  disposition: '',
  remarks: '',
  inspectedBy: '',
};

const QualityControl: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialInspectionForm);

  const queryClient = useQueryClient();
  const { data: business } = useQuery<any>({ queryKey: ['workflows'], queryFn: async () => (await api.get('/workflows')).data });

  const {
    data: inspections = [],
    isLoading,
    isRefetching,
    error,
  } = useQuery<QualityInspection[]>({
    queryKey: ['quality-inspections', filterStatus],
    queryFn: () => {
      const url =
        filterStatus === 'ALL'
          ? '/quality/inspections'
          : `/quality/inspections?status=${filterStatus}`;
      return api.get(url).then((res) => res.data);
    },
  });

  const createInspectionMutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/quality/inspections', {
        batchId: data.batchId.trim() || undefined,
        lotId: data.lotId ? Number(data.lotId) : undefined,
        holdQuantity: data.holdQuantity ? Number(data.holdQuantity) : undefined,
        yarnCount: data.yarnCount.trim() || undefined,
        sampleWeight: Number(data.sampleWeight) || undefined,
        tenacity: Number(data.tenacity) || undefined,
        elongation: Number(data.elongation) || undefined,
        unevenness: Number(data.unevenness) || undefined,
        imperfections: Number(data.imperfections) || undefined,
        classimateFaults: Number(data.classimateFaults) || undefined,
        status: data.status,
        disposition: data.disposition || undefined,
        remarks: data.remarks.trim() || undefined,
        inspectedBy: data.inspectedBy.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-inspections'] });
      toast.success('Quality inspection recorded successfully');
      setOpenDialog(false);
      setForm(initialInspectionForm);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to record inspection');
    },
  });

  const totalCount = inspections.length;
  const passCount = inspections.filter((i) => i.status === 'PASS').length;
  const failCount = inspections.filter((i) => i.status === 'FAIL').length;
  const holdCount = inspections.filter((i) => i.status === 'HOLD' || i.status === 'PENDING').length;
  const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 100;

  const validTenacities = inspections.map((i) => i.tenacity).filter((t): t is number => typeof t === 'number' && t > 0);
  const avgTenacity =
    validTenacities.length > 0
      ? (validTenacities.reduce((s, t) => s + t, 0) / validTenacities.length).toFixed(1)
      : '—';

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
          <QualityIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Quality Control & Testing
            </Typography>
            <Typography color="text.secondary">
              Yarn count verification, RKM tenacity, elongation & imperfection audits
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={isLoading || isRefetching}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['quality-inspections'] })}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Record Inspection
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load quality inspection logs from server.
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL TESTED BATCHES
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#3b82f6">
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                OVERALL PASS RATE
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#059669">
                {passRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                REJECTIONS / HOLD
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#ef4444">
                {failCount} Fail / {holdCount} Hold
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                AVG TENACITY (RKM)
              </Typography>
              <Typography variant="h5" fontWeight={800} color="#8b5cf6">
                {avgTenacity} {avgTenacity !== '—' && 'cN/tex'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: 'action.hover',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Inspection Register ({inspections.length} records)
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {['ALL', 'PASS', 'FAIL', 'HOLD'].map((st) => (
              <Chip
                key={st}
                label={st}
                clickable
                color={filterStatus === st ? 'primary' : 'default'}
                variant={filterStatus === st ? 'filled' : 'outlined'}
                size="small"
                onClick={() => setFilterStatus(st)}
              />
            ))}
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Batch ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Yarn Count</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Inspection Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Tenacity (cN/tex)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Elongation (%)
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Unevenness (U%)
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Disposition</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : inspections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    No quality inspections recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                inspections.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.batchId || `Batch #${row.id}`}</TableCell>
                    <TableCell>{row.yarnCount || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(row.date).toLocaleDateString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {row.tenacity !== undefined ? `${row.tenacity} g/tex` : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {row.elongation !== undefined ? `${row.elongation}%` : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {row.unevenness !== undefined ? `${row.unevenness}%` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === 'PASS'
                            ? 'success'
                            : row.status === 'FAIL'
                            ? 'error'
                            : 'warning'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {row.disposition ? (
                        <Chip label={row.disposition} size="small" variant="filled" />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.remarks || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Record Inspection Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
          Record Lab Quality Inspection
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField select fullWidth label="Stock lot to inspect" value={form.lotId} onChange={e => setForm({ ...form, lotId: e.target.value })}><MenuItem value="">Measurement record only</MenuItem>{(business?.lots || []).filter((l: any) => l.quantity > 0).map((l: any) => <MenuItem key={l.id} value={String(l.id)}>{l.code} · {l.item.name} · {l.quantity} {l.item.uom}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth type="number" label="Quantity to quarantine" value={form.holdQuantity} onChange={e => setForm({ ...form, holdQuantity: e.target.value })} helperText="Required for HOLD or FAIL. Release in Business flows after inspection." /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Batch / Lot Number"
                placeholder="LOT-2026-09"
                fullWidth
                size="small"
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Yarn Count & Specification"
                placeholder="e.g. 40s Combed Cotton"
                fullWidth
                size="small"
                value={form.yarnCount}
                onChange={(e) => setForm({ ...form, yarnCount: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                label="Tenacity (cN/tex)"
                fullWidth
                size="small"
                value={form.tenacity}
                onChange={(e) => setForm({ ...form, tenacity: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                label="Elongation (%)"
                fullWidth
                size="small"
                value={form.elongation}
                onChange={(e) => setForm({ ...form, elongation: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                label="Unevenness (U%)"
                fullWidth
                size="small"
                value={form.unevenness}
                onChange={(e) => setForm({ ...form, unevenness: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>QC Test Status</InputLabel>
                <Select
                  value={form.status}
                  label="QC Test Status"
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <MenuItem value="PASS">PASS (Acceptable)</MenuItem>
                  <MenuItem value="FAIL">FAIL (Out of tolerance)</MenuItem>
                  <MenuItem value="HOLD">HOLD (Requires retest)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Batch Disposition</InputLabel>
                <Select
                  value={form.disposition}
                  label="Batch Disposition"
                  onChange={(e) => setForm({ ...form, disposition: e.target.value })}
                >
                  <MenuItem value="RELEASE">RELEASE to Warehouse</MenuItem>
                  <MenuItem value="REPROCESS">REPROCESS</MenuItem>
                  <MenuItem value="SCRAP">SCRAP / Waste</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Remarks / Test Notes"
                placeholder="Moisture content 7.8%, CSP 2850, hairiness index normal"
                fullWidth
                size="small"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="QC Inspector Name"
                placeholder="Lab Incharge"
                fullWidth
                size="small"
                value={form.inspectedBy}
                onChange={(e) => setForm({ ...form, inspectedBy: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={createInspectionMutation.isPending}
            onClick={() => createInspectionMutation.mutate(form)}
          >
            {createInspectionMutation.isPending ? 'Recording...' : 'Save Inspection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QualityControl;
