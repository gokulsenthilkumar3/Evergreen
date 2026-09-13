import React from 'react';
import { Assessment as ReportIcon, Inventory2 as StockIcon, ReceiptLong as InvoiceIcon, SyncAlt as JobIcon, ShoppingCart as OrderIcon } from '@mui/icons-material';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const CommerceReports: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['commerce-report'], queryFn: async () => (await api.get('/commerce/report')).data });
  const cards = [
    ['Open sales orders', data?.openOrders ?? 0, <OrderIcon />, '#2563eb'],
    ['Receivables', `₹${Number(data?.receivables ?? 0).toLocaleString('en-IN')}`, <InvoiceIcon />, '#dc2626'],
    ['Invoiced value', `₹${Number(data?.invoicedValue ?? 0).toLocaleString('en-IN')}`, <ReportIcon />, '#059669'],
    ['Open job work', data?.openJobWork ?? 0, <JobIcon />, '#7c3aed'],
  ];
  return <Box sx={{ maxWidth: 1150, mx: 'auto', width: '100%' }}><Typography variant="h4" fontWeight={800}>Business Reports</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Sales, receivables, low stock and job-work exposure from the unified ledger.</Typography><Grid container spacing={2.5}>{cards.map(([label, value, icon, color]) => <Grid key={String(label)} size={{ xs: 12, sm: 6, md: 3 }}><Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}><Box sx={{ color, mb: 1 }}>{icon}</Box><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={800}>{isLoading ? '…' : value}</Typography></Paper></Grid>)}</Grid><Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 3 }}><Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}><StockIcon color="error" /><Typography fontWeight={800}>Low-stock catalogue items</Typography></Box>{data?.lowStock?.length ? data.lowStock.map((item: any) => <Typography key={item.id} sx={{ py: .5 }}>{item.name} — {item.stock.available} {item.uom} available (threshold {item.reorderLevel})</Typography>) : <Typography color="text.secondary">No catalogue low-stock alerts.</Typography>}</Paper></Box>;
};
export default CommerceReports;
