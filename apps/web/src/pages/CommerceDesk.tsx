import { dateKey } from '../utils/dateKey';
import { uiText, useUiLanguage, uiLocale, uiTemplate, uiDateLocale, uiScopedTemplate } from "../i18n";
import React, { useMemo, useState } from 'react';
import { Add as AddIcon, Inventory2 as CatalogueIcon, ReceiptLong as InvoiceIcon, People as CustomerIcon, ShoppingCart as OrderIcon } from '@mui/icons-material';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, MenuItem, Paper, Stack, Switch, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';
import CatalogueTaxonomy from './CatalogueTaxonomy';
import { downloadInvoicePdf } from '../utils/invoiceDocument';
import { INDIAN_STATES, canonicalIndianState, gstinStateName, validatePartyContact } from '@evergreen/types';

type Item = { id: number; sku: string; name: string; description?: string; type: string; uom: string; hsnSac?: string; gstRate: number; salePrice: number; reorderLevel: number; costPrice: number; imageUrl?: string; active: boolean; shopVisible: boolean; brandId?: number; categoryId?: number; legacySource?: string; legacyId?: string; stock: { available: number } };
type Customer = { id: number; name: string; phone?: string; email?: string; gstin?: string; state?: string; address?: string; active: boolean; balance: number };
type Taxonomy = { id: number; name: string; active: boolean };
type Line = { itemId: number | ''; quantity: string; rate?: string; discount?: string };
const stateNames: readonly string[] = INDIAN_STATES;

const CommerceDesk: React.FC<{ initialTab?: number }> = ({ initialTab = 0 }) => {
  useUiLanguage();
  const client = useQueryClient(); const [tab, setTab] = useState(initialTab); const [itemOpen, setItemOpen] = useState(false); const [customerOpen, setCustomerOpen] = useState(false); const [orderOpen, setOrderOpen] = useState(false); const [invoiceOpen, setInvoiceOpen] = useState(false); const [ledger, setLedger] = useState<any[] | null>(null); const [ledgerName, setLedgerName] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null); const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [adjustItem, setAdjustItem] = useState<Item | null>(null); const [adjustQuantity, setAdjustQuantity] = useState(''); const [adjustNotes, setAdjustNotes] = useState('');
  const [historyItem, setHistoryItem] = useState<Item | null>(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentKey, setPaymentKey] = useState(() => crypto.randomUUID());
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceKey, setInvoiceKey] = useState(() => crypto.randomUUID());
  const [invoiceStockDate, setInvoiceStockDate] = useState('');
  const { data: movements = [] } = useQuery<any[]>({ queryKey: ['commerce-item-movements', historyItem?.id], enabled: !!historyItem, queryFn: async () => (await api.get(`/commerce/items/${historyItem!.id}/movements`)).data });
  const { data: items = [] } = useQuery<Item[]>({ queryKey: ['commerce-items'], queryFn: async () => (await api.get('/commerce/items')).data });
  const { data: brands = [] } = useQuery<Taxonomy[]>({ queryKey: ['commerce', 'brands'], queryFn: async () => (await api.get('/commerce/brands')).data });
  const { data: categories = [] } = useQuery<Taxonomy[]>({ queryKey: ['commerce', 'categories'], queryFn: async () => (await api.get('/commerce/categories')).data });
  const { data: customers = [] } = useQuery<Customer[]>({ queryKey: ['commerce-customers'], queryFn: async () => (await api.get('/commerce/customers')).data });
  const { data: orders = [] } = useQuery<any[]>({ queryKey: ['commerce-orders'], queryFn: async () => (await api.get('/commerce/orders')).data });
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ['commerce-invoices'], queryFn: async () => (await api.get('/commerce/invoices')).data });
  const { data: settings } = useQuery<any>({ queryKey: ['settings'], queryFn: async () => (await api.get('/settings')).data });
  const { data: dispatches = [] } = useQuery<any[]>({ queryKey: ['outwardHistory'], queryFn: async () => (await api.get('/inventory/outward')).data });
  const paymentInvoice = invoices.find(row => row.id === paymentInvoiceId);
  const refresh = (keys: string[]) => Promise.all(keys.map(key => client.invalidateQueries({ queryKey: [key] })));
  const emptyItem = () => ({ name: '', sku: '', description: '', type: 'YARN', uom: 'KG', hsnSac: '', gstRate: '', salePrice: '', costPrice: '', reorderLevel: '', imageUrl: '', brandId: '', categoryId: '', shopVisible: false });
  const emptyCustomer = () => ({ name: '', phone: '', email: '', gstin: '', state: '', address: '' });
  const [item, setItem] = useState(emptyItem);
  const [customer, setCustomer] = useState(emptyCustomer);
  const emptySales = () => ({ customerId: '' as number | '', date: dateKey(), notes: '', lines: [{ itemId: '' as number | '', quantity: '', rate: '', discount: '' }] as Line[] });
  const [order, setOrder] = useState(emptySales); const [invoice, setInvoice] = useState({ ...emptySales(), dueDate: '', theme: settings?.defaultInvoiceTheme || 'CLASSIC', currency: 'INR', notes: '', terms: '', transportMode: '', vehicleNo: '', issuerSignature: '', salesOrderId: '' as number | '', outwardId: '' as number | '' });
  // One save at a time: a double click must not create two items, customers, orders or adjustments.
  const [busy, setBusy] = useState(false);
  const guarded = (work: () => Promise<void>) => async () => { if (busy) return; setBusy(true); try { await work(); } finally { setBusy(false); } };
  const companyState = gstinStateName(settings?.gstin) || canonicalIndianState(settings?.sellerState) || 'Tamil Nadu';
  const amountError = (value: string, max = 1_000_000_000) => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max);
  const itemErrors = { name: !item.name.trim(), sku: !item.sku.trim(), uom: !item.uom.trim(), gstRate: amountError(item.gstRate, 100), salePrice: amountError(item.salePrice), costPrice: amountError(item.costPrice), reorderLevel: amountError(item.reorderLevel) };
  const itemInvalid = Object.values(itemErrors).some(Boolean);
  const customerCheck = validatePartyContact({ gstin: customer.gstin, state: customer.state, email: customer.email, phone: customer.phone });
  const customerError = customerCheck.error;
  const customerField = (field: 'gstin' | 'state' | 'email' | 'phone') => Boolean(customerError) && (field === 'gstin' ? /GSTIN/.test(customerError!) : field === 'state' ? /state/i.test(customerError!) : field === 'email' ? /email/.test(customerError!) : /phone/.test(customerError!));
  const saveItem = guarded(async () => { try { const payload = { ...item, gstRate: Number(item.gstRate), salePrice: Number(item.salePrice || 0), costPrice: Number(item.costPrice || 0), reorderLevel: Number(item.reorderLevel || 0) }; if (editingItemId) await api.patch(`/commerce/items/${editingItemId}`, payload); else await api.post('/commerce/items', payload); setItemOpen(false); setEditingItemId(null); setItem(emptyItem()); await refresh(['commerce-items']); toast.success(editingItemId ? 'Catalogue item updated' : 'Catalogue item created'); } catch (e: any) { toast.error(uiText(e.response?.data?.message || 'Could not save item', 'feedback')); } });
  const saveCustomer = guarded(async () => { try { if (editingCustomerId) await api.patch(`/commerce/customers/${editingCustomerId}`, customer); else await api.post('/commerce/customers', customer); setCustomerOpen(false); setEditingCustomerId(null); setCustomer(emptyCustomer()); await refresh(['commerce-customers']); toast.success(editingCustomerId ? 'Customer updated' : 'Customer created'); } catch (e: any) { toast.error(uiText(e.response?.data?.message || 'Could not save customer', 'feedback')); } });
  const editItem = (selected: Item) => { setEditingItemId(selected.id); setItem({ name: selected.name, sku: selected.sku, description: selected.description || '', type: selected.type, uom: selected.uom, hsnSac: selected.hsnSac || '', gstRate: String(selected.gstRate), salePrice: String(selected.salePrice), costPrice: String(selected.costPrice || 0), reorderLevel: String(selected.reorderLevel), imageUrl: selected.imageUrl || '', brandId: selected.brandId ? String(selected.brandId) : '', categoryId: selected.categoryId ? String(selected.categoryId) : '', shopVisible: selected.shopVisible }); setItemOpen(true); };
  const editCustomer = (selected: Customer) => { setEditingCustomerId(selected.id); setCustomer({ name: selected.name, phone: selected.phone || '', email: selected.email || '', gstin: selected.gstin || '', state: selected.state || '', address: selected.address || '' }); setCustomerOpen(true); };
  const submitAdjustment = guarded(async () => { if (!adjustItem) return; try { await api.post(`/commerce/items/${adjustItem.id}/adjust`, { quantity: Number(adjustQuantity), notes: adjustNotes }); setAdjustItem(null); setAdjustQuantity(''); setAdjustNotes(''); await refresh(['commerce-items', 'commerce-item-movements']); toast.success(uiText('Stock adjustment recorded', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message || 'Could not adjust stock', 'feedback')); } });
  const submitOrder = guarded(async () => { try { await api.post('/commerce/orders', { customerId: order.customerId, date: order.date, notes: order.notes, lines: order.lines.map(line => ({ itemId: line.itemId, quantity: Number(line.quantity), rate: line.rate ? Number(line.rate) : undefined, discount: Number(line.discount || 0) })) }); setOrderOpen(false); setOrder(emptySales()); await refresh(['commerce-orders', 'commerce-items']); toast.success(uiText('Sales order created and stock reserved', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message || 'Could not create order', 'feedback')); } });
  const submitInvoice = async (downloadImmediately = false) => {
    if (invoiceSaving) return;
    setInvoiceSaving(true);
    try {
      const res = await api.post('/commerce/invoices', {
        requestKey: invoiceKey,
        ...invoice,
        salesOrderId: invoice.salesOrderId || undefined,
        outwardId: invoice.outwardId || undefined,
        stockDate: !invoice.outwardId && invoiceStockDate ? new Date(invoiceStockDate).toISOString() : undefined,
        buyerState: customers.find(x => x.id === invoice.customerId)?.state,
        lines: invoice.lines.map(line => ({
          itemId: line.itemId,
          quantity: Number(line.quantity),
          rate: line.rate ? Number(line.rate) : undefined,
          discount: Number(line.discount || 0)
        }))
      });
      setInvoiceOpen(false); setInvoiceStockDate('');
      setInvoiceKey(crypto.randomUUID());
      setInvoice({ ...emptySales(), dueDate: '', theme: settings?.defaultInvoiceTheme || 'CLASSIC', currency: 'INR', notes: '', terms: '', transportMode: '', vehicleNo: '', issuerSignature: '', salesOrderId: '', outwardId: '' });
      await refresh(['commerce-invoices', 'commerce-items', 'commerce-customers', 'commerce-orders']);
      toast.success(uiText('GST invoice finalised with SHA-256 cryptographic verification', 'feedback'));
      if (downloadImmediately && res.data) {
        downloadInvoicePdf(res.data);
      }
    } catch (e: any) {
      toast.error(uiText(e.response?.data?.message || 'Could not finalise invoice', 'feedback'));
    } finally { setInvoiceSaving(false); }
  };
  const convertOrder = (selected: any) => { setInvoice({ ...emptySales(), customerId: selected.customerId, salesOrderId: selected.id, outwardId: '', dueDate: '', theme: settings?.defaultInvoiceTheme || 'CLASSIC', currency: 'INR', notes: selected.notes || '', terms: '', transportMode: '', vehicleNo: '', issuerSignature: '', lines: selected.lines.filter((x: any) => x.quantity > x.invoicedQty).map((x: any) => ({ itemId: x.itemId, quantity: String(x.quantity - x.invoicedQty), rate: String(x.rate), discount: String(x.discount || 0) })) }); setInvoiceOpen(true); };
  const invoicePreview = useMemo(() => invoice.lines.reduce((sum, line) => { const found = items.find(x => x.id === line.itemId); const taxable = Number(line.quantity || 0) * Number(line.rate || found?.salePrice || 0) - Number(line.discount || 0); return sum + taxable * (1 + Number(found?.gstRate || 0) / 100); }, 0), [invoice.lines, items]);
  const lineEditor = (sales: typeof order, setSales: React.Dispatch<React.SetStateAction<any>>) => <><Stack spacing={1}>{sales.lines.map((line, index) => <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField select label={uiText("Item", 'forms')} value={line.itemId} onChange={e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, itemId: Number(e.target.value) } : entry) }))} fullWidth>{items.filter(x => x.active || x.id === line.itemId).map(x => <MenuItem key={x.id} value={x.id}>{x.name}{!x.active ? uiText(" · Archived", 'forms') : ''} · {x.stock.available} {x.uom}</MenuItem>)}</TextField><TextField label={uiText("Qty", 'forms')} type="number" value={line.quantity} onChange={e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, quantity: e.target.value } : entry) }))} /><TextField label={uiText("Rate", 'forms')} type="number" value={line.rate} onChange={e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, rate: e.target.value } : entry) }))} /><TextField label={uiText("Discount", 'forms')} type="number" value={line.discount} onChange={e => setSales((old: any) => ({ ...old, lines: old.lines.map((entry: Line, i: number) => i === index ? { ...entry, discount: e.target.value } : entry) }))} /></Stack>)}</Stack><Button onClick={() => setSales((old: any) => ({ ...old, lines: [...old.lines, { itemId: '', quantity: '', rate: '', discount: '' }] }))} sx={{ alignSelf: 'start' }}>{uiText("+ Add line")}</Button></>;
  return <Box sx={{ maxWidth: 1250, mx: 'auto', width: '100%' }}><Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}><Box><Typography variant="h4" fontWeight={800}>{uiText("Business Desk")}</Typography><Typography color="text.secondary">{uiText("Catalogue, customers, orders and GST invoices use one shared stock and ledger.")}</Typography></Box><Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<CustomerIcon />} onClick={() => setCustomerOpen(true)}>{uiText("Customer")}</Button><Button variant="outlined" startIcon={<OrderIcon />} onClick={() => setOrderOpen(true)}>{uiText("Order")}</Button><Button variant="contained" startIcon={<InvoiceIcon />} onClick={() => setInvoiceOpen(true)}>{uiText("Invoice Studio")}</Button></Stack></Box><Paper variant="outlined" sx={{ borderRadius: 3 }}><Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable"><Tab icon={<CatalogueIcon />} iconPosition="start" label={uiText("Catalogue", 'tabs')} /><Tab icon={<CustomerIcon />} iconPosition="start" label={uiText("Customers & Ledger", 'tabs')} /><Tab icon={<OrderIcon />} iconPosition="start" label={uiText("Sales Orders", 'tabs')} /><Tab icon={<InvoiceIcon />} iconPosition="start" label={uiText("Invoices", 'tabs')} /></Tabs></Paper>
    {tab === 0 && <Box sx={{ mt: 2 }}><Button startIcon={<AddIcon />} variant="contained" onClick={() => { setEditingItemId(null); setItem(emptyItem()); setItemOpen(true); }} sx={{ mb: 2 }}>{uiText("Add catalogue item")}</Button><TableContainer component={Paper} variant="outlined"><Table><TableHead><TableRow><TableCell>{uiText("Item", 'tables')}</TableCell><TableCell>{uiText("Type", 'tables')}</TableCell><TableCell>{uiText("HSN / GST", 'tables')}</TableCell><TableCell>{uiText("Stock", 'tables')}</TableCell><TableCell>{uiText("Price", 'tables')}</TableCell><TableCell>{uiText("Actions", 'tables')}</TableCell></TableRow></TableHead><TableBody>{items.map(x => <TableRow key={x.id} sx={{ opacity: x.active ? 1 : 0.55 }}><TableCell><Typography fontWeight={700}>{x.name}</Typography><Typography variant="caption">{x.sku}{!x.active ? uiText(" · Archived", 'tables') : ''}</Typography></TableCell><TableCell>{x.type.replaceAll('_', ' ')}</TableCell><TableCell>{x.hsnSac || '—'} · {x.gstRate}%</TableCell><TableCell sx={{ color: x.stock.available <= x.reorderLevel ? 'error.main' : 'inherit' }}>{x.stock.available} {x.uom}</TableCell><TableCell>{uiText("₹", 'tables')}{x.salePrice.toLocaleString(uiLocale())}</TableCell><TableCell><Button size="small" onClick={() => editItem(x)}>{uiText("Edit", 'tables')}</Button><Button size="small" onClick={() => setHistoryItem(x)}>{uiText("History", 'tables')}</Button>{x.type !== 'SERVICE' && !(x.legacySource && x.type === 'RAW_MATERIAL') && <Button size="small" onClick={() => setAdjustItem(x)}>{uiText("Adjust", 'tables')}</Button>}{x.active && <Button size="small" color="error" onClick={async () => { if (!window.confirm(`Archive ${x.name}? Historical documents will remain.`)) return; try { await api.delete(`/commerce/items/${x.id}`); await refresh(['commerce-items']); toast.success(uiText('Item archived', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message || 'Could not archive item', 'feedback')); } }}>{uiText("Archive", 'tables')}</Button>}</TableCell></TableRow>)}{!items.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>{uiText("No catalogue items yet.", 'tables')}</TableCell></TableRow>}</TableBody></Table></TableContainer><CatalogueTaxonomy /></Box>}
    {tab === 1 && <Box sx={{ mt: 2 }}><TableContainer component={Paper} variant="outlined"><Table><TableHead><TableRow><TableCell>{uiText("Customer", 'tables')}</TableCell><TableCell>{uiText("Contact / GSTIN", 'tables')}</TableCell><TableCell>{uiText("State", 'tables')}</TableCell><TableCell align="right">{uiText("Balance", 'tables')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{customers.map(x => <TableRow key={x.id}><TableCell sx={{ fontWeight: 'bold' }}>{x.name}</TableCell><TableCell>{x.phone || '—'}<br />{x.gstin || ''}</TableCell><TableCell>{x.state}</TableCell><TableCell align="right" sx={{ color: x.balance > 0 ? 'error.main' : 'success.main' }}>{uiText("₹", 'tables')}{x.balance.toLocaleString(uiLocale())}</TableCell><TableCell><Button size="small" onClick={() => editCustomer(x)}>{uiText("Edit", 'tables')}</Button><Button size="small" onClick={async () => { try { setLedgerName(x.name); setLedger((await api.get(`/commerce/customers/${x.id}/ledger`)).data); } catch { toast.error(uiText('Could not load ledger', 'feedback')); } }}>{uiText("Ledger", 'tables')}</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer></Box>}
    {tab === 2 && <Box sx={{ mt: 2 }}><TableContainer component={Paper} variant="outlined"><Table><TableHead><TableRow><TableCell>{uiText("Order", 'tables')}</TableCell><TableCell>{uiText("Customer", 'tables')}</TableCell><TableCell>{uiText("Status", 'tables')}</TableCell><TableCell align="right">{uiText("Total", 'tables')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{orders.map(x => <TableRow key={x.id}><TableCell>{x.orderNo}</TableCell><TableCell>{x.customer?.name}</TableCell><TableCell>{uiText(x.status, 'tables')}</TableCell><TableCell align="right">{uiText("₹", 'tables')}{x.total.toLocaleString(uiLocale())}</TableCell><TableCell>{['CONFIRMED','PARTIALLY_INVOICED'].includes(x.status) && <Button size="small" onClick={() => convertOrder(x)}>{uiText("Invoice", 'tables')}</Button>}{['CONFIRMED','PARTIALLY_INVOICED'].includes(x.status) && <Button size="small" color="error" onClick={async()=>{try{await api.post(`/commerce/orders/${x.id}/cancel`,{notes:'Cancelled from Business Desk'});await refresh(['commerce-orders','commerce-items']);toast.success(uiText('Order cancelled and stock released', 'feedback'));}catch(e:any){toast.error(uiText(e.response?.data?.message||'Could not cancel order', 'feedback'))}}}>{uiText("Cancel remaining", 'tables')}</Button>}</TableCell></TableRow>)}</TableBody></Table></TableContainer></Box>}
    {tab === 3 && <Box sx={{ mt: 2 }}><TableContainer component={Paper} variant="outlined"><Table><TableHead><TableRow><TableCell>{uiText("Invoice", 'tables')}</TableCell><TableCell>{uiText("Customer", 'tables')}</TableCell><TableCell>{uiText("GST", 'tables')}</TableCell><TableCell>{uiText("Status", 'tables')}</TableCell><TableCell align="right">{uiText("Total", 'tables')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{invoices.map(x => <TableRow key={x.id}><TableCell><Typography fontWeight={700}>{x.invoiceNo}</Typography><Typography variant="caption">{x.documentHash?.slice(0, 12)}</Typography></TableCell><TableCell>{x.customerName || x.customer?.name}</TableCell><TableCell>{uiText("CGST ₹", 'tables')}{x.cgst} {uiText(" · SGST ₹", 'tables')}{x.sgst} {uiText(" · IGST ₹", 'tables')}{x.igst}</TableCell><TableCell>{uiText(x.status, 'tables')}</TableCell><TableCell align="right">{uiText("₹", 'tables')}{x.total.toLocaleString(uiLocale())}</TableCell><TableCell><Button size="small" onClick={()=>downloadInvoicePdf(x)}>{uiText("Download PDF", 'tables')}</Button><Button size="small" onClick={() => { setPaymentInvoiceId(x.id); setPaymentKey(crypto.randomUUID()); setPaymentAmount(''); setPaymentNotes(''); }}>{uiText("Payments", 'tables')}</Button>{x.status!=='VOID'&&<Button size="small" color="error" onClick={async()=>{if(!window.confirm(`Void invoice ${x.invoiceNo}? This reverses billing. Direct-sale stock is returned; an existing dispatch stays dispatched.`))return;try{await api.post(`/commerce/invoices/${x.id}/void`,{notes:'Voided from Invoice Studio'});await refresh(['commerce-invoices','commerce-customers','commerce-items']);toast.success(uiText('Invoice voided', 'feedback'))}catch(e:any){toast.error(uiText(e.response?.data?.message||'Could not void invoice', 'feedback'))}}}>{uiText("Void", 'tables')}</Button>}</TableCell></TableRow>)}</TableBody></Table></TableContainer></Box>}

    <Dialog open={!!paymentInvoiceId} onClose={() => { if (!paymentSaving) setPaymentInvoiceId(null); }} fullWidth maxWidth="sm">
      <DialogTitle>{uiText("Payments ? ")}{paymentInvoice?.invoiceNo}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <Typography>{uiText("Paid ₹")}{Number(paymentInvoice?.amountPaid || 0).toLocaleString(uiLocale())} {uiText(" · Credited ₹")}{Number(paymentInvoice?.creditTotal || 0).toLocaleString(uiLocale())} {uiText(" · Remaining ₹")}{Math.max(0, Number((paymentInvoice?.total || 0) - (paymentInvoice?.creditTotal || 0) - (paymentInvoice?.amountPaid || 0))).toLocaleString(uiLocale())}</Typography>
        {paymentInvoice?.status !== 'VOID' && <>
          <TextField label={uiText("Amount received", 'forms')} type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
          <TextField select label={uiText("Method", 'forms')} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>{['CASH','BANK','UPI','CHEQUE'].map(method => <MenuItem key={method} value={method}>{method}</MenuItem>)}</TextField>
          <TextField label={uiText("Receipt reference / reversal reason", 'forms')} value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} helperText={uiText("A reason is required to reverse a receipt. Its original record is retained.", 'forms')} />
          <Button variant="contained" disabled={paymentSaving || Number(paymentAmount) <= 0 || !Number.isFinite(Number(paymentAmount))} onClick={async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments', { amount: Number(paymentAmount), method: paymentMethod, reference: paymentNotes, idempotencyKey: paymentKey }); setPaymentAmount(''); setPaymentKey(crypto.randomUUID()); await refresh(['commerce-invoices', 'commerce-customers']); toast.success(uiText('Payment recorded', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message || 'Could not record payment', 'feedback')); } finally { setPaymentSaving(false); } }}>{uiText("Record payment")}</Button>
        </>}
        <Typography variant="subtitle2">{uiText("Receipt history")}</Typography>
        {paymentInvoice?.payments?.map((payment: any) => {
          const reversed = paymentInvoice.payments.some((row: any) => row.method === 'REVERSAL' && row.reference === 'PAYMENT-REVERSAL:' + payment.id);
          return <Stack key={payment.id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="body2">{new Date(payment.date).toLocaleDateString(uiDateLocale())} · {payment.method} {uiText("· ₹")}{Number(payment.amount).toLocaleString(uiLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{reversed ? uiText(" · Reversed") : ''}</Typography>
            {payment.amount > 0 && !reversed && paymentInvoice.status !== 'VOID' && payment.method !== 'ALLOCATION' && !paymentInvoice.creditTotal && <Button color="error" disabled={paymentSaving || !paymentNotes.trim()} onClick={async () => { setPaymentSaving(true); try { await api.post('/commerce/invoices/' + paymentInvoice.id + '/payments/' + payment.id + '/reverse', { notes: paymentNotes }); await refresh(['commerce-invoices', 'commerce-customers']); toast.success(uiText('Payment reversed; original receipt retained', 'feedback')); } catch (e: any) { toast.error(uiText(e.response?.data?.message || 'Could not reverse payment', 'feedback')); } finally { setPaymentSaving(false); } }}>{uiText("Reverse")}</Button>}
          </Stack>;
        })}
        {!paymentInvoice?.payments?.length && <Typography color="text.secondary">{uiText("No receipts recorded.")}</Typography>}
      </Stack></DialogContent><DialogActions><Button disabled={paymentSaving} onClick={() => setPaymentInvoiceId(null)}>{uiText("Close")}</Button></DialogActions>
    </Dialog>
    <Dialog open={itemOpen} onClose={() => setItemOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>{editingItemId ? uiText("Edit catalogue item") : uiText("Add catalogue item")}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label={uiText("Name", 'forms')} required value={item.name} onChange={e => setItem({ ...item, name: e.target.value })} fullWidth /><TextField label={uiText("SKU", 'forms')} required value={item.sku} onChange={e => setItem({ ...item, sku: e.target.value })} fullWidth /></Stack>
        <TextField label={uiText("Public product description", 'forms')} value={item.description} onChange={e => setItem({ ...item, description: e.target.value })} multiline minRows={2} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField select label={uiText("Type", 'forms')} value={item.type} onChange={e => setItem({ ...item, type: e.target.value })} fullWidth>{['RAW_MATERIAL', 'YARN', 'FINISHED_GOOD', 'JOB_WORK_MATERIAL', 'SERVICE'].map(x => <MenuItem key={x} value={x}>{x.replaceAll('_', ' ')}</MenuItem>)}</TextField><TextField label={uiText("UOM", 'forms')} required value={item.uom} error={itemErrors.uom} onChange={e => setItem({ ...item, uom: e.target.value })} fullWidth /></Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select label={uiText("Brand", 'forms')} value={item.brandId} onChange={e => setItem({ ...item, brandId: e.target.value })} fullWidth><MenuItem value="">{uiText("None", 'forms')}</MenuItem>{brands.filter(x => x.active || String(x.id) === item.brandId).map(x => <MenuItem key={x.id} value={String(x.id)}>{x.name}</MenuItem>)}</TextField>
          <TextField select label={uiText("Category", 'forms')} value={item.categoryId} onChange={e => setItem({ ...item, categoryId: e.target.value })} fullWidth><MenuItem value="">{uiText("None", 'forms')}</MenuItem>{categories.filter(x => x.active || String(x.id) === item.categoryId).map(x => <MenuItem key={x.id} value={String(x.id)}>{x.name}</MenuItem>)}</TextField>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label={uiText("HSN/SAC", 'forms')} value={item.hsnSac} onChange={e => setItem({ ...item, hsnSac: e.target.value })} fullWidth /><TextField label={uiText("GST %", 'forms')} type="number" value={item.gstRate} error={itemErrors.gstRate} helperText={itemErrors.gstRate ? uiText("0 to 100", 'forms') : ''} slotProps={{ htmlInput: { min: 0, max: 100, step: 'any' } }} onChange={e => setItem({ ...item, gstRate: e.target.value })} fullWidth /><TextField label={uiText("Sale price", 'forms')} type="number" value={item.salePrice} error={itemErrors.salePrice} helperText={itemErrors.salePrice ? uiText("Zero or more", 'forms') : ''} slotProps={{ htmlInput: { min: 0, step: 'any' } }} onChange={e => setItem({ ...item, salePrice: e.target.value })} fullWidth /></Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField label={uiText("Cost price", 'forms')} type="number" value={item.costPrice} error={itemErrors.costPrice} helperText={itemErrors.costPrice ? uiText("Zero or more", 'forms') : ''} slotProps={{ htmlInput: { min: 0, step: 'any' } }} onChange={e => setItem({ ...item, costPrice: e.target.value })} fullWidth /><TextField label={uiText("Low-stock threshold", 'forms')} type="number" value={item.reorderLevel} error={itemErrors.reorderLevel} helperText={itemErrors.reorderLevel ? uiText("Zero or more", 'forms') : ''} slotProps={{ htmlInput: { min: 0, step: 'any' } }} onChange={e => setItem({ ...item, reorderLevel: e.target.value })} fullWidth /></Stack>
        <TextField label={uiText("Product image reference", 'forms')} value={item.imageUrl} onChange={e => setItem({ ...item, imageUrl: e.target.value })} helperText={uiText("Use an application-managed image reference.", 'forms')} />
        <FormControlLabel control={<Switch checked={item.shopVisible} onChange={e => setItem({ ...item, shopVisible: e.target.checked })} disabled={!['YARN', 'FINISHED_GOOD', 'SERVICE'].includes(item.type)} />} label={uiText("Publish in public shop", 'forms')} />
        <Typography variant="caption" color="text.secondary">{uiText("Only published yarn, finished goods and services appear at /shop. Existing items remain private until enabled.")}</Typography>
      </Stack></DialogContent>
      <DialogActions><Button onClick={() => setItemOpen(false)}>{uiText("Cancel")}</Button><Button variant="contained" disabled={busy || itemInvalid} onClick={saveItem}>{busy ? uiText("Saving…") : uiText("Save")}</Button></DialogActions>
    </Dialog>
    <Dialog open={customerOpen} onClose={() => setCustomerOpen(false)} fullWidth maxWidth="sm"><DialogTitle>{editingCustomerId ? uiText("Edit customer") : uiText("Add customer")}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField label={uiText("Name", 'forms')} required value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} /><TextField label={uiText("Phone", 'forms')} value={customer.phone} error={customerField('phone')} onChange={e => setCustomer({ ...customer, phone: e.target.value })} /><TextField label={uiText("Email", 'forms')} type="email" value={customer.email} error={customerField('email')} onChange={e => setCustomer({ ...customer, email: e.target.value })} /><TextField label={uiText("GSTIN", 'forms')} value={customer.gstin} error={customerField('gstin')} helperText={uiText("15 characters; the state is filled from its first two digits", 'forms')} slotProps={{ htmlInput: { maxLength: 15, style: { textTransform: 'uppercase' } } }} onChange={e => { const gstin = e.target.value.toUpperCase(); setCustomer({ ...customer, gstin, state: customer.state || gstinStateName(gstin) || '' }); }} /><TextField select label={uiText("State", 'forms')} value={customer.state} error={customerField('state')} helperText={uiText("Decides CGST + SGST or IGST on invoices", 'forms')} onChange={e => setCustomer({ ...customer, state: e.target.value })}>{stateNames.map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField><TextField label={uiText("Address", 'forms')} value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} multiline /></Stack></DialogContent>{customerError && <Typography role="alert" variant="body2" color="error" sx={{ px: 3 }}>{customerError}</Typography>}<DialogActions><Button onClick={() => setCustomerOpen(false)}>{uiText("Cancel")}</Button><Button variant="contained" disabled={busy || !customer.name.trim() || Boolean(customerError)} onClick={saveCustomer}>{busy ? uiText("Saving…") : uiText("Save")}</Button></DialogActions></Dialog>
    <Dialog open={!!adjustItem} onClose={() => setAdjustItem(null)} fullWidth maxWidth="xs"><DialogTitle>{uiText("Adjust stock · ")}{adjustItem?.name}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><Typography variant="body2">{uiText("Available: ")}{adjustItem?.stock.available} {adjustItem?.uom}{uiText(". Use a negative quantity to reduce stock.")}</Typography><TextField label={uiText("Quantity change", 'forms')} type="number" value={adjustQuantity} onChange={e => setAdjustQuantity(e.target.value)} /><TextField label={uiText("Reason", 'forms')} value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} multiline /></Stack></DialogContent><DialogActions><Button onClick={() => setAdjustItem(null)}>{uiText("Cancel")}</Button><Button variant="contained" disabled={busy || !Number(adjustQuantity)} onClick={submitAdjustment}>{uiText("Record adjustment")}</Button></DialogActions></Dialog>
    <Dialog open={!!historyItem} onClose={() => setHistoryItem(null)} fullWidth maxWidth="md"><DialogTitle>{uiText("Stock history · ")}{historyItem?.name}</DialogTitle><DialogContent><TableContainer><Table size="small"><TableHead><TableRow><TableCell>{uiText("Date", 'tables')}</TableCell><TableCell>{uiText("Movement", 'tables')}</TableCell><TableCell>{uiText("Reference", 'tables')}</TableCell><TableCell align="right">{uiText("Quantity", 'tables')}</TableCell><TableCell align="right">{uiText("Reserved", 'tables')}</TableCell></TableRow></TableHead><TableBody>{movements.map(row => <TableRow key={row.id}><TableCell>{new Date(row.date).toLocaleDateString(uiDateLocale())}</TableCell><TableCell>{row.movementType}</TableCell><TableCell>{row.referenceType} {row.referenceId || ''}</TableCell><TableCell align="right">{Number(row.quantity).toLocaleString(uiLocale(), { maximumFractionDigits: 3 })}</TableCell><TableCell align="right">{Number(row.reservedQty).toLocaleString(uiLocale(), { maximumFractionDigits: 3 })}</TableCell></TableRow>)}{!movements.length && <TableRow><TableCell colSpan={5} align="center">{uiText("No movements yet.", 'tables')}</TableCell></TableRow>}</TableBody></Table></TableContainer></DialogContent><DialogActions><Button onClick={() => setHistoryItem(null)}>{uiText("Close")}</Button></DialogActions></Dialog>
    <Dialog open={orderOpen} onClose={() => setOrderOpen(false)} fullWidth maxWidth="md"><DialogTitle>{uiText("New sales order")}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField select label={uiText("Customer", 'forms')} value={order.customerId} onChange={e => setOrder({ ...order, customerId: Number(e.target.value) })}>{customers.map(x => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}</TextField>{lineEditor(order, setOrder)}<TextField label={uiText("Notes", 'forms')} value={order.notes} onChange={e => setOrder({ ...order, notes: e.target.value })} /></Stack></DialogContent><DialogActions><Button onClick={() => setOrderOpen(false)}>{uiText("Cancel")}</Button><Button variant="contained" disabled={busy || !order.customerId} onClick={submitOrder}>{busy ? uiText("Reserving…") : uiText("Reserve stock")}</Button></DialogActions></Dialog>
    <Dialog open={invoiceOpen} onClose={() => setInvoiceOpen(false)} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{uiText("Invoice Studio & GST Generator")}</span>
        <Chip label={uiTemplate`Theme: ${invoice.theme || 'CLASSIC'}`} size="small" color="primary" variant="outlined" />
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label={uiText("Customer", 'forms')} disabled={!!invoice.outwardId || !!invoice.salesOrderId} value={invoice.customerId} onChange={e => setInvoice({ ...invoice, customerId: Number(e.target.value) })} fullWidth required error={!invoice.customerId}>
              {customers.map(x => <MenuItem key={x.id} value={x.id}>{x.name} {x.state ? uiScopedTemplate('forms')`(${x.state})` : ''}</MenuItem>)}
            </TextField>
            <TextField label={uiText("Issued from", 'forms')} value={companyState} fullWidth slotProps={{ input: { readOnly: true } }} helperText={uiText("State of the company GSTIN in Settings", 'forms')} />
            <TextField label={uiText("Invoice date", 'forms')} type="date" value={invoice.date} onChange={e => setInvoice({ ...invoice, date: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label={uiText("Due Date", 'forms')} type="date" value={invoice.dueDate} onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
          </Stack>


          {!invoice.outwardId && <TextField type="datetime-local" label={uiText("Delivery time (optional)", 'forms')} value={invoiceStockDate} onChange={e => setInvoiceStockDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText={uiText("Blank records delivery when finalised. Invoice date is the billing date; choose a delivery time for historical stock entries.", 'forms')} />}
          <TextField select label={uiText("Stock flow", 'forms')} value={invoice.outwardId} disabled={!!invoice.salesOrderId} helperText={invoice.outwardId ? uiText("Bill goods already dispatched. This invoice will not deduct stock again.", 'forms') : uiText("Direct sale: this invoice deducts stock and completes delivery.", 'forms')} onChange={e => {
            const outwardId = Number(e.target.value) || '';
            const selected = dispatches.find(row => row.id === outwardId);
            if (!selected) { setInvoice({ ...invoice, outwardId: '', lines: [{ itemId: '', quantity: '', rate: '', discount: '' }] }); return; }
            const buyer = customers.find(row => row.name.trim().toLowerCase() === selected.customerName.trim().toLowerCase());
            if (!buyer) { toast.error(uiText('Add the dispatch customer in Customers before billing it', 'feedback')); return; }
            const lines = selected.items.map((row: any) => {
              const stockItem = items.find(item => item.type === 'YARN' && (item.legacyId === row.count || item.sku === 'LEGACY-YARN-' + row.count));
              const billed = invoices.filter(doc => doc.outwardId === selected.id && doc.status !== 'VOID').flatMap(doc => doc.items).filter(line => line.itemId === stockItem?.id).reduce((sum, line) => sum + Number(line.quantity || 0), 0);
              return { itemId: stockItem?.id || '' as const, quantity: String(Math.max(0, row.weight - billed)), rate: String(stockItem?.salePrice || 0), discount: '' };
            }).filter((line: Line) => Number(line.quantity) > 0);
            setInvoice({ ...invoice, outwardId, customerId: buyer.id, vehicleNo: selected.vehicleNo || '', lines });
          }}>
            <MenuItem value="">{uiText("Direct stock sale", 'forms')}</MenuItem>
            {dispatches.filter(row => row.status !== 'REVERSED').map(row => <MenuItem key={row.id} value={row.id}>{uiText("Dispatch #", 'forms')}{row.id} · {row.customerName} · {row.totalWeight} {uiText(" kg", 'forms')}</MenuItem>)}
          </TextField>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>{uiText("Invoice Line Items")}</Typography>
            {lineEditor(invoice, setInvoice)}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label={uiText("Template Theme", 'forms')} value={invoice.theme} onChange={e => setInvoice({ ...invoice, theme: e.target.value })} fullWidth>
              <MenuItem value="CLASSIC">{uiText("CLASSIC (EverGreen Deep Emerald)", 'forms')}</MenuItem>
              <MenuItem value="MODERN">{uiText("MODERN (Tech Indigo & Accent Header)", 'forms')}</MenuItem>
              <MenuItem value="MINIMAL">{uiText("MINIMAL (Monochrome Clean Grid)", 'forms')}</MenuItem>
            </TextField>
            <TextField label={uiText("Transport Mode", 'forms')} placeholder={uiText("Road / Lorry", 'forms')} value={invoice.transportMode} onChange={e => setInvoice({ ...invoice, transportMode: e.target.value })} fullWidth />
            <TextField label={uiText("Vehicle Number", 'forms')} placeholder={uiText("TN 01 AB 1234", 'forms')} value={invoice.vehicleNo} onChange={e => setInvoice({ ...invoice, vehicleNo: e.target.value })} fullWidth />
            <TextField label={uiText("Authorised Signatory", 'forms')} placeholder={uiText("e.g. S. Gokul (Partner)", 'forms')} value={invoice.issuerSignature} onChange={e => setInvoice({ ...invoice, issuerSignature: e.target.value })} fullWidth />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={uiText("Customer Notes", 'forms')} placeholder={uiText("Thank you for your business...", 'forms')} value={invoice.notes} onChange={e => setInvoice({ ...invoice, notes: e.target.value })} multiline rows={2} fullWidth />
            <TextField label={uiText("Payment Terms", 'forms')} placeholder={uiText("Net 15 days, 18% p.a. interest after due date", 'forms')} value={invoice.terms} onChange={e => setInvoice({ ...invoice, terms: e.target.value })} multiline rows={2} fullWidth />
          </Stack>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)', borderColor: 'primary.main' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                  {uiText("Cryptographic Verification Fingerprint ")}</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', display: 'inline-block' }} />
                  {uiText("SHA-256 Dynamic Hash Protected (Intra/Interstate Auto-Split) ")}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">{uiText("Total Payable (incl. GST)")}</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={900}>
                  {uiText("₹")}{invoicePreview.toLocaleString(uiLocale(), { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
        <Button onClick={() => setInvoiceOpen(false)} color="inherit">{uiText("Cancel")}</Button>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" disabled={invoiceSaving} onClick={() => submitInvoice(false)}>{uiText("Finalise")}</Button>
          <Button variant="contained" startIcon={<InvoiceIcon />} disabled={invoiceSaving} onClick={() => submitInvoice(true)}>{uiText("Finalise & Download PDF")}</Button>
        </Stack>
      </DialogActions>
    </Dialog>
    <Dialog open={!!ledger} onClose={() => setLedger(null)} fullWidth maxWidth="sm"><DialogTitle>{ledgerName} {uiText(" ledger")}</DialogTitle><DialogContent><Table><TableHead><TableRow><TableCell>{uiText("Date", 'tables')}</TableCell><TableCell>{uiText("Type", 'tables')}</TableCell><TableCell align="right">{uiText("Debit", 'tables')}</TableCell><TableCell align="right">{uiText("Credit", 'tables')}</TableCell></TableRow></TableHead><TableBody>{ledger?.map(row => <TableRow key={row.id}><TableCell>{new Date(row.date).toLocaleDateString(uiDateLocale())}</TableCell><TableCell>{row.type}</TableCell><TableCell align="right">{uiText("₹", 'tables')}{row.debit}</TableCell><TableCell align="right">{uiText("₹", 'tables')}{row.credit}</TableCell></TableRow>)}</TableBody></Table></DialogContent><DialogActions><Button onClick={() => setLedger(null)}>{uiText("Close")}</Button></DialogActions></Dialog>
  </Box>;
};
export default CommerceDesk;
