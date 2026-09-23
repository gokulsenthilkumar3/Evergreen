import { useMemo, useState } from 'react';
import { Add as AddIcon, Remove as RemoveIcon, ShoppingCart as CartIcon } from '@mui/icons-material';
import { Box, Button, Chip, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';

type StoreItem = { id: number; sku: string; name: string; type: string; uom: string; salePrice: number; gstRate: number; active: boolean; stock: { available: number } };
type StoreCustomer = { id: number; name: string; active: boolean };
type CartLine = { itemId: number; quantity: number };
const money = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Store({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [saving, setSaving] = useState(false);
  const { data: items = [], isLoading } = useQuery<StoreItem[]>({ queryKey: ['commerce-items'], queryFn: async () => (await api.get('/commerce/items')).data });
  const { data: customers = [] } = useQuery<StoreCustomer[]>({ queryKey: ['commerce-customers'], queryFn: async () => (await api.get('/commerce/customers')).data });
  const visibleItems = useMemo(() => items.filter(item => item.active && (item.type === 'SERVICE' || item.stock.available > 0) && `${item.name} ${item.sku}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const cartRows = useMemo(() => cart.map(line => ({ ...line, item: items.find(item => item.id === line.itemId) })).filter(row => !!row.item), [cart, items]);
  const estimatedTotal = cartRows.reduce((sum, row) => sum + row.quantity * row.item!.salePrice * (1 + row.item!.gstRate / 100), 0);
  const changeQuantity = (item: StoreItem, difference: number) => {
    setCart(previous => {
      const existing = previous.find(line => line.itemId === item.id);
      const nextQuantity = Math.max(0, (existing?.quantity || 0) + difference);
      if (item.type !== 'SERVICE' && nextQuantity > item.stock.available) { toast.error(`Only ${item.stock.available} ${item.uom} available`); return previous; }
      if (!existing && nextQuantity > 0) return [...previous, { itemId: item.id, quantity: nextQuantity }];
      return previous.map(line => line.itemId === item.id ? { ...line, quantity: nextQuantity } : line).filter(line => line.quantity > 0);
    });
  };
  const reserveOrder = async () => {
    if (!customerId || !cart.length) { toast.error('Choose a customer and at least one item'); return; }
    setSaving(true);
    try {
      await api.post('/commerce/orders', { customerId, notes, lines: cart.map(line => ({ itemId: line.itemId, quantity: line.quantity })) });
      setCart([]); setNotes('');
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['commerce-items'] }), queryClient.invalidateQueries({ queryKey: ['commerce-orders'] })]);
      toast.success('Sales order created and stock reserved');
    } catch (error: any) { toast.error(error.response?.data?.message || 'Could not create order'); }
    finally { setSaving(false); }
  };

  return <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%' }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
      <Box><Typography variant="h4" fontWeight={800}>Store</Typography><Typography color="text.secondary">Sell from the shared catalogue and reserve stock in a sales order.</Typography></Box>
      <Stack direction="row" spacing={1}><Button variant="contained" href="/shop" target="_blank" rel="noopener noreferrer">Open public shop</Button><Button variant="outlined" onClick={() => onNavigate?.('catalogue')}>Manage catalogue</Button><Button variant="outlined" onClick={() => onNavigate?.('orders')}>Sales orders</Button></Stack>
    </Stack>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <TextField label="Search products or SKU" value={search} onChange={event => setSearch(event.target.value)} size="small" fullWidth sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {visibleItems.map(item => <Grid key={item.id} size={{ xs: 12, sm: 6, xl: 4 }}><Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" spacing={1}><Typography fontWeight={700}>{item.name}</Typography><Chip label={item.type.replaceAll('_', ' ')} size="small" /></Stack>
            <Typography variant="caption" color="text.secondary">{item.sku}</Typography>
            <Typography sx={{ mt: 1 }}>{money(item.salePrice)} <Typography component="span" variant="caption">+ {item.gstRate}% GST</Typography></Typography>
            <Typography variant="body2" color="text.secondary">{item.type === 'SERVICE' ? 'Service' : `${item.stock.available} ${item.uom} available`}</Typography>
            <Button sx={{ mt: 2 }} variant="outlined" fullWidth startIcon={<AddIcon />} onClick={() => changeQuantity(item, 1)}>Add to order</Button>
          </Paper></Grid>)}
        </Grid>
        {!isLoading && !visibleItems.length && <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>No available items match your search. Add stock or manage the catalogue.</Paper>}
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: { lg: 'sticky' }, top: 16 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}><CartIcon color="primary" /><Typography variant="h6" fontWeight={700}>Current order</Typography></Stack>
        <TextField select label="Customer" value={customerId} onChange={event => setCustomerId(Number(event.target.value))} fullWidth size="small" sx={{ mb: 2 }}><MenuItem value="">Choose customer</MenuItem>{customers.filter(customer => customer.active).map(customer => <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>)}</TextField>
        {!customers.length && <Button onClick={() => onNavigate?.('customers')} sx={{ mb: 1 }}>Add customer</Button>}
        {cartRows.map(row => <Stack key={row.itemId} direction="row" alignItems="center" spacing={1} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}><Box sx={{ flex: 1 }}><Typography fontWeight={600}>{row.item!.name}</Typography><Typography variant="caption">{money(row.item!.salePrice)} / {row.item!.uom}</Typography></Box><IconButton size="small" aria-label={`Remove ${row.item!.name}`} onClick={() => changeQuantity(row.item!, -1)}><RemoveIcon fontSize="small" /></IconButton><Typography>{row.quantity}</Typography><IconButton size="small" aria-label={`Add ${row.item!.name}`} onClick={() => changeQuantity(row.item!, 1)}><AddIcon fontSize="small" /></IconButton></Stack>)}
        {!cartRows.length && <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No items selected.</Typography>}
        <TextField label="Order notes" value={notes} onChange={event => setNotes(event.target.value)} multiline minRows={2} fullWidth size="small" sx={{ mt: 2 }} />
        <Stack direction="row" justifyContent="space-between" sx={{ my: 2 }}><Typography fontWeight={700}>Estimated total incl. GST</Typography><Typography fontWeight={800}>{money(estimatedTotal)}</Typography></Stack>
        <Button variant="contained" fullWidth disabled={saving || !customerId || !cart.length} onClick={reserveOrder}>{saving ? 'Reserving…' : 'Create sales order'}</Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Final tax and payment are recorded when the order is converted in Invoice Studio.</Typography>
      </Paper></Grid>
    </Grid>
  </Box>;
}
