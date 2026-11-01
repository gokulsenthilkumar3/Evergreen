import { dateKey } from '../utils/dateKey';
import { uiText, useUiLanguage, uiLocale, uiTemplate, uiMetric, uiDateLocale, uiScopedTemplate } from "../i18n";
import React, { useMemo, useState } from 'react';
import {
  Add as AddIcon,
  AttachMoney as CostIcon,
  History as HistoryIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';

type Item = {
  id: number;
  name: string;
  sku: string;
  uom: string;
  stock: { available: number };
};

type Row = {
  itemId: number | '';
  quantity: string;
  unitCost: string;
};

const newRow = (): Row => ({ itemId: '', quantity: '', unitCost: '' });

const OperationsDesk: React.FC = () => {
  useUiLanguage();
  const client = useQueryClient();
  const [tab, setTab] = useState(0);
  const [inwardOpen, setInwardOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [history, setHistory] = useState<any[] | null>(null);
  const [historyName, setHistoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: items = [], isLoading: isItemsLoading } = useQuery<Item[]>({
    queryKey: ['commerce-items'],
    queryFn: async () => (await api.get('/commerce/items')).data,
  });

  const { data: receipts = [], isLoading: isReceiptsLoading } = useQuery<any[]>({
    queryKey: ['inward-receipts'],
    queryFn: async () => (await api.get('/commerce/inward-receipts')).data,
  });

  const { data: costings = [], isLoading: isCostingsLoading } = useQuery<any[]>({
    queryKey: ['costing-sheets'],
    queryFn: async () => (await api.get('/commerce/costing-sheets')).data,
  });

  const [inward, setInward] = useState({
    supplierName: '',
    referenceNumber: '',
    date: dateKey(),
    notes: '',
    lines: [newRow()],
  });

  const [costing, setCosting] = useState({
    styleCode: '',
    description: '',
    components: [{ type: 'MATERIAL', description: '', quantity: '', rate: '' }],
  });

  const total = useMemo(
    () =>
      inward.lines.reduce(
        (s, l) => s + Number(l.quantity || 0) * Number(l.unitCost || 0),
        0
      ),
    [inward]
  );

  const costTotal = useMemo(
    () =>
      costing.components.reduce(
        (s, l) => s + Number(l.quantity || 0) * Number(l.rate || 0),
        0
      ),
    [costing]
  );

  const refresh = () =>
    Promise.all(
      ['commerce-items', 'inward-receipts', 'costing-sheets'].map((key) =>
        client.invalidateQueries({ queryKey: [key] })
      )
    );

  // One write at a time: a double click must not post the same receipt to stock twice.
  const [busy, setBusy] = useState(false);
  const once = (work: () => Promise<unknown>) => async () => {
    if (busy) return;
    setBusy(true);
    try {
      await work();
    } finally {
      setBusy(false);
    }
  };

  const saveInward = once(async () => {
    try {
      if (!inward.supplierName.trim()) {
        return toast.error(uiText('Supplier name is required', 'feedback'));
      }
      const validLines = inward.lines.filter(
        (l) => l.itemId !== '' && Number(l.quantity) > 0
      );
      if (validLines.length === 0) {
        return toast.error(uiText('Please specify at least one valid item line', 'feedback'));
      }

      await api.post('/commerce/inward-receipts', {
        ...inward,
        lines: validLines.map((x) => ({
          ...x,
          quantity: Number(x.quantity),
          unitCost: Number(x.unitCost || 0),
        })),
      });

      setInwardOpen(false);
      setInward({
        supplierName: '',
        referenceNumber: '',
        date: dateKey(),
        notes: '',
        lines: [newRow()],
      });
      await refresh();
      toast.success(uiText('Inward receipt posted to stock successfully', 'feedback'));
    } catch (e: any) {
      toast.error(uiText(e.response?.data?.message || 'Could not save receipt', 'feedback'));
    }
  });

  const saveCost = once(async () => {
    try {
      if (!costing.styleCode.trim()) {
        return toast.error(uiText('Style code is required', 'feedback'));
      }
      await api.post('/commerce/costing-sheets', {
        ...costing,
        components: costing.components.map((x) => ({
          ...x,
          quantity: Number(x.quantity || 0),
          rate: Number(x.rate || 0),
        })),
      });

      setCostOpen(false);
      setCosting({
        styleCode: '',
        description: '',
        components: [{ type: 'MATERIAL', description: '', quantity: '', rate: '' }],
      });
      await refresh();
      toast.success(uiText('Costing sheet saved', 'feedback'));
    } catch (e: any) {
      toast.error(uiText(e.response?.data?.message || 'Could not save costing', 'feedback'));
    }
  });

  const print = () => window.print();

  // Filtered views
  const filteredReceipts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return receipts;
    return receipts.filter(
      (r) =>
        r.receiptNo?.toLowerCase().includes(q) ||
        r.supplierName?.toLowerCase().includes(q) ||
        r.referenceNumber?.toLowerCase().includes(q)
    );
  }, [receipts, searchQuery]);

  const filteredCostings = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return costings;
    return costings.filter(
      (c) =>
        c.styleCode?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
    );
  }, [costings, searchQuery]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const stats = [
    {
      label: 'Inward Receipts',
      value: receipts.length,
      subtitle: 'Recorded supplier batches',
      icon: <ShippingIcon />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.08)',
    },
    {
      label: 'Active Costing Sheets',
      value: costings.length,
      subtitle: 'Standard style benchmarks',
      icon: <CostIcon />,
      color: '#2563eb',
      bgColor: 'rgba(37, 99, 235, 0.08)',
    },
    {
      label: 'Tracked Items',
      value: items.length,
      subtitle: 'SKUs in active catalogue',
      icon: <InventoryIcon />,
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
            {uiText("Operations Desk ")}</Typography>
          <Typography color="text.secondary">
            {uiText("Process inward raw material receipts, calculate garment style costing sheets, and audit the stock movement ledger. ")}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ShippingIcon />}
            onClick={() => setInwardOpen(true)}
          >
            {uiText("Receive Stock ")}</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCostOpen(true)}
          >
            {uiText("New Costing Sheet ")}</Button>
        </Stack>
      </Box>

      {/* KPI Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
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
                    {uiText(stat.label, 'metrics')}
                  </Typography>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                  {uiMetric(stat.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {uiText(stat.subtitle, 'metrics')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Panel with Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            px: 2,
            pt: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<ShippingIcon fontSize="small" />}
              iconPosition="start"
              label={uiScopedTemplate('tabs')`Inward Receipts (${receipts.length})`}
            />
            <Tab
              icon={<CostIcon fontSize="small" />}
              iconPosition="start"
              label={uiScopedTemplate('tabs')`Costing History (${costings.length})`}
            />
            <Tab
              icon={<HistoryIcon fontSize="small" />}
              iconPosition="start"
              label={uiScopedTemplate('tabs')`Stock Traceability (${items.length})`}
            />
          </Tabs>

          <Box sx={{ pb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder={uiText("Search...", 'forms')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: 220 } }}
              />
              <IconButton onClick={refresh} title={uiText("Refresh records")}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Box>

        {/* Tab 0: Inward Receipts */}
        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Receipt #", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Supplier Name", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("PO / Reference", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Date", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {uiText("Total Value ", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {uiText("Actions ", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isReceiptsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">{uiText("No inward receipts found.", 'tables')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{r.receiptNo}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {uiText("ID #", 'tables')}{r.id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{r.supplierName}</TableCell>
                      <TableCell>{r.referenceNumber || '—'}</TableCell>
                      <TableCell>
                        {new Date(r.date).toLocaleDateString(uiDateLocale(), {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700} sx={{ color: 'primary.main' }}>
                          {uiText("₹", 'tables')}{Number(r.total).toLocaleString(uiLocale())}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={print}
                        >
                          {uiText("Print ", 'tables')}</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: Costing History */}
        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Style Code", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Description", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Status", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {uiText("Total Estimated Cost ", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {uiText("Actions ", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isCostingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredCostings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">{uiText("No garment costing sheets recorded.", 'tables')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCostings.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{c.styleCode}</Typography>
                      </TableCell>
                      <TableCell>{c.description || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={c.status}
                          color={c.status === 'APPROVED' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={800}>
                          {uiText("₹", 'tables')}{Number(c.total).toLocaleString(uiLocale())}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            try {
                              const comps = typeof c.components === 'string'
                                ? JSON.parse(c.components)
                                : c.components || [];
                              setCosting({
                                styleCode: `${c.styleCode}-COPY`,
                                description: c.description || '',
                                components: comps.map((x: any) => ({
                                  ...x,
                                  quantity: String(x.quantity || x.qty || ''),
                                  rate: String(x.rate || ''),
                                })),
                              });
                              setCostOpen(true);
                            } catch {
                              toast.error(uiText('Could not parse costing components', 'feedback'));
                            }
                          }}
                        >
                          {uiText("Duplicate ", 'tables')}</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 2: Stock Traceability */}
        {tab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Item Name & SKU", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {uiText("Available Stock ", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {uiText("Audit Ledger ", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isItemsLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">{uiText("No items found.", 'tables')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((i) => (
                    <TableRow key={i.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{i.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {uiText("SKU: ", 'tables')}{i.sku}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={uiScopedTemplate('tables')`${i.stock.available} ${i.uom}`}
                          color={i.stock.available > 0 ? 'success' : 'error'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          startIcon={<HistoryIcon />}
                          size="small"
                          variant="outlined"
                          onClick={async () => {
                            try {
                              setHistoryName(i.name);
                              const res = await api.get(`/commerce/items/${i.id}/movements`);
                              setHistory(res.data);
                            } catch {
                              toast.error(uiText('Could not load movements ledger', 'feedback'));
                            }
                          }}
                        >
                          {uiText("View History ", 'tables')}</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Inward Receipt Dialog */}
      <Dialog
        open={inwardOpen}
        onClose={() => setInwardOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {uiText("Receive Stock from Supplier ")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={uiText("Supplier Name", 'forms')}
                placeholder={uiText("e.g. Vardhman Textiles", 'forms')}
                value={inward.supplierName}
                onChange={(e) => setInward({ ...inward, supplierName: e.target.value })}
                fullWidth
              />
              <TextField
                label={uiText("Reference / PO Number", 'forms')}
                placeholder={uiText("PO-2026-081", 'forms')}
                value={inward.referenceNumber}
                onChange={(e) => setInward({ ...inward, referenceNumber: e.target.value })}
                fullWidth
              />
              <TextField
                type="date"
                label={uiText("Receipt Date", 'forms')}
                InputLabelProps={{ shrink: true }}
                value={inward.date}
                onChange={(e) => setInward({ ...inward, date: e.target.value })}
                fullWidth
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={700}>
              {uiText("Received Items: ")}</Typography>

            {inward.lines.map((line, index) => (
              <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  label={uiText("Catalogue Item", 'forms')}
                  value={line.itemId}
                  onChange={(e) =>
                    setInward({
                      ...inward,
                      lines: inward.lines.map((x, i) =>
                        i === index ? { ...x, itemId: Number(e.target.value) } : x
                      ),
                    })
                  }
                  fullWidth
                >
                  {items.map((i) => (
                    <MenuItem value={i.id} key={i.id}>
                      {i.name} ({i.sku})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label={uiText("Quantity", 'forms')}
                  type="number"
                  value={line.quantity}
                  onChange={(e) =>
                    setInward({
                      ...inward,
                      lines: inward.lines.map((x, i) =>
                        i === index ? { ...x, quantity: e.target.value } : x
                      ),
                    })
                  }
                  sx={{ minWidth: 140 }}
                />

                <TextField
                  label={uiText("Unit Cost (₹)", 'forms')}
                  type="number"
                  value={line.unitCost}
                  onChange={(e) =>
                    setInward({
                      ...inward,
                      lines: inward.lines.map((x, i) =>
                        i === index ? { ...x, unitCost: e.target.value } : x
                      ),
                    })
                  }
                  sx={{ minWidth: 140 }}
                />

                {inward.lines.length > 1 && (
                  <Button
                    color="error"
                    size="small"
                    onClick={() =>
                      setInward({
                        ...inward,
                        lines: inward.lines.filter((_, i) => i !== index),
                      })
                    }
                  >
                    {uiText("Remove ")}</Button>
                )}
              </Stack>
            ))}

            <Button
              onClick={() => setInward({ ...inward, lines: [...inward.lines, newRow()] })}
              sx={{ alignSelf: 'start' }}
            >
              {uiText("+ Add Item Line ")}</Button>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle1" fontWeight={800}>
                {uiText("Receipt Total Value: ₹")}{total.toLocaleString(uiLocale())}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setInwardOpen(false)}>{uiText("Cancel")}</Button>
          <Button variant="contained" disabled={busy} onClick={saveInward}>
            {uiText("Post Receipt to Stock ")}</Button>
        </DialogActions>
      </Dialog>

      {/* Costing Sheet Dialog */}
      <Dialog
        open={costOpen}
        onClose={() => setCostOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {uiText("Garment & Style Costing Sheet ")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={uiText("Style Code", 'forms')}
                placeholder={uiText("e.g. STY-POLO-2026", 'forms')}
                value={costing.styleCode}
                onChange={(e) => setCosting({ ...costing, styleCode: e.target.value })}
                fullWidth
              />
              <TextField
                label={uiText("Garment Description", 'forms')}
                placeholder={uiText("100% Combed Cotton Polo Shirt", 'forms')}
                value={costing.description}
                onChange={(e) => setCosting({ ...costing, description: e.target.value })}
                fullWidth
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={700}>
              {uiText("Cost Components: ")}</Typography>

            {costing.components.map((line, index) => (
              <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  label={uiText("Category", 'forms')}
                  value={line.type}
                  onChange={(e) =>
                    setCosting({
                      ...costing,
                      components: costing.components.map((x, i) =>
                        i === index ? { ...x, type: e.target.value } : x
                      ),
                    })
                  }
                  sx={{ minWidth: 150 }}
                >
                  {['MATERIAL', 'PROCESS', 'OVERHEAD'].map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label={uiText("Component Description", 'forms')}
                  placeholder={uiText("Yarn / Knitting / Stitching / Buttons", 'forms')}
                  value={line.description}
                  onChange={(e) =>
                    setCosting({
                      ...costing,
                      components: costing.components.map((x, i) =>
                        i === index ? { ...x, description: e.target.value } : x
                      ),
                    })
                  }
                  fullWidth
                />

                <TextField
                  label={uiText("Consumption", 'forms')}
                  type="number"
                  value={line.quantity}
                  onChange={(e) =>
                    setCosting({
                      ...costing,
                      components: costing.components.map((x, i) =>
                        i === index ? { ...x, quantity: e.target.value } : x
                      ),
                    })
                  }
                  sx={{ minWidth: 120 }}
                />

                <TextField
                  label={uiText("Rate (₹)", 'forms')}
                  type="number"
                  value={line.rate}
                  onChange={(e) =>
                    setCosting({
                      ...costing,
                      components: costing.components.map((x, i) =>
                        i === index ? { ...x, rate: e.target.value } : x
                      ),
                    })
                  }
                  sx={{ minWidth: 120 }}
                />

                {costing.components.length > 1 && (
                  <Button
                    color="error"
                    size="small"
                    onClick={() =>
                      setCosting({
                        ...costing,
                        components: costing.components.filter((_, i) => i !== index),
                      })
                    }
                  >
                    {uiText("Remove ")}</Button>
                )}
              </Stack>
            ))}

            <Button
              onClick={() =>
                setCosting({
                  ...costing,
                  components: [
                    ...costing.components,
                    { type: 'MATERIAL', description: '', quantity: '', rate: '' },
                  ],
                })
              }
              sx={{ alignSelf: 'start' }}
            >
              {uiText("+ Add Component ")}</Button>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle1" fontWeight={800}>
                {uiText("Total Estimated Unit Cost: ₹")}{costTotal.toLocaleString(uiLocale())}
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCostOpen(false)}>{uiText("Cancel")}</Button>
          <Button variant="contained" disabled={busy} onClick={saveCost}>
            {uiText("Save Costing Sheet ")}</Button>
        </DialogActions>
      </Dialog>

      {/* Stock History Audit Dialog */}
      <Dialog
        open={!!history}
        onClose={() => setHistory(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {historyName} {uiText(" — Stock Movement Audit ")}</DialogTitle>
        <DialogContent>
          <TableContainer sx={{ mt: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Date", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Movement Type", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{uiText("Reference", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {uiText("Quantity ", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {uiText("No recorded movements for this item yet. ", 'tables')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  history?.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        {new Date(r.date || r.createdAt).toLocaleDateString(uiDateLocale(), {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={r.movementType || r.type}
                          color={
                            (r.movementType || r.type)?.includes('IN') ||
                            (r.movementType || r.type)?.includes('RECEIPT')
                              ? 'success'
                              : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{r.reference || r.referenceNumber || '—'}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color:
                            Number(r.quantity) > 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {r.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setHistory(null)}>{uiText("Close")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OperationsDesk;
