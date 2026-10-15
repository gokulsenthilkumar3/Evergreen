import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Card,
  CardContent,
  Tooltip,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookIcon from '@mui/icons-material/MenuBook';
import PrintIcon from '@mui/icons-material/Print';
import FilterIcon from '@mui/icons-material/FilterList';
import InwardIcon from '@mui/icons-material/TrendingDown';
import OutwardIcon from '@mui/icons-material/TrendingUp';
import LedgerIcon from '@mui/icons-material/AccountBalance';
import StockIcon from '@mui/icons-material/Inventory';
import DownloadIcon from '@mui/icons-material/FileDownload';
import SpinningIcon from '@mui/icons-material/PrecisionManufacturing';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { toast } from 'sonner';
import { tableToCSV } from '../utils/csvGenerator';

interface BookRecord {
  id: string | number;
  bookType: 'DAYBOOK' | 'INWARD' | 'OUTWARD' | 'STOCK' | 'LEDGER' | 'MACHINES';
  date: string;
  referenceNo: string;
  partyName: string;
  description: string;
  inwardKg?: number;
  outwardKg?: number;
  amount?: number;
  status: string;
}

export default function BookEllam() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // 1. Fetch Inward Batches (Cotton Inward & Tare Deductions)
  const { data: inwardBatches = [], isError: inwardError, isLoading: inwardLoading } = useQuery({
    queryKey: ['inwardHistory', 'book-ellam'],
    queryFn: async () => {
        const res = await api.get('/inventory/inward');
        return Array.isArray(res.data) ? res.data : [];
    }
  });

  // 2. Fetch Outwards (Yarn Dispatches & Gate Passes)
  const { data: outwards = [], isError: outwardError } = useQuery({
    queryKey: ['outwards'],
    queryFn: async () => {
        const res = await api.get('/inventory/outward');
        return Array.isArray(res.data) ? res.data : [];
    }
  });

  // 3. Fetch Customer Ledger (Khata / Peredu)
  const { data: customerLedger = [] } = useQuery({
    queryKey: ['customer-ledger'],
    queryFn: async () => {
      try {
        const res = await api.get('/commerce/customers');
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    }
  });

  // 4. Fetch Spinning Production Runs (Urpatti Puthagam)
  const { data: productionRuns = [] } = useQuery({
    queryKey: ['production-runs'],
    queryFn: async () => {
      try {
        const res = await api.get('/production');
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    }
  });

  // 5. Fetch Inventory History & Waste Register (Sarakku Puthagam)
  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-history-summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/inventory/history?range=all');
        return res.data || {};
      } catch {
        return {};
      }
    }
  });

  // Consolidate into unified "Book-Ellam" records (All 6 Mill Registers)
  const allRecords = useMemo<BookRecord[]>(() => {
    const list: BookRecord[] = [];

    // Map Inward Book (Varavu Puthagam - Raw Cotton & Tare Deduction)
    inwardBatches.forEach((b: any) => {
      list.push({
        id: `INW-${b.id}`,
        bookType: 'INWARD',
        date: b.receivedAt || b.createdAt || b.date || new Date().toISOString(),
        referenceNo: b.batchNumber || b.batchId || `INW-${b.id}`,
        partyName: b.supplierName || b.supplier || 'Raw Cotton Ginning Mill',
        description: b.weighbridgeReceipt
          ? `Cotton - Lot: ${b.batchId}; moisture: ${b.weighbridgeReceipt.moisturePercent}%; billable: ${b.weighbridgeReceipt.finalBillableKg === null ? 'pending contract' : `${b.weighbridgeReceipt.finalBillableKg} kg`}; readings unverified`
          : `Cotton - Lot: ${b.batchId}; moisture readings not recorded`,
        inwardKg: Number(b.kg ?? 0),
        amount: b.totalAmount == null ? undefined : Number(b.totalAmount),
        status: b.status || 'RECEIVED',
      });
    });

    // Map Outward Book (Vilpanai / Selavu Puthagam - Yarn Dispatches & Gate Pass)
    outwards.forEach((o: any) => {
      list.push({
        id: `OUT-${o.id}`,
        bookType: 'OUTWARD',
        date: o.dispatchedAt || o.createdAt || o.date || new Date().toISOString(),
        referenceNo: o.challanNumber || `DC-${o.id}`,
        partyName: o.customerName || o.customer || 'Yarn Weaving Client',
        description: `Yarn Dispatch - Vehicle: ${o.vehicleNo || 'Not recorded'} (${o.totalBags || 0} bags)`,
        outwardKg: Number(o.netWeight || o.totalWeight || 0),
        amount: Number(o.invoiceAmount || o.amount || 0),
        status: o.status || 'DISPATCHED',
      });
    });

    // Map Production / Spinning Machine Register (Urpatti Puthagam)
    productionRuns.forEach((p: any) => {
      list.push({
        id: `PROD-${p.id}`,
        bookType: 'MACHINES',
        date: p.date || p.createdAt || new Date().toISOString(),
        referenceNo: `PROD-${p.id}`,
        partyName: p.machineName || `Ring Frame / Autoconer ${p.machineId || '1'}`,
        description: `Spinning Run - Count ${p.count || '40s'} CW (Output: ${p.outputKg || p.productionKg || 0} kg)`,
        inwardKg: Number(p.inputCottonKg || 0),
        outwardKg: Number(p.outputKg || p.productionKg || 0),
        amount: Number(p.costEstimate || 0),
        status: p.status || 'COMPLETED',
      });
    });

    // Map Stock & Waste Ledger (Sarakku Puthagam - Comber Noil & Card Waste)
    const wasteList = Array.isArray(inventoryData?.wasteHistory) ? inventoryData.wasteHistory : [];
    wasteList.forEach((w: any) => {
      list.push({
        id: `WST-${w.id}`,
        bookType: 'STOCK',
        date: w.date || w.createdAt || new Date().toISOString(),
        referenceNo: `WST-LOT-${w.id}`,
        partyName: 'Spinning Waste Register',
        description: `${w.wasteType || 'Comber Noil'} Register - Usable resale waste`,
        inwardKg: Number(w.weightKg || w.quantity || 0),
        amount: w.saleValue == null ? undefined : Number(w.saleValue),
        status: w.status || 'AVAILABLE_STOCK',
      });
    });

    // Map Party Ledger (Peredu / Khata - Accounts)
    customerLedger.forEach((c: any) => {
      list.push({
        id: `CUST-${c.id}`,
        bookType: 'LEDGER',
        date: c.updatedAt || new Date().toISOString(),
        referenceNo: `KHATA-${c.id}`,
        partyName: c.name || 'Account',
        description: `Party Ledger Balance (${c.phone || c.city || 'Active Mill Ledger'})`,
        amount: Number(c.balance || c.outstanding || 0),
        status: Number(c.balance || 0) > 0 ? 'RECEIVABLE' : 'CLEAR',
      });
    });

    // Sort newest first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inwardBatches, outwards, customerLedger, productionRuns, inventoryData]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      const matchesTab = activeTab === 'ALL' || r.bookType === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        r.referenceNo.toLowerCase().includes(q) ||
        r.partyName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
      const matchesDate = !dateFilter || r.date.startsWith(dateFilter);
      return matchesTab && matchesQuery && matchesDate;
    });
  }, [allRecords, activeTab, searchQuery, dateFilter]);

  // Summary Metrics
  const totalInwardKg = useMemo(() => 
    filteredRecords.reduce((sum, r) => sum + (r.inwardKg || 0), 0), [filteredRecords]);
  const totalOutwardKg = useMemo(() => 
    filteredRecords.reduce((sum, r) => sum + (r.outwardKg || 0), 0), [filteredRecords]);
  const totalValuation = useMemo(() => 
    filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0), [filteredRecords]);

  // Client-side CSV Audit Export with UTF-8 BOM
  const exportToCSV = () => {
    const headers = [
      'Date',
      'Register Type',
      'Reference / Challan #',
      'Party / Mill Contact',
      'Material / Particulars',
      'Inward (Kg)',
      'Outward (Kg)',
      'Amount (INR)',
      'Status'
    ];

    const rows = filteredRecords.map(r => [
      new Date(r.date).toLocaleDateString(),
      r.bookType,
      r.referenceNo || '',
      r.partyName || '',
      r.description || '',
      r.inwardKg ?? '',
      r.outwardKg ?? '',
      r.amount ?? '',
      r.status || ''
    ]);

    tableToCSV(headers, rows, `Book-Ellam-Audit-Register-${activeTab}-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {(inwardError || outwardError) && <Alert severity="error" sx={{ mb: 2 }}>Some registers could not be loaded. These totals are incomplete; reload before reconciling.</Alert>}
      {inwardLoading && <Alert severity="info" sx={{ mb: 2 }}>Loading inward receipts…</Alert>}
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BookIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Book-Ellam (புக் எல்லாம்)
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Comprehensive Books & Ledger Research Tool — Cross-examine Day Book, Inward (Varavu), Outward (Vilpanai), Stock, Spinning & Khata in one unified register.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Tooltip describeChild title="Administrator export of sales and receipt vouchers. Purchase export awaits approved supplier bills.">
            <Button 
              variant="contained" 
              startIcon={<BookIcon />} 
              onClick={async () => {
                try {
                  const response = await api.get('/integrations/tally/export', { params: { types: 'Sales,Receipt' }, responseType: 'blob' });
                  const url = URL.createObjectURL(response.data);
                  const link = document.createElement('a');
                  link.href = url; link.download = 'Tally-Sales-Receipts.xml';
                  document.body.appendChild(link); link.click(); link.remove();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                } catch { toast.error('Tally export failed. An administrator account is required.'); }
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#F59E0B', color: '#070B14', '&:hover': { bgcolor: '#D97706' } }}
            >
              Export Sales / Receipts XML
            </Button>
          </Tooltip>
          <Tooltip title="Export filtered rows to CSV for Statutory Auditor or GST reconciliation">
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<DownloadIcon />} 
              onClick={exportToCSV}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Export CSV Audit
            </Button>
          </Tooltip>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />} 
            onClick={() => window.print()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Print Ledger Book
          </Button>
        </Box>
      </Box>

      {/* AGGREGATE SUMMARY CARDS */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
        gap: 2, 
        mb: 3 
      }}>
        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Transactions Listed
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {filteredRecords.length} Records
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Total Inward Weight (Varavu)
            </Typography>
            <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
              {totalInwardKg.toLocaleString()} Kg
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Total Outward Dispatched (Selavu)
            </Typography>
            <Typography variant="h5" fontWeight={700} color="info.main" sx={{ mt: 0.5 }}>
              {totalOutwardKg.toLocaleString()} Kg
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              Book Amount / Ledger Value
            </Typography>
            <Typography variant="h5" fontWeight={700} color="warning.main" sx={{ mt: 0.5 }}>
              ₹{totalValuation.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* SEARCH AND BOOK FILTER CONTROLS */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          alignItems: 'center' 
        }}>
          <Box sx={{ flex: 1, width: '100%' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search across all books by Party, Challan #, Lot #, Vehicle #, or Status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: 220 } }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Filter by Date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          {(searchQuery || dateFilter) && (
            <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
              <Button 
                variant="text" 
                color="secondary"
                onClick={() => { setSearchQuery(''); setDateFilter(''); }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Box>

        {/* BOOK SELECTOR TABS - ALL 6 REGISTERS */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All Books (${allRecords.length})`} value="ALL" icon={<FilterIcon />} iconPosition="start" />
            <Tab label="Inward Book (வரவு)" value="INWARD" icon={<InwardIcon />} iconPosition="start" />
            <Tab label="Outward Book (செலவு)" value="OUTWARD" icon={<OutwardIcon />} iconPosition="start" />
            <Tab label="Stock & Waste (சரக்கு)" value="STOCK" icon={<StockIcon />} iconPosition="start" />
            <Tab label="Spinning Runs (உற்பத்தி)" value="MACHINES" icon={<SpinningIcon />} iconPosition="start" />
            <Tab label="Party Ledger (பேரேடு / Khata)" value="LEDGER" icon={<LedgerIcon />} iconPosition="start" />
          </Tabs>
        </Box>
      </Paper>

      {/* CONSOLIDATED BOOK RECORDS TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Book Register</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ref / Challan #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Party / Mill Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Material / Particulars</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Inward (Kg)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Outward (Kg)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.bookType} 
                    size="small" 
                    color={
                      row.bookType === 'INWARD' ? 'success' :
                      row.bookType === 'OUTWARD' ? 'info' :
                      row.bookType === 'STOCK' ? 'secondary' :
                      row.bookType === 'MACHINES' ? 'primary' :
                      row.bookType === 'LEDGER' ? 'warning' : 'default'
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.referenceNo}</TableCell>
                <TableCell>{row.partyName}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                  {row.inwardKg ? `${row.inwardKg.toLocaleString()} kg` : '—'}
                </TableCell>
                <TableCell align="right" sx={{ color: 'info.main', fontWeight: 600 }}>
                  {row.outwardKg ? `${row.outwardKg.toLocaleString()} kg` : '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {row.amount ? `₹${row.amount.toLocaleString()}` : '—'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    size="small" 
                    sx={{ fontSize: '0.7rem' }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No records match your Book-Ellam search query. Try broadening your keyword or date filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
