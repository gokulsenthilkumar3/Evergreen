import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, CircularProgress, TextField, InputAdornment } from '@mui/material';
import { Dashboard as DashboardIcon, Inventory as ProductsIcon, People as CustomersIcon, Receipt as InvoicesIcon, Settings as SettingsIcon, Add as AddIcon, Search as SearchIcon, TrendingUp, AttachMoney, ShoppingCart, PeopleAlt } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const TabPanel = ({ children, value, index }: any) => <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;

const MSME_TABS = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Products', icon: <ProductsIcon fontSize="small" /> },
  { label: 'Customers', icon: <CustomersIcon fontSize="small" /> },
  { label: 'Invoices', icon: <InvoicesIcon fontSize="small" /> },
];

const MsmeErp: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const { data: report, isLoading: repLoading } = useQuery({ queryKey: ['msme-report'], queryFn: async () => (await api.get('/commerce/report')).data });
  const { data: items = [], isLoading: itemsLoading } = useQuery({ queryKey: ['msme-items'], queryFn: async () => (await api.get('/commerce/items')).data, enabled: tab === 1 });
  const { data: customers = [], isLoading: cusLoading } = useQuery({ queryKey: ['msme-customers'], queryFn: async () => (await api.get('/commerce/customers')).data, enabled: tab === 2 });
  const { data: invoices = [], isLoading: invLoading } = useQuery({ queryKey: ['msme-invoices'], queryFn: async () => (await api.get('/commerce/invoices')).data, enabled: tab === 3 });

  const kpis = [
    { label: 'Open Orders', value: report?.openOrders ?? 0, icon: <ShoppingCart />, color: '#3b82f6', suffix: '' },
    { label: 'Receivables', value: report?.receivables ?? 0, icon: <AttachMoney />, color: '#ef4444', suffix: '\u20b9', isCurrency: true },
    { label: 'Invoiced Value', value: report?.invoicedValue ?? 0, icon: <TrendingUp />, color: '#059669', suffix: '\u20b9', isCurrency: true },
    { label: 'Open Job Work', value: report?.openJobWork ?? 0, icon: <PeopleAlt />, color: '#8b5cf6', suffix: '' },
  ];

  const filtered = (arr: any[]) => arr.filter(i => JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>MSME ERP</Typography>
        <Typography color="text.secondary">Micro & small enterprise management — Products, Customers, Invoices</Typography>
      </Box>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover', '& .MuiTab-root': { minHeight: 52, fontWeight: 600, textTransform: 'none', fontSize: '0.85rem' } }}>
          {MSME_TABS.map((t, i) => <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />)}
        </Tabs>
        <Box sx={{ p: 3 }}>
          {/* DASHBOARD */}
          <TabPanel value={tab} index={0}>
            {repLoading ? <CircularProgress /> : (
              <Grid container spacing={2.5}>
                {kpis.map(k => (
                  <Grid key={k.label} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', transition: 'all 0.2s' } }}>
                      <CardContent>
                        <Box sx={{ color: k.color, mb: 1 }}>{k.icon}</Box>
                        <Typography variant="body2" color="text.secondary">{k.label}</Typography>
                        <Typography variant="h5" fontWeight={800}>{k.isCurrency ? `\u20b9${Number(k.value).toLocaleString('en-IN')}` : k.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {report?.lowStock?.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                      <Typography fontWeight={700} sx={{ mb: 1.5 }}>Low Stock Alerts</Typography>
                      {report.lowStock.map((item: any) => (
                        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: 1, borderColor: 'divider' }}>
                          <Typography variant="body2">{item.name}</Typography>
                          <Chip label={`${item.stock?.available ?? 0} ${item.uom}`} color="error" size="small" variant="outlined" />
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </TabPanel>
          {/* PRODUCTS */}
          <TabPanel value={tab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField size="small" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
              <Button variant="contained" startIcon={<AddIcon />} size="small">Add Product</Button>
            </Box>
            {itemsLoading ? <CircularProgress /> : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>Name</TableCell><TableCell sx={{ fontWeight: 700 }}>Category</TableCell><TableCell sx={{ fontWeight: 700 }} align="right">Stock</TableCell><TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
                  <TableBody>
                    {filtered(items).length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>No products found.</TableCell></TableRow>}
                    {filtered(items).map((item: any) => (
                      <TableRow key={item.id} hover>
                        <TableCell><Typography variant="body2" fontWeight={600}>{item.name}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{item.category?.name || '\u2014'}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{item.stock?.available ?? 0} {item.uom}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={600}>\u20b9{(item.salePrice || 0).toLocaleString('en-IN')}</Typography></TableCell>
                        <TableCell><Chip label={item.archived ? 'Archived' : 'Active'} size="small" color={item.archived ? 'default' : 'success'} variant="outlined" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
          {/* CUSTOMERS */}
          <TabPanel value={tab} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField size="small" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
              <Button variant="contained" startIcon={<AddIcon />} size="small">Add Customer</Button>
            </Box>
            {cusLoading ? <CircularProgress /> : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>Name</TableCell><TableCell sx={{ fontWeight: 700 }}>Phone</TableCell><TableCell sx={{ fontWeight: 700 }}>City</TableCell><TableCell sx={{ fontWeight: 700 }} align="right">Balance</TableCell></TableRow></TableHead>
                  <TableBody>
                    {filtered(customers).length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.disabled' }}>No customers found.</TableCell></TableRow>}
                    {filtered(customers).map((c: any) => (
                      <TableRow key={c.id} hover>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{c.name?.charAt(0)}</Avatar><Typography variant="body2" fontWeight={600}>{c.name}</Typography></Box></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{c.phone || '\u2014'}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{c.city || '\u2014'}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={700} color={c.balance > 0 ? 'error.main' : 'success.main'}>\u20b9{(c.balance || 0).toLocaleString('en-IN')}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
          {/* INVOICES */}
          <TabPanel value={tab} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <TextField size="small" placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ width: 300 }} />
              <Button variant="contained" startIcon={<AddIcon />} size="small">New Invoice</Button>
            </Box>
            {invLoading ? <CircularProgress /> : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell><TableCell sx={{ fontWeight: 700 }}>Customer</TableCell><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
                  <TableBody>
                    {filtered(invoices).length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>No invoices found.</TableCell></TableRow>}
                    {filtered(invoices).map((inv: any) => (
                      <TableRow key={inv.id} hover>
                        <TableCell><Typography variant="body2" fontWeight={700} color="primary.main">{inv.invoiceNumber || `#${inv.id}`}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{inv.customer?.name || '\u2014'}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : '\u2014'}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={700}>\u20b9{(inv.total || 0).toLocaleString('en-IN')}</Typography></TableCell>
                        <TableCell><Chip label={inv.status || 'Pending'} size="small" color={inv.status === 'PAID' ? 'success' : inv.status === 'VOID' ? 'default' : 'warning'} variant="outlined" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};
export default MsmeErp;
