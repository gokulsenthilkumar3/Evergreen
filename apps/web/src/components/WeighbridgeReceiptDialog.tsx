import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { calculateWeighbridge, type MoistureMethod } from '@evergreen/types';
import api from '../utils/api';
import { formatApiError } from '../utils/messages';

export default function WeighbridgeReceiptDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [batchId, setBatchId] = useState(() => `WB-${crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8, '0')).join('')}`);
  const [date, setDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  });
  const [supplier, setSupplier] = useState('');
  const [bale, setBale] = useState('');
  const [gross, setGross] = useState('');
  const [tare, setTare] = useState('');
  const [moisture, setMoisture] = useState('');
  const [method, setMethod] = useState<MoistureMethod>('PENDING');
  const [baseline, setBaseline] = useState('');
  const [contract, setContract] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const measurement = {
    grossWeightKg: gross.trim() ? Number(gross) : NaN,
    tareWeightKg: tare.trim() ? Number(tare) : NaN,
    moisturePercent: moisture.trim() ? Number(moisture) : NaN,
    method,
    ...(method === 'EXCESS_PERCENTAGE' ? { standardMoistureBase: baseline.trim() ? Number(baseline) : NaN, contractReference: contract } : {}),
  };
  let totals: ReturnType<typeof calculateWeighbridge> | undefined;
  let validationError = '';
  try { totals = calculateWeighbridge(measurement); }
  catch (e) { validationError = (e as Error).message; }

  const save = async () => {
    if (!totals) { setError(validationError); return; }
    if (!batchId.trim() || !supplier.trim() || !Number.isInteger(Number(bale)) || Number(bale) <= 0 || !Number.isFinite(new Date(date).getTime())) {
      setError('Enter a lot reference, supplier, receipt time and a positive whole bale count.'); return;
    }
    setBusy(true); setError('');
    try {
      await api.post('/inventory/inward/weighbridge-sync', {
        batchId: batchId.trim(), supplier: supplier.trim(), bale: Number(bale), date: new Date(date).toISOString(), ...measurement,
      });
      onSaved();
    } catch (e) { setError(formatApiError(e, 'Receipt could not be saved. Retry with the same lot reference.')); }
    finally { setBusy(false); }
  };

  return <Dialog open onClose={() => { if (!busy) onClose(); }} fullWidth maxWidth="sm" aria-labelledby="weighbridge-title">
    <DialogTitle id="weighbridge-title">Record weighbridge receipt</DialogTitle>
    <DialogContent>
      <Alert severity="info" sx={{ mb: 2 }}>Enter readings from the weighbridge slip. These readings are recorded manually; device authenticity is not verified.</Alert>
      <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, display: 'grid', gap: 2 }}>
        <TextField label="Lot reference" value={batchId} onChange={e => setBatchId(e.target.value)} required inputProps={{ maxLength: 100 }} helperText="Keep this reference when retrying a failed save." />
        <TextField label="Receipt time" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required InputLabelProps={{ shrink: true }} inputProps={{ step: 1 }} />
        <TextField label="Supplier" value={supplier} onChange={e => setSupplier(e.target.value)} required />
        <TextField label="Bales" type="number" value={bale} onChange={e => setBale(e.target.value)} required inputProps={{ min: 1, step: 1 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField label="Gross weight (kg)" type="number" value={gross} onChange={e => setGross(e.target.value)} required inputProps={{ min: 0.01, step: 0.01 }} />
          <TextField label="Tare weight (kg)" type="number" value={tare} onChange={e => setTare(e.target.value)} required inputProps={{ min: 0, step: 0.01 }} />
        </Box>
        <TextField label="Moisture content (%)" type="number" value={moisture} onChange={e => setMoisture(e.target.value)} required inputProps={{ min: 0, max: 99.99, step: 0.01 }} helperText="Use moisture content on a wet basis, not moisture regain." />
        <TextField select label="Deduction policy" value={method} onChange={e => setMethod(e.target.value as MoistureMethod)}>
          <MenuItem value="PENDING">Pending contract confirmation</MenuItem>
          <MenuItem value="EXCESS_PERCENTAGE">Agreed excess percentage deduction</MenuItem>
        </TextField>
        {method === 'EXCESS_PERCENTAGE' && <>
          <Alert severity="warning">Use only when the supplier contract specifies this deduction-only rule: net kg × excess moisture percentage points ÷ 100. Premiums and rejection limits are not applied.</Alert>
          <TextField label="Agreed baseline (%)" type="number" value={baseline} onChange={e => setBaseline(e.target.value)} required inputProps={{ min: 0, max: 99.99, step: 0.01 }} />
          <TextField label="Contract reference" value={contract} onChange={e => setContract(e.target.value)} required />
        </>}
        {totals && <Box role="status" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography>Physical stock received: {totals.netWeightKg.toFixed(2)} kg</Typography>
          {totals.finalBillableKg === null ? <Typography>Billable weight: pending contract confirmation</Typography> : <>
            <Typography>Moisture deduction: {totals.moistureDeductionKg!.toFixed(2)} kg</Typography>
            <Typography fontWeight={700}>Billable weight: {totals.finalBillableKg.toFixed(2)} kg</Typography>
          </>}
        </Box>}
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={busy}>Cancel</Button>
      <Button variant="contained" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save receipt'}</Button>
    </DialogActions>
  </Dialog>;
}
