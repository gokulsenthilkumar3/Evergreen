import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as PaidIcon,
  CloudDownload as ExportIcon,
  ErrorOutline as AlertIcon,
  Inventory2 as StockIcon,
  People as CustomerIcon,
  Print as PrintIcon,
  ReceiptLong as InvoiceIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ShoppingCart as OrderIcon,
  SyncAlt as JobIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

const statusColorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PAID: 'success',
  PARTIALLY_PAID: 'warning',
  SENT: 'info',
  DRAFT: 'default',
  VOID: 'error',
  CONFIRMED: 'info',
  PARTIALLY_INVOICED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const CommerceReports: React.FC = () => {
  const queryClient = useQueryClient();
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: reportData, isLoading: isReportLoading, isRefetching: isReportRefetching } = useQuery({
    queryKey: ['commerce-report'],
    queryFn: async () => (await api.get('/commerce/report')).data,
  });

  const { data: invoices = [], isLoading: isInvoicesLoading } = useQuery<any[]>({
    queryKey: ['commerce-invoices'],
    queryFn: async () => (await api.get('/commerce/invoices')).data,
  });

  const { data: customers = [], isLoading: isCustomersLoading } = useQuery<any[]>({
    queryKey: ['commerce-customers'],
    queryFn: async () => (await api.get('/commerce/customers')).data,
  });

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery<any[]>({
    queryKey: ['commerce-orders'],
    queryFn: async () => (await api.get('/commerce/orders')).data,
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['commerce-report'] }),
      queryClient.invalidateQueries({ queryKey: ['commerce-invoices'] }),
      queryClient.invalidateQueries({ queryKey: ['commerce-customers'] }),
      queryClient.invalidateQueries({ queryKey: ['commerce-orders'] }),
    ]);
  };

  const handlePrint = () => {
    window.print();
  };

  // Customers with outstanding balances
  const debtorCustomers = useMemo(() => {
    return customers
      .filter((c) => Number(c.balance || 0) > 0)
      .sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));
  }, [customers]);

  // Filtered lists based on search
  const filteredDebtors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return debtorCustomers;
    return debtorCustomers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.gstin?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q)
    );
  }, [debtorCustomers, searchQuery]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.invoiceNo?.toLowerCase().includes(q) ||
        (inv.customerName || inv.customer?.name)?.toLowerCase().includes(q) ||
        inv.status?.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  const filteredLowStock = useMemo(() => {
    const list = reportData?.lowStock || [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q)
    );
  }, [reportData, searchQuery]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o: any) =>
        o.orderNo?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const cards = [
    {
      title: 'Invoiced Revenue',
      value: `₹${Number(reportData?.invoicedValue ?? 0).toLocaleString('en-IN')}`,
      subtitle: `${invoices.length} invoices generated`,
      icon: <ReportIcon />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.08)',
    },
    {
      title: 'Receivables Outstanding',
      value: `₹${Number(reportData?.receivables ?? 0).toLocaleString('en-IN')}`,
      subtitle: `${debtorCustomers.length} accounts with balance`,
      icon: <MoneyIcon />,
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.08)',
    },
    {
      title: 'Open Sales Orders',
      value: reportData?.openOrders ?? 0,
      subtitle: 'Awaiting fulfillment/billing',
      icon: <OrderIcon />,
      color: '#2563eb',
      bgColor: 'rgba(37, 99, 235, 0.08)',
    },
    {
      title: 'Open Job Work',
      value: reportData?.openJobWork ?? 0,
      subtitle: 'Active challans with processors',
      icon: <JobIcon />,
      color: '#7c3aed',
      bgColor: 'rgba(124, 58, 237, 0.08)',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Business & Financial Reports
          </Typography>
          <Typography color="text.secondary">
            Consolidated intelligence covering sales invoices, debtor receivables, catalogue alerts, and job-work commitments.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isReportRefetching}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: card.bgColor,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                  {isReportLoading ? '—' : card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Card */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            pt: 1,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<MoneyIcon fontSize="small" />}
              iconPosition="start"
              label={`Outstanding Receivables (${debtorCustomers.length})`}
            />
            <Tab
              icon={<StockIcon fontSize="small" />}
              iconPosition="start"
              label={`Low Stock Watchlist (${reportData?.lowStock?.length || 0})`}
            />
            <Tab
              icon={<InvoiceIcon fontSize="small" />}
              iconPosition="start"
              label={`Recent Invoices (${invoices.length})`}
            />
            <Tab
              icon={<OrderIcon fontSize="small" />}
              iconPosition="start"
              label={`Sales Orders (${orders.length})`}
            />
          </Tabs>

          <Box sx={{ pb: 1 }}>
            <TextField
              size="small"
              placeholder="Search in tab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
            />
          </Box>
        </Box>

        {/* Tab 0: Outstanding Receivables */}
        {tabIndex === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phone & Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>State & GSTIN</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Balance Due
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isCustomersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredDebtors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <PaidIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
                      <Typography fontWeight={700}>All Customer Balances Cleared</Typography>
                      <Typography variant="body2" color="text.secondary">
                        No outstanding receivables matched the search criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDebtors.map((cust) => (
                    <TableRow key={cust.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{cust.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Customer ID #{cust.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{cust.phone || '—'}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{cust.state || 'Tamil Nadu'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cust.gstin || 'Unregistered'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={cust.active ? 'Active' : 'Inactive'}
                          color={cust.active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          sx={{ color: 'error.main' }}
                        >
                          ₹{Number(cust.balance).toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: Low Stock Watchlist */}
        {tabIndex === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item Name & SKU</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>HSN / SAC</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Available Stock
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Reorder Threshold
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Stock Health</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isReportLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredLowStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <PaidIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
                      <Typography fontWeight={700}>Inventory Levels Optimal</Typography>
                      <Typography variant="body2" color="text.secondary">
                        All catalogue items are above their minimum reorder thresholds.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLowStock.map((item: any) => {
                    const ratio = item.reorderLevel > 0
                      ? Math.min(100, Math.round((item.stock.available / item.reorderLevel) * 100))
                      : 0;
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography fontWeight={700}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {item.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={item.type.replace('_', ' ')}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{item.hsnSac || '—'}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700} sx={{ color: 'error.main' }}>
                            {item.stock.available} {item.uom}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="text.secondary">
                            {item.reorderLevel} {item.uom}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: 160 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={ratio}
                                color={ratio < 30 ? 'error' : 'warning'}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                              {ratio}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 2: Recent Invoices */}
        {tabIndex === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Taxes (GST)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Total Amount
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Paid / Balance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isInvoicesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No invoices found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => {
                    const balance = Number(inv.total || 0) - Number(inv.amountPaid || 0);
                    return (
                      <TableRow key={inv.id} hover>
                        <TableCell>
                          <Typography fontWeight={700}>{inv.invoiceNo}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ref #{inv.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{inv.customerName || inv.customer?.name || '—'}</TableCell>
                        <TableCell>
                          {new Date(inv.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={inv.status}
                            color={statusColorMap[inv.status] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            CGST ₹{inv.cgst || 0} | SGST ₹{inv.sgst || 0} | IGST ₹{inv.igst || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700}>
                            ₹{Number(inv.total).toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: balance > 0 ? 'error.main' : 'success.main' }}
                          >
                            ₹{Number(inv.amountPaid || 0).toLocaleString('en-IN')} / ₹
                            {balance.toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 3: Sales Orders */}
        {tabIndex === 3 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Line Items</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Total Value
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isOrdersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No sales orders found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((ord: any) => (
                    <TableRow key={ord.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{ord.orderNo}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          PO #{ord.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{ord.customer?.name || '—'}</TableCell>
                      <TableCell>
                        {new Date(ord.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={ord.status.replace('_', ' ')}
                          color={statusColorMap[ord.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {ord.lines?.length || 0} line item(s)
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700}>
                          ₹{Number(ord.total).toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default CommerceReports;
