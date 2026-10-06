import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { ScheduleOutlined } from '@mui/icons-material';
import type { DeleteGuardErrorPayload } from '../../utils/deleteGuardHandler';
import { formatProductionTime } from '../../utils/productionTiming';

export default function ProductionTimingAlert({ error, onEdit, busy }: { error: DeleteGuardErrorPayload; onEdit: () => void; busy?: boolean }) {
    const received = formatProductionTime(error.inwardReceivedAt);
    const earliest = formatProductionTime(error.earliestStartAt);
    return <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: '12px', '& .MuiAlert-message': { width: '100%', minWidth: 0 }, color: 'text.primary' }}>
        <AlertTitle sx={{ fontWeight: 700 }}>Choose a later production start</AlertTitle>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>Batch {error.trace?.batchNo || 'selected'} must settle after receipt. Your entered quantities are kept.</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, my: 1.5 }}>
            {received && <Box><Typography variant="caption" color="text.secondary">Received</Typography><Typography variant="body2">{received}</Typography></Box>}
            {earliest && <Box><Typography variant="caption" color="text.secondary">Earliest production start</Typography><Typography variant="body2" fontWeight={600}>{earliest}</Typography></Box>}
        </Box>
        {!earliest && <Typography variant="body2" sx={{ mb: 1.5 }}>{error.message}</Typography>}
        <Button size="small" variant="outlined" color="warning" startIcon={<ScheduleOutlined />} onClick={onEdit} disabled={busy}>Edit start time</Button>
    </Alert>;
}
