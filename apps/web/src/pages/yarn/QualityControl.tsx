import { Alert, Box, Button, Chip, CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

interface Inspection {
  id: number; date: string; batchId?: string; yarnCount?: string;
  tenacity?: number; elongation?: number; unevenness?: number;
  status: string; remarks?: string;
}
export default function QualityControl() {
  const { data = [], isLoading, error, refetch } = useQuery<Inspection[]>({
    queryKey: ['quality-inspections'],
    queryFn: () => api.get('/quality/inspections').then(response => response.data),
  });
  if (isLoading) return <CircularProgress aria-label="Loading inspections" />;
  if (error) return <Alert severity="error">Failed to load inspections. <Button onClick={() => refetch()}>Retry</Button></Alert>;
  return <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Box><Typography variant="h4" fontWeight={800}>Quality Control</Typography>
      <Typography color="text.secondary">Latest 200 inspection records</Typography></Box>
      <Button onClick={() => refetch()}>Refresh</Button>
    </Box>
    <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
      <Table size="small"><TableHead><TableRow>
        {['Batch', 'Yarn Count', 'Date', 'Tenacity', 'Elongation', 'Unevenness', 'Status', 'Remarks'].map(label => <TableCell key={label}>{label}</TableCell>)}
      </TableRow></TableHead><TableBody>
        {data.length === 0 && <TableRow><TableCell colSpan={8}>No inspections recorded yet.</TableCell></TableRow>}
        {data.map(row => <TableRow key={row.id}>
          <TableCell>{row.batchId ?? '?'}</TableCell><TableCell>{row.yarnCount ?? '?'}</TableCell>
          <TableCell>{new Date(row.date).toLocaleDateString('en-IN')}</TableCell>
          <TableCell>{row.tenacity ?? '?'}</TableCell><TableCell>{row.elongation ?? '?'}</TableCell>
          <TableCell>{row.unevenness ?? '?'}</TableCell>
          <TableCell><Chip size="small" label={row.status} color={row.status === 'PASS' ? 'success' : row.status === 'FAIL' ? 'error' : 'warning'} /></TableCell>
          <TableCell>{row.remarks ?? '?'}</TableCell>
        </TableRow>)}
      </TableBody></Table>
    </Paper>
  </Box>;
}
