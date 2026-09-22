import React, { useRef, useState, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, IconButton, Divider, Chip, Grid, Tooltip,
  ToggleButton, ToggleButtonGroup, Tabs, Tab, CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Download as DownloadIcon,
  Settings as SettingsIcon, Palette as PaletteIcon, AutoAwesome as AIIcon,
  Security as ShieldIcon, Receipt as ReceiptIcon, Image as ImageIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { useInvoiceStore } from './store';

const THEMES = [
  { id: 'light', name: 'Clean White', bg: '#ffffff', text: '#1f2937' },
  { id: 'dark', name: 'Obsidian Dark', bg: '#161b22', text: '#e5e7eb' },
  { id: 'warm', name: 'Parchment', bg: '#fdf6e3', text: '#292524' },
  { id: 'midnight', name: 'Midnight Blue', bg: '#0f172a', text: '#e2e8f0' },
];
const ACCENTS = ['#059669','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#ef4444','#0ea5e9','#14b8a6'];
const FONTS = [
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier' },
];
const CURRENCIES = [
  { value: 'INR', symbol: '\u20b9' }, { value: 'USD', symbol: '$' },
  { value: 'EUR', symbol: '\u20ac' }, { value: 'GBP', symbol: '\u00a3' },
];

function UploadZone({ label, value, onUpload, onRemove }: { label: string; value: string | null; onUpload: (d: string) => void; onRemove: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  if (value) return (
    <Box sx={{ position: 'relative', display: 'inline-flex', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
      <img src={value} alt={label} style={{ maxHeight: 60, maxWidth: 160, objectFit: 'contain' }} />
      <IconButton size="small" onClick={onRemove} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', width: 20, height: 20 }}>
        <CloseIcon sx={{ fontSize: 12 }} />
      </IconButton>
    </Box>
  );
  return (
    <>
      <Button variant="outlined" size="small" startIcon={<ImageIcon />} onClick={() => inputRef.current?.click()}>{label}</Button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </>
  );
}

const InvoiceGenerator: React.FC = () => {
  const store = useInvoiceStore();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [exporting, setExporting] = useState(false);

  const themeObj = THEMES.find(t => t.id === store.theme) || THEMES[0];
  const subtotal = store.subtotal;
  const discountAmt = subtotal * (store.discountRate / 100);
  const taxAmt = (subtotal - discountAmt) * (store.taxRate / 100);
  const total = subtotal - discountAmt + taxAmt;
  const fmt = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: store.currency, minimumFractionDigits: 2 });
  const fmtDate = (s: string) => { try { return s ? new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014'; } catch { return s; } };

  const handleExport = useCallback(async () => {
    if (!invoiceRef.current || exporting) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(invoiceRef.current, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
      const w = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
      pdf.save(`${store.invoiceNumber || 'invoice'}.pdf`);
    } catch (err) { console.error('PDF export failed:', err); }
    finally { setExporting(false); }
  }, [store.invoiceNumber, exporting]);

  return (
    <Box sx={{ display: 'flex', gap: 3, width: '100%', flexDirection: { xs: 'column', lg: 'row' } }}>
      {/* LEFT PANEL */}
      <Paper variant="outlined" sx={{ width: { lg: 320 }, minWidth: { lg: 300 }, borderRadius: 3, p: 0, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReceiptIcon color="primary" />
          <Box><Typography fontWeight={800}>AI Invoice Generator</Typography><Typography variant="caption" color="text.secondary">Build, Theme & Export PDF</Typography></Box>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<SettingsIcon fontSize="small" />} iconPosition="start" label="Details" sx={{ minHeight: 44, fontSize: '0.75rem' }} />
          <Tab icon={<PaletteIcon fontSize="small" />} iconPosition="start" label="Theme" sx={{ minHeight: 44, fontSize: '0.75rem' }} />
          <Tab icon={<AIIcon fontSize="small" />} iconPosition="start" label="AI / Hash" sx={{ minHeight: 44, fontSize: '0.75rem' }} />
        </Tabs>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {tab === 0 && <>
            <Typography variant="overline" color="text.disabled" sx={{ lineHeight: 1 }}>Issuer</Typography>
            <TextField label="Company Name" size="small" fullWidth value={store.issuerName} onChange={e => store.setField('issuerName', e.target.value)} />
            <TextField label="Address / Email / Phone" size="small" fullWidth multiline rows={3} value={store.issuerDetails} onChange={e => store.setField('issuerDetails', e.target.value)} />
            <TextField label="GSTIN / Tax ID" size="small" fullWidth value={store.issuerTaxId} onChange={e => store.setField('issuerTaxId', e.target.value)} />
            <UploadZone label="Upload Logo" value={store.logo} onUpload={v => store.setField('logo', v)} onRemove={() => store.setField('logo', null)} />
            <Divider />
            <Typography variant="overline" color="text.disabled" sx={{ lineHeight: 1 }}>Client</Typography>
            <TextField label="Client Name" size="small" fullWidth value={store.clientName} onChange={e => store.setField('clientName', e.target.value)} />
            <TextField label="Client Address" size="small" fullWidth multiline rows={2} value={store.clientDetails} onChange={e => store.setField('clientDetails', e.target.value)} />
            <TextField label="Client GSTIN" size="small" fullWidth value={store.clientTaxId} onChange={e => store.setField('clientTaxId', e.target.value)} />
            <Divider />
            <Typography variant="overline" color="text.disabled" sx={{ lineHeight: 1 }}>Invoice Info</Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}><TextField label="Invoice #" size="small" fullWidth value={store.invoiceNumber} onChange={e => store.setField('invoiceNumber', e.target.value)} /></Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl size="small" fullWidth><InputLabel>Currency</InputLabel>
                  <Select label="Currency" value={store.currency} onChange={e => { const c = e.target.value; store.setField('currency', c); store.setField('currencySymbol', CURRENCIES.find(x => x.value === c)?.symbol || c); }}>
                    {CURRENCIES.map(c => <MenuItem key={c.value} value={c.value}>{c.value} ({c.symbol})</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}><TextField label="Issue Date" size="small" fullWidth type="date" value={store.issueDate} onChange={e => store.setField('issueDate', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 6 }}><TextField label="Due Date" size="small" fullWidth type="date" value={store.dueDate} onChange={e => store.setField('dueDate', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid size={{ xs: 6 }}><TextField label="Tax (%)" size="small" fullWidth type="number" value={store.taxRate} onChange={e => store.setField('taxRate', parseFloat(e.target.value) || 0)} /></Grid>
              <Grid size={{ xs: 6 }}><TextField label="Discount (%)" size="small" fullWidth type="number" value={store.discountRate} onChange={e => store.setField('discountRate', parseFloat(e.target.value) || 0)} /></Grid>
            </Grid>
            <TextField label="Notes" size="small" fullWidth multiline rows={2} value={store.notes} onChange={e => store.setField('notes', e.target.value)} />
            <TextField label="Terms & Conditions" size="small" fullWidth multiline rows={2} value={store.terms} onChange={e => store.setField('terms', e.target.value)} />
            <Divider />
            <Typography variant="overline" color="text.disabled" sx={{ lineHeight: 1 }}>Signature</Typography>
            <ToggleButtonGroup size="small" exclusive value={store.signatureType} onChange={(_, v) => v && store.setField('signatureType', v)}>
              <ToggleButton value="type" sx={{ flex: 1 }}>Type</ToggleButton>
              <ToggleButton value="upload" sx={{ flex: 1 }}>Upload</ToggleButton>
            </ToggleButtonGroup>
            {store.signatureType === 'type'
              ? <TextField label="Typed Signature" size="small" fullWidth value={store.typedSignature} onChange={e => store.setField('typedSignature', e.target.value)} />
              : <UploadZone label="Upload Signature" value={store.signature} onUpload={v => store.setField('signature', v)} onRemove={() => store.setField('signature', null)} />}
          </>}
          {tab === 1 && <>
            <Typography variant="overline" color="text.disabled">Color Theme</Typography>
            {THEMES.map(t => <Button key={t.id} onClick={() => store.setField('theme', t.id)} variant={store.theme === t.id ? 'contained' : 'outlined'} startIcon={<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: t.bg, border: '2px solid', borderColor: 'divider' }} />} sx={{ justifyContent: 'flex-start', borderRadius: 2, mb: 0.5 }}>{t.name}</Button>)}
            <Typography variant="overline" color="text.disabled" sx={{ mt: 1 }}>Accent Color</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {ACCENTS.map(c => <Tooltip key={c} title={c}><Box onClick={() => store.setField('accentColor', c)} sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: store.accentColor === c ? '3px solid white' : '2px solid transparent', outline: store.accentColor === c ? `2px solid ${c}` : 'none', transition: 'all 0.15s', '&:hover': { transform: 'scale(1.15)' } }} /></Tooltip>)}
            </Box>
            <Typography variant="overline" color="text.disabled" sx={{ mt: 1 }}>Font</Typography>
            <FormControl size="small" fullWidth><InputLabel>Font Family</InputLabel>
              <Select label="Font Family" value={store.fontFamily} onChange={e => store.setField('fontFamily', e.target.value)}>
                {FONTS.map(f => <MenuItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</MenuItem>)}
              </Select>
            </FormControl>
          </>}
          {tab === 2 && <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><AIIcon color="primary" fontSize="small" /><Typography fontWeight={700}>AI Smart Fill</Typography><Chip label="Beta" size="small" color="primary" variant="outlined" /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Auto-generates optimized line items.</Typography>
              <Button variant="contained" fullWidth size="small" onClick={() => { store.addItem(); const items = useInvoiceStore.getState().items; const last = items[items.length - 1]; if (last) { store.updateItem(last.id, 'description', 'AI Consulting & Optimization'); store.updateItem(last.id, 'rate', 2500); } }}>Generate Smart Additions</Button>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><ShieldIcon color="success" /><Typography fontWeight={700}>Tamper-Proof Hash</Typography></Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.selected', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textAlign: 'center', userSelect: 'all' }}>{store.hash || '\u2014'}</Box>
            </Paper>
            <Button variant="outlined" color="error" fullWidth onClick={store.resetInvoice}>Reset Invoice</Button>
          </>}
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="contained" fullWidth size="large" startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />} onClick={handleExport} disabled={exporting} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {exporting ? 'Generating PDF\u2026' : 'Export PDF'}
          </Button>
        </Box>
      </Paper>

      {/* RIGHT PANEL */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Invoice Preview</Typography>
          <Chip label="Live Preview" color="success" size="small" variant="outlined" />
        </Box>
        <Paper elevation={4} ref={invoiceRef} sx={{ p: 4, borderRadius: 2, bgcolor: themeObj.bg, color: themeObj.text, fontFamily: store.fontFamily, minHeight: 600 }}>
          <Box sx={{ height: 6, borderRadius: 1, mb: 3, background: store.accentColor }} />
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              {store.logo && <img src={store.logo} alt="Logo" style={{ maxHeight: 60, maxWidth: 160, marginBottom: 8, objectFit: 'contain' }} />}
              <Typography variant="h6" fontWeight={800} sx={{ color: store.accentColor }}>{store.issuerName || 'Your Company'}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', opacity: 0.7, mt: 0.5 }}>{store.issuerDetails}</Typography>
              {store.issuerTaxId && <Typography variant="caption" sx={{ opacity: 0.6 }}>{store.issuerTaxId}</Typography>}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight={900} sx={{ color: store.accentColor }}>INVOICE</Typography>
              <Box sx={{ mt: 1, p: 1.5, border: `1px solid ${store.accentColor}44`, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>No: </Typography><Typography variant="caption" fontWeight={700}>{store.invoiceNumber}</Typography><br />
                <Typography variant="caption" sx={{ opacity: 0.6 }}>Issued: </Typography><Typography variant="caption">{fmtDate(store.issueDate)}</Typography><br />
                <Typography variant="caption" sx={{ opacity: 0.6 }}>Due: </Typography><Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>{fmtDate(store.dueDate)}</Typography>
              </Box>
            </Box>
          </Box>
          {/* Bill To */}
          <Box sx={{ mb: 3, p: 2, bgcolor: `${store.accentColor}11`, borderRadius: 2, borderLeft: `3px solid ${store.accentColor}` }}>
            <Typography variant="caption" sx={{ color: store.accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Billed To</Typography>
            <Typography fontWeight={700} sx={{ mt: 0.5 }}>{store.clientName || 'Client Name'}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', opacity: 0.75 }}>{store.clientDetails || 'Client address & contact'}</Typography>
          </Box>
          {/* Items */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 110px 36px', pb: 1, mb: 1, borderBottom: `2px solid ${store.accentColor}`, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>
              <span>Description</span><span style={{ textAlign: 'right' }}>Qty</span><span style={{ textAlign: 'right' }}>Rate</span><span style={{ textAlign: 'right' }}>Amount</span><span />
            </Box>
            {store.items.map(item => (
              <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 110px 36px', py: 0.5, alignItems: 'center', borderBottom: `1px solid ${store.accentColor}22` }}>
                <TextField variant="standard" size="small" value={item.description} placeholder="Description\u2026" onChange={e => store.updateItem(item.id, 'description', e.target.value)} InputProps={{ disableUnderline: true, sx: { fontFamily: store.fontFamily, fontSize: '0.85rem', color: themeObj.text } }} />
                <TextField variant="standard" size="small" type="number" value={item.quantity} onChange={e => store.updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} InputProps={{ disableUnderline: true, sx: { fontFamily: store.fontFamily, fontSize: '0.85rem', color: themeObj.text } }} sx={{ '& input': { textAlign: 'right' } }} />
                <TextField variant="standard" size="small" type="number" value={item.rate} onChange={e => store.updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} InputProps={{ disableUnderline: true, sx: { fontFamily: store.fontFamily, fontSize: '0.85rem', color: themeObj.text } }} sx={{ '& input': { textAlign: 'right' } }} />
                <Typography fontWeight={600} sx={{ textAlign: 'right', fontSize: '0.85rem' }}>{fmt(item.quantity * item.rate)}</Typography>
                <IconButton size="small" onClick={() => store.removeItem(item.id)} sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={store.addItem} sx={{ mt: 1, opacity: 0.7 }}>Add Line Item</Button>
          </Box>
          {/* Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.6 }}>NOTES</Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>{store.notes}</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.6, display: 'block', mt: 1.5 }}>TERMS</Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>{store.terms}</Typography>
            </Box>
            <Box sx={{ minWidth: 180 }}>
              {store.discountRate > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ opacity: 0.7 }}>Discount ({store.discountRate}%)</Typography><Typography variant="body2">\u2212{fmt(discountAmt)}</Typography></Box>}
              {store.taxRate > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ opacity: 0.7 }}>Tax ({store.taxRate}%)</Typography><Typography variant="body2">{fmt(taxAmt)}</Typography></Box>}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Total Due</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ color: store.accentColor }}>{fmt(total)}</Typography>
              </Box>
            </Box>
          </Box>
          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, borderTop: `1px solid ${store.accentColor}22` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldIcon sx={{ color: '#10b981', fontSize: 18 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>Verified \u00b7 Tamper-Proof</Typography>
                <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', letterSpacing: 1.5, opacity: 0.6 }}>{store.hash}</Typography>
              </Box>
            </Box>
            {((store.signatureType === 'upload' && store.signature) || (store.signatureType === 'type' && store.typedSignature)) && (
              <Box sx={{ textAlign: 'center' }}>
                {store.signatureType === 'type' ? <Typography sx={{ fontFamily: "'Georgia', serif", fontSize: '1.6rem', fontStyle: 'italic', lineHeight: 1 }}>{store.typedSignature}</Typography>
                  : <img src={store.signature!} alt="Sig" style={{ maxHeight: 48, maxWidth: 130 }} />}
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="caption" sx={{ opacity: 0.6 }}>Authorised Signatory</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
export default InvoiceGenerator;
