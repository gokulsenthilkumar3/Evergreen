import { dateKey } from '../utils/dateKey';
import { uiText, useUiLanguage, uiLocale, uiTemplate, uiMetric, uiDateLocale } from "../i18n";
import React, { useMemo, useState } from 'react';
import {
  Add as AddIcon,
  AssignmentTurnedIn as ReceiptIcon,
  FilterList as FilterIcon,
  LocalShipping as DispatchIcon,
  Person as WorkerPersonIcon,
  PersonAdd as WorkerIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';

type Item = {
  id: number;
  name: string;
  uom: string;
  type: string;
  stock?: { available: number };
};

type Worker = {
  id: number;
  name: string;
};

type Line = {
  itemId: number | '';
  quantity: string;
  scrapQty?: string;
};

type Job = {
  id: number;
  challanNo: string;
  date: string;
  processType: string;
  status: string;
  jobWorker: Worker;
  dispatchLines: Array<{ item: Item; quantity: number }>;
  receiptLines: Array<{ item: Item; quantity: number; scrapQty: number }>;
};

const statusColorMap: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  DISPATCHED: 'warning',
  PART_RECEIVED: 'info',
  COMPLETED: 'success',
};

const PROCESS_OPTIONS = [
  'KNITTING',
  'DYEING',
  'PRINTING',
  'STITCHING',
  'WINDING',
  'BLEACHING',
  'WARPING',
];

const JobWork: React.FC = () => {
  useUiLanguage();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [workerOpen, setWorkerOpen] = useState(false);
  const [receipt, setReceipt] = useState<Job | null>(null);
  const [workerName, setWorkerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [form, setForm] = useState({
    jobWorkerId: '' as number | '',
    processType: 'DYEING',
    date: dateKey(),
    notes: '',
    lines: [{ itemId: '' as number | '', quantity: '' }] as Line[],
  });

  const [receiptLines, setReceiptLines] = useState<Line[]>([]);

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['commerce-items'],
    queryFn: async () => (await api.get('/commerce/items')).data,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ['job-workers'],
    queryFn: async () => (await api.get('/job-work/workers')).data,
  });

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ['job-work'],
    queryFn: async () => (await api.get('/job-work')).data,
  });

  const { data: summary = { openJobs: 0, completedJobs: 0, outstandingQty: 0 } } = useQuery({
    queryKey: ['job-work-summary'],
    queryFn: async () => (await api.get('/job-work/summary')).data,
  });

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ['job-work'] }),
      client.invalidateQueries({ queryKey: ['job-work-summary'] }),
      client.invalidateQueries({ queryKey: ['commerce-items'] }),
    ]);
  };

  const materials = items.filter((item) => item.type !== 'SERVICE');

  // One write at a time: a double click must not dispatch or receive the same material twice.
  const [busy, setBusy] = useState(false);
  const once = (work: () => Promise<unknown>) => async () => {
    if (busy) return;
    setBusy(true);
    try {
      await work();
    } finally {
      setBusy(false);
    }
  };

  const createWorker = once(async () => {
    try {
      if (!workerName.trim()) {
        return toast.error(uiText('Worker name is required', 'feedback'));
      }
      const { data } = await api.post('/job-work/workers', { name: workerName.trim() });
      setForm((prev) => ({ ...prev, jobWorkerId: data.id }));
      setWorkerName('');
      setWorkerOpen(false);
      await client.invalidateQueries({ queryKey: ['job-workers'] });
      toast.success(uiText('Job worker added successfully', 'feedback'));
    } catch (error: any) {
      toast.error(uiText(error.response?.data?.message || 'Could not add worker', 'feedback'));
    }
  });

  const dispatch = once(async () => {
    try {
      if (!form.jobWorkerId) {
        return toast.error(uiText('Please select a job worker', 'feedback'));
      }
      const validLines = form.lines.filter((l) => l.itemId !== '' && Number(l.quantity) > 0);
      if (validLines.length === 0) {
        return toast.error(uiText('Please add at least one material with positive quantity', 'feedback'));
      }

      await api.post('/job-work/dispatch', {
        ...form,
        lines: validLines.map((line) => ({
          itemId: Number(line.itemId),
          quantity: Number(line.quantity),
        })),
      });

      setOpen(false);
      setForm({
        jobWorkerId: '',
        processType: 'DYEING',
        date: dateKey(),
        notes: '',
        lines: [{ itemId: '', quantity: '' }],
      });
      await refresh();
      toast.success(uiText('Job-work challan dispatched successfully', 'feedback'));
    } catch (error: any) {
      toast.error(uiText(error.response?.data?.message || 'Could not dispatch material', 'feedback'));
    }
  });

  const openReceipt = (job: Job) => {
    setReceipt(job);
    setReceiptLines(
      job.dispatchLines.map((line) => ({
        itemId: line.item.id,
        quantity: '',
        scrapQty: '',
      }))
    );
  };

  const saveReceipt = once(async () => {
    try {
      if (!receipt) return;
      const lines = receiptLines
        .filter((line) => Number(line.quantity) > 0 || Number(line.scrapQty) > 0)
        .map((line) => ({
          itemId: Number(line.itemId),
          quantity: Number(line.quantity || 0),
          scrapQty: Number(line.scrapQty || 0),
        }));

      if (lines.length === 0) {
        return toast.error(uiText('Please enter received quantity or scrap for at least one item', 'feedback'));
      }

      await api.post(`/job-work/${receipt.id}/receive`, { lines });
      setReceipt(null);
      await refresh();
      toast.success(uiText('Job-work receipt and scrap recorded', 'feedback'));
    } catch (error: any) {
      toast.error(uiText(error.response?.data?.message || 'Could not record receipt', 'feedback'));
    }
  });

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.challanNo?.toLowerCase().includes(q) ||
        job.jobWorker?.name?.toLowerCase().includes(q) ||
        job.processType?.toLowerCase().includes(q) ||
        job.dispatchLines?.some((l) => l.item?.name?.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [jobs, statusFilter, searchQuery]);

  const stats = [
    {
      label: 'Open Challans',
      value: summary.openJobs ?? 0,
      subtitle: 'Currently in processing',
      icon: <DispatchIcon />,
      color: '#d97706',
      bgColor: 'rgba(217, 119, 6, 0.08)',
    },
    {
      label: 'With Processors',
      value: `${Number(summary.outstandingQty || 0).toLocaleString(uiLocale())} kg`,
      subtitle: 'Material awaiting receipt',
      icon: <DispatchIcon />,
      color: '#2563eb',
      bgColor: 'rgba(37, 99, 235, 0.08)',
    },
    {
      label: 'Completed Batches',
      value: summary.completedJobs ?? 0,
      subtitle: 'Fully reconciled lots',
      icon: <ReceiptIcon />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.08)',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {uiText("Job Work Management ")}</Typography>
          <Typography color="text.secondary">
            {uiText("Issue material for external processing, monitor worker challans, and track receipts & scrap. ")}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<WorkerIcon />}
            onClick={() => setWorkerOpen(true)}
          >
            {uiText("Add Worker ")}</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            {uiText("New Dispatch ")}</Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {uiText(stat.label, 'metrics')}
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                  {uiMetric(stat.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {uiText(stat.subtitle, 'metrics')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Register */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Filters Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {['ALL', 'DISPATCHED', 'PART_RECEIVED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <Chip
                key={status}
                label={status === 'ALL' ? uiText("All Challans") : status.replaceAll('_', ' ')}
                clickable
                color={statusFilter === status ? 'primary' : 'default'}
                variant={statusFilter === status ? 'filled' : 'outlined'}
                onClick={() => setStatusFilter(status)}
                size="small"
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder={uiText("Search challan, worker, material...", 'forms')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <IconButton onClick={refresh} title={uiText("Refresh challans")}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Challans Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Challan #", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Job Worker", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Process", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Materials Dispatched", 'tables')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Status", 'tables')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {uiText("Actions ", 'tables')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                    <Typography fontWeight={700} color="text.secondary">
                      {uiText("No job-work challans found. ", 'tables')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {uiText("Click \"New Dispatch\" to send materials to a dyer, knitter, or finisher. ", 'tables')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{job.challanNo}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(job.date).toLocaleDateString(uiDateLocale(), {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: '0.75rem',
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                          }}
                        >
                          {job.jobWorker.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {job.jobWorker.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={job.processType}
                        variant="outlined"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {job.dispatchLines.map((line, idx) => (
                          <Typography key={idx} variant="body2">
                            {line.item?.name} — <strong>{line.quantity} {line.item?.uom}</strong>
                          </Typography>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={statusColorMap[job.status] || 'default'}
                        label={job.status.replaceAll('_', ' ')}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {!['COMPLETED', 'CANCELLED'].includes(job.status) && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ReceiptIcon />}
                          onClick={() => openReceipt(job)}
                        >
                          {uiText("Receive ", 'tables')}</Button>
                      )}
                      {!['COMPLETED', 'CANCELLED'].includes(job.status) && <Button size="small" color="error" onClick={async () => {
                        if (!window.confirm('Confirm the outstanding material has physically returned. Received material and recorded scrap will be retained.')) return;
                        try { await api.post(`/job-work/${job.id}/cancel`, { notes: 'Outstanding material returned; job cancelled', returnConfirmed: true }); await refresh(); toast.success(uiText('Job cancelled; outstanding material returned once', 'feedback')); }
                        catch (error: any) { toast.error(uiText(error.response?.data?.message || 'Could not cancel job', 'feedback')); }
                      }}>{uiText("Cancel & return", 'tables')}</Button>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* New Dispatch Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {uiText("Dispatch Material for Job Work ")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label={uiText("Job Worker", 'forms')}
                value={form.jobWorkerId}
                onChange={(e) =>
                  setForm({ ...form, jobWorkerId: Number(e.target.value) })
                }
                fullWidth
              >
                {workers.map((worker) => (
                  <MenuItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label={uiText("Process Type", 'forms')}
                value={form.processType}
                onChange={(e) =>
                  setForm({ ...form, processType: e.target.value })
                }
                fullWidth
              >
                {PROCESS_OPTIONS.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="date"
                label={uiText("Dispatch Date", 'forms')}
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                fullWidth
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={700}>
              {uiText("Materials to Dispatch: ")}</Typography>

            {form.lines.map((line, index) => (
              <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  label={uiText("Material Item", 'forms')}
                  value={line.itemId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lines: form.lines.map((entry, i) =>
                        i === index
                          ? { ...entry, itemId: Number(e.target.value) }
                          : entry
                      ),
                    })
                  }
                  fullWidth
                >
                  {materials.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} {uiText(" — Available: ", 'forms')}{item.stock?.available ?? 0} {item.uom}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label={uiText("Quantity", 'forms')}
                  type="number"
                  value={line.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lines: form.lines.map((entry, i) =>
                        i === index
                          ? { ...entry, quantity: e.target.value }
                          : entry
                      ),
                    })
                  }
                  sx={{ minWidth: 160 }}
                />

                {form.lines.length > 1 && (
                  <Button
                    color="error"
                    size="small"
                    onClick={() =>
                      setForm({
                        ...form,
                        lines: form.lines.filter((_, i) => i !== index),
                      })
                    }
                  >
                    {uiText("Remove ")}</Button>
                )}
              </Stack>
            ))}

            <Button
              onClick={() =>
                setForm({
                  ...form,
                  lines: [...form.lines, { itemId: '', quantity: '' }],
                })
              }
              sx={{ alignSelf: 'start' }}
            >
              {uiText("+ Add Another Material ")}</Button>

            <TextField
              label={uiText("Notes / Instructions", 'forms')}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)}>{uiText("Cancel")}</Button>
          <Button variant="contained" disabled={busy} onClick={dispatch}>
            {uiText("Confirm Dispatch ")}</Button>
        </DialogActions>
      </Dialog>

      {/* Record Receipt Dialog */}
      <Dialog
        open={!!receipt}
        onClose={() => setReceipt(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {uiText("Receive Material: Challan #")}{receipt?.challanNo}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {uiText("Processor: ")}<strong>{receipt?.jobWorker?.name}</strong> {uiText(" | Process: ")}<strong>{receipt?.processType}</strong>
          </Typography>
          <Stack spacing={2}>
            {receiptLines.map((line, index) => {
              const matchedItem = items.find((item) => item.id === line.itemId);
              return (
                <Paper key={String(line.itemId)} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    {matchedItem?.name || uiTemplate`Item #${line.itemId}`} ({matchedItem?.uom || 'KG'})
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label={uiText("Finished / Received Qty", 'forms')}
                      type="number"
                      value={line.quantity}
                      onChange={(e) =>
                        setReceiptLines(
                          receiptLines.map((entry, i) =>
                            i === index ? { ...entry, quantity: e.target.value } : entry
                          )
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label={uiText("Scrap / Waste Qty", 'forms')}
                      type="number"
                      value={line.scrapQty}
                      onChange={(e) =>
                        setReceiptLines(
                          receiptLines.map((entry, i) =>
                            i === index ? { ...entry, scrapQty: e.target.value } : entry
                          )
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setReceipt(null)}>{uiText("Cancel")}</Button>
          <Button variant="contained" disabled={busy} onClick={saveReceipt}>
            {uiText("Record Receipt & Close ")}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Worker Dialog */}
      <Dialog open={workerOpen} onClose={() => setWorkerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{uiText("Add Job Worker")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            sx={{ mt: 1 }}
            label={uiText("Worker / Vendor Name", 'forms')}
            placeholder={uiText("e.g. Sri Lakshmi Dyeing Works", 'forms')}
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWorkerOpen(false)}>{uiText("Cancel")}</Button>
          <Button variant="contained" disabled={busy} onClick={createWorker}>
            {uiText("Save Worker ")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobWork;
