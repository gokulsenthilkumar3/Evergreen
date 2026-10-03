import React, { useState } from 'react';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../utils/api';

type Shift = { id: number; name: string; startTime: string; endTime: string };

type ShiftForm = { name: string; startTime: string; endTime: string };

const EMPTY_FORM: ShiftForm = { name: '', startTime: '', endTime: '' };

const ShiftManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ShiftForm>(EMPTY_FORM);

  const { data: shifts = [], isLoading, error } = useQuery<Shift[]>({
    queryKey: ['hr-shifts'],
    queryFn: () => api.get('/hr/shifts').then((r) => r.data),
  });

  const createShift = useMutation({
    mutationFn: () => api.post('/hr/shifts', form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hr-shifts'] });
      setOpen(false);
      setForm(EMPTY_FORM);
      toast.success('Shift saved');
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? 'Could not save shift'),
  });

  const handleOpen = () => {
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const isFormValid =
    form.name.trim().length > 0 && form.startTime !== '' && form.endTime !== '';

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Shift Management
          </Typography>
          <Typography color="text.secondary">
            Shift schedules from the shared HR records.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['hr-shifts'] })}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Add Shift
          </Button>
        </Stack>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load shifts. Refresh to try again.
        </Alert>
      )}

      {/* Shifts table */}
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shift</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No shifts configured.
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.name}</TableCell>
                  <TableCell>{shift.startTime}</TableCell>
                  <TableCell>{shift.endTime}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Alert severity="info" sx={{ mt: 2 }}>
        Attendance assignments are not exposed by the current API; this page only shows saved
        shift schedules.
      </Alert>

      {/* Add Shift Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add shift</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Shift name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Start time"
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="End time"
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={createShift.isPending || !isFormValid}
            onClick={() => createShift.mutate()}
          >
            Save shift
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftManagement;
