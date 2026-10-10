import { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IMPORT_FIELDS, parseImportCsv, previewImport, type ImportEntity, type ImportInput, type ImportPreview } from '@evergreen/types';
import api from '../utils/api';

export default function Integrations() {
  const client = useQueryClient();
  const [tab, setTab] = useState(0);
  const [entity, setEntity] = useState<ImportEntity>('customers');
  const [source, setSource] = useState('');
  const [input, setInput] = useState<ImportInput | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const history = useQuery<Array<{ id: number; source: string; entity: string; rowCount: number; createdAt: string }>>({ queryKey: ['import-history'], queryFn: async () => (await api.get('/integrations/imports')).data });
  const invalidatePreview = () => { setPreview(null); setConfirmed(false); setResult(''); setError(''); setRequestKey(crypto.randomUUID()); };
  const showError = (e: unknown) => {
    const response = e as { response?: { data?: { message?: string } }; message?: string };
    setError(response.response?.data?.message || response.message || 'Import failed. Your source file is unchanged.');
  };
  const check = async () => {
    if (!input) return;
    setBusy(true); setError(''); setConfirmed(false);
    try { previewImport(input); setPreview((await api.post('/integrations/imports/preview', input)).data); }
    catch (e) { setPreview(null); showError(e); }
    finally { setBusy(false); }
  };
  const commit = async () => {
    if (!input || !preview || preview.issues.length || !confirmed || busy) return;
    setBusy(true); setError('');
    try {
      const { data } = await api.post('/integrations/imports/commit', { ...input, source, requestKey });
      setResult(`${data.replayed ? 'Already imported' : 'Imported'}: ${data.rowCount} ${entity}. Batch ${data.id}.`);
      setConfirmed(false);
      await Promise.all([client.invalidateQueries({ queryKey: ['import-history'] }), client.invalidateQueries({ queryKey: ['commerce-items'] }), client.invalidateQueries({ queryKey: ['commerce-customers'] })]);
    } catch (e) { showError(e); }
    finally { setBusy(false); }
  };

  return <Stack spacing={2}>
    <Typography variant="h4" fontWeight={800}>Migration & integrations</Typography>
    <Typography color="text.secondary">Bring your customer and catalogue lists into this company with an explicit preview.</Typography>
    <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
      <Tab label="Import data" /><Tab label="Connectors" /><Tab label="API & webhooks" /><Tab label="Import history" />
    </Tabs>
    {tab === 0 && <Paper sx={{ p: 3 }}><Stack spacing={2}>
      <Alert severity="info">Import customer or catalogue master records from UTF-8 CSV, up to 500 rows per batch. Opening stock, invoices and balances need separate reconciliation. Existing records are never overwritten.</Alert>
      <TextField select label="Import into" value={entity} disabled={busy} onChange={e => { setEntity(e.target.value as ImportEntity); setInput(null); invalidatePreview(); }}>
        <MenuItem value="customers">Customers</MenuItem><MenuItem value="items">Catalogue items</MenuItem>
      </TextField>
      <TextField label="Source name" value={source} disabled={busy} onChange={e => { setSource(e.target.value); invalidatePreview(); }} helperText="Example: Old customer register — retain the same name when retrying." inputProps={{ maxLength: 200 }} />
      <Button component="label" variant="outlined" disabled={busy}>Choose CSV
        <input type="file" accept=".csv,text/csv" hidden onChange={async e => {
          const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
          invalidatePreview(); setInput(null);
          try {
            if (file.size > 500_000) throw new Error('Use a CSV smaller than 500 KB.');
            const parsed = parseImportCsv(await file.text());
            setInput({ entity, ...parsed, mapping: {} });
          } catch (error) { showError(error); }
        }} />
      </Button>
      {input && <><Typography>{input.rows.length} records. Map your original column names below; unmapped columns are ignored.</Typography>
        {IMPORT_FIELDS[entity].map(field => <TextField key={field} select label={`Map ${field}`} disabled={busy} value={input.mapping[field] ?? ''} onChange={event => {
          const mapping = { ...input.mapping }; if (event.target.value === '') delete mapping[field]; else mapping[field] = Number(event.target.value);
          setInput({ ...input, mapping }); invalidatePreview();
        }}><MenuItem value="">Do not import</MenuItem>{input.headers.map((header, index) => <MenuItem key={index} value={index}>{header}</MenuItem>)}</TextField>)}
        <Button variant="outlined" disabled={busy} onClick={check}>Validate and preview</Button></>}
      {preview && <>
        <Typography>{preview.records.length} records checked. {preview.issues.length} errors.</Typography>
        <Typography variant="body2">Ignored columns: {preview.ignoredHeaders.join(', ') || 'None'}</Typography>
        {preview.issues.slice(0, 30).map((issue, index) => <Alert key={index} severity="error">Row {issue.row}, {issue.field}: {issue.message}</Alert>)}
        <Typography variant="subtitle2">First 5 normalized records</Typography>
        <Box component="pre" sx={{ overflow: 'auto', maxHeight: 260, fontSize: 12 }}>{JSON.stringify(preview.records.slice(0, 5), null, 2)}</Box>
        <FormControlLabel control={<Checkbox checked={confirmed} disabled={busy || !!preview.issues.length} onChange={e => setConfirmed(e.target.checked)} />} label="I reviewed the mapping and want to add these records to this company." />
        <Button variant="contained" disabled={busy || !confirmed || !!preview.issues.length || !source.trim()} onClick={commit}>Import {preview.records.length} records</Button>
      </>}
      {error && <Alert severity="error">{error}</Alert>}{result && <Alert severity="success">{result}</Alert>}
    </Stack></Paper>}
    {tab === 1 && <Stack spacing={2}>
      <Alert severity="info">Direct connectors are pending. Import exported customer and item CSV files using Import data.</Alert>
      {[
        ['TallyPrime', 'Plan ledger mapping, voucher acknowledgement and an outbound desktop bridge. Tally print layouts and e-Way Bill registration are separate features.'],
        ['e-Way Bill', 'Pending provider access, sandbox verification and reconciliation. Invoice PDF generation does not register an e-Way Bill.'],
        ['Existing ERP / desktop software', 'Use a CSV export today. A durable sync agent with retries and conflict handling is planned.'],
      ].map(([name, detail]) => <Paper key={name} sx={{ p: 2 }}><Typography fontWeight={700}>{name} — pending</Typography><Typography>{detail}</Typography></Paper>)}
    </Stack>}
    {tab === 2 && <Stack spacing={2}>
      <Typography>Staff API access uses bearer authentication and the same permissions as the UI. In development, the API reference is at /api/docs on the API service.</Typography>
      <Alert severity="info">Scoped integration keys, webhook subscriptions, signed delivery, retry queues and desktop synchronization are pending. Do not share a staff login as a permanent connector credential.</Alert>
      <Typography>Migration endpoints: POST /integrations/imports/preview, POST /integrations/imports/commit and GET /integrations/imports. All require a company administrator.</Typography>
    </Stack>}
    {tab === 3 && <Stack spacing={1}>
      {history.isLoading && <Typography role="status">Loading import history…</Typography>}
      {history.isError && <Alert severity="error" action={<Button onClick={() => history.refetch()}>Retry</Button>}>Import history could not be loaded.</Alert>}
      {history.data?.length === 0 && <Typography>No imports yet.</Typography>}
      {history.data?.map(batch => <Paper key={batch.id} sx={{ p: 2 }}>Batch {batch.id} · {batch.source} · {batch.rowCount} {batch.entity} · {new Date(batch.createdAt).toLocaleString()}</Paper>)}
    </Stack>}
  </Stack>;
}
