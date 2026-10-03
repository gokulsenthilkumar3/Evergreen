import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Grid,
  Card
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import TimelineIcon from '@mui/icons-material/Timeline';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LockIcon from '@mui/icons-material/Lock';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';
import { FormControlLabel, Switch } from '@mui/material';
import PartialPaymentDialog from '../components/billing/PartialPaymentDialog';
import InvoiceHistoryDialog from '../components/billing/InvoiceHistoryDialog';

export default function BillingPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [debitNotes, setDebitNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0 for Invoices, 1 for Adjustments
  const [adjustmentType, setAdjustmentType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');

  const [openForm, setOpenForm] = useState(false);
  const [openCreditNoteForm, setOpenCreditNoteForm] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Enhanced invoice management state
  const [partialPaymentDialogOpen, setPartialPaymentDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedInvoiceForPartialPayment, setSelectedInvoiceForPartialPayment] = useState<any>(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, invoice: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      await http.delete(`/billing/invoices/${selectedInvoice.id}`);
      notify.showSuccess('Invoice deleted');
      load();
    } catch (e) {
      console.error(e);
      notify.showError('Failed to delete invoice');
    } finally {
      handleCloseMenu();
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedInvoice) return;
    try {
      await http.patch(`/billing/invoices/${selectedInvoice.id}`, { status });
      notify.showSuccess(`Invoice marked as ${status}`);
      load();
    } catch (e) {
      console.error(e);
      notify.showError('Failed to update status');
    } finally {
      handleCloseMenu();
    }
  };

  const handlePrintInvoice = () => {
    // Open print view in new tab
    window.open(`/billing/print/${selectedInvoice.id}`, '_blank');
    handleCloseMenu();
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!selectedMonth) return true;
    return inv.date.startsWith(selectedMonth);
  });

  // New Invoice State
  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    billingCycle: '',
    items: [{ description: 'Yarn Batch', quantity: 1, price: 100 }],
    isRecurring: false,
    frequency: 'MONTHLY',
    notes: '',
    templateName: 'STANDARD'
  });

  // New Credit Note State
  const [newCreditNote, setNewCreditNote] = useState({
    customerName: '',
    amount: 0,
    reason: 'RETURNED_GOODS',
    invoiceId: '',
    notes: ''
  });

  async function handleSubmitAdjustment() {
    if (!newCreditNote.customerName || newCreditNote.amount <= 0) {
      notify.showError('Please fill in customer and amount');
      return;
    }

    try {
      if (adjustmentType === 'CREDIT') {
        await http.post('/billing/credit-notes', newCreditNote);
        notify.showSuccess('Credit Note created');
      } else {
        await http.post('/billing/debit-notes', {
          ...newCreditNote,
          reason: newCreditNote.reason // backend expects string
        });
        notify.showSuccess('Debit Note created');
      }
      setOpenCreditNoteForm(false);
      setNewCreditNote({
        customerName: '',
        amount: 0,
        reason: 'RETURNED_GOODS',
        invoiceId: '',
        notes: ''
      });
      load();
    } catch (err) {
      console.error(err);
      notify.showError('Failed to create adjustment');
    }
  }

  const handlePayNow = (invoice: any) => {
    setSelectedInvoiceForPayment(invoice);
    setOpenPaymentDialog(true);
    handleCloseMenu();
  };

  async function load() {
    setLoading(true);
    try {
      const [invRes, cnRes, dnRes] = await Promise.all([
        http.get('/billing/invoices'),
        http.get('/billing/credit-notes'),
        http.get('/billing/debit-notes')
      ]);
      setInvoices(invRes.data.invoices);
      setCreditNotes(cnRes.data.creditNotes);
      setDebitNotes(dnRes.data.debitNotes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, price: 100 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...newInvoice.items];
    (newItems[index] as any)[field] = value;
    setNewInvoice({ ...newInvoice, items: newItems });
  };

  async function handleSubmit() {
    if (!newInvoice.customerName || newInvoice.items.length === 0) {
      notify.showError('Please fill in all details');
      return;
    }

    try {
      // Ensure date is ISO for backend validation
      const payload = {
        ...newInvoice,
        date: new Date(newInvoice.date).toISOString()
      };
      await http.post('/billing/invoices', payload);
      notify.showSuccess('Invoice created');
      setOpenForm(false);
      setNewInvoice({
        customerName: '',
        date: new Date().toISOString().slice(0, 10),
        billingCycle: '',
        items: [{ description: 'Yarn Batch', quantity: 1, price: 100 }],
        isRecurring: false,
        frequency: 'MONTHLY',
        notes: '',
        templateName: 'STANDARD'
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'info';
      case 'PENDING': return 'warning';
      case 'OVERDUE': return 'error';
      case 'VOID':
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const handleRecordPayment = (invoice: any) => {
    setSelectedInvoiceForPartialPayment({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount || 0),
      balance: Number(invoice.balance || invoice.totalAmount),
      customerName: invoice.customerName,
    });
    setPartialPaymentDialogOpen(true);
    handleCloseMenu();
  };

  const handleViewHistory = () => {
    setHistoryDialogOpen(true);
    handleCloseMenu();
  };

  const handleDownloadPDF = (template: string = 'STANDARD') => {
    if (!selectedInvoice) return;
    // Open print view in new tab
    window.open(`/billing/print/${selectedInvoice.id}`, '_blank');
    handleCloseMenu();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Billing & Invoices</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="month"
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ width: 200, bgcolor: 'background.paper' }}
          />
          <Button
            variant="contained"
            startIcon={tab === 0 ? <AddIcon /> : <CreditCardIcon />}
            onClick={() => {
              if (tab === 0) {
                setOpenForm(true);
              } else {
                setAdjustmentType('CREDIT');
                setOpenCreditNoteForm(true);
              }
            }}
            color="primary"
          >
            {tab === 0 ? 'Create Invoice' : 'Create Credit Note'}
          </Button>
          {tab === 1 && (
            <Button
              variant="outlined"
              startIcon={<CreditCardIcon />}
              onClick={() => {
                setAdjustmentType('DEBIT');
                setOpenCreditNoteForm(true);
              }}
              color="warning"
            >
              Create Debit Note
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <Typography variant="caption" color="primary.main" fontWeight="bold">TOTAL OUTSTANDING</Typography>
            <Typography variant="h6" fontWeight="bold">₹{invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + Number(i.totalAmount), 0).toLocaleString()}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: '#fef2f2', borderColor: '#fecaca' }}>
            <Typography variant="caption" color="error.main" fontWeight="bold">OVERDUE</Typography>
            <Typography variant="h6" fontWeight="bold">{invoices.filter(i => i.status === 'OVERDUE').length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <Typography variant="caption" color="success.main" fontWeight="bold">CREDITS</Typography>
            <Typography variant="h6" fontWeight="bold">₹{creditNotes.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: '#fff7ed', borderColor: '#ffedd5' }}>
            <Typography variant="caption" color="warning.main" fontWeight="bold">DEBITS</Typography>
            <Typography variant="h6" fontWeight="bold">₹{debitNotes.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}</Typography>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Invoices" />
          <Tab label="Financial Adjustments" />
        </Tabs>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {tab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No invoices found for this month</TableCell></TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {inv.invoiceNumber}
                      {inv.isRecurring && <Chip label="REC" size="small" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.65rem' }} color="primary" />}
                      {inv.isLocked && <LockIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />}
                    </TableCell>
                    <TableCell>{inv.customerName}</TableCell>
                    <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>₹{Number(inv.totalAmount).toLocaleString()}</Typography>
                        <Typography variant="caption" color="text.secondary">Inc. ₹{Number(inv.taxAmount || 0).toLocaleString()} tax</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {Number(inv.paidAmount || 0) > 0 && (
                          <Typography variant="caption" color="success.main" display="block">
                            Paid: ₹{Number(inv.paidAmount).toLocaleString()}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: Number(inv.balance || inv.totalAmount) > 0 ? 'bold' : 'normal',
                            color: Number(inv.balance || inv.totalAmount) > 0 ? 'error.main' : 'text.secondary'
                          }}
                        >
                          {Number(inv.balance || inv.totalAmount) > 0
                            ? `₹${Number(inv.balance || inv.totalAmount).toLocaleString()}`
                            : 'Fully Paid'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={inv.status} size="small" color={getStatusColor(inv.status) as any} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, inv)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ID #</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...creditNotes.map(c => ({ ...c, type: 'CREDIT' })), ...debitNotes.map(d => ({ ...d, type: 'DEBIT' }))]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No adjustments found</TableCell></TableRow>
              ) : (
                [...creditNotes.map(c => ({ ...c, type: 'CREDIT' })), ...debitNotes.map(d => ({ ...d, type: 'DEBIT' }))]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((adj) => (
                    <TableRow key={adj.id} hover>
                      <TableCell>
                        <Chip
                          label={adj.type}
                          size="small"
                          color={adj.type === 'CREDIT' ? 'success' : 'warning'}
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{adj.creditNoteNumber || adj.debitNoteNumber}</TableCell>
                      <TableCell>{adj.customerName}</TableCell>
                      <TableCell>{new Date(adj.date).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: adj.type === 'CREDIT' ? 'error.main' : 'success.main' }}>
                        {adj.type === 'CREDIT' ? '-' : '+'} ₹{Number(adj.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{adj.reason?.replace('_', ' ')}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{ elevation: 2, sx: { minWidth: 200, borderRadius: 2 } }}
      >
        <MenuItem onClick={() => handleDownloadPDF('STANDARD')}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print / Save PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewHistory()}>
          <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); navigate(`/billing/invoices/${selectedInvoice?.id}`); }}>
          <ListItemIcon><TimelineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Track Status</ListItemText>
        </MenuItem>
        {selectedInvoice?.status !== 'PAID' && Number(selectedInvoice?.balance || selectedInvoice?.totalAmount) > 0 && (
          <MenuItem onClick={() => handleRecordPayment(selectedInvoice)}>
            <ListItemIcon><PaymentIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText>Record Payment</ListItemText>
          </MenuItem>
        )}
        {selectedInvoice?.status !== 'PAID' && (
          <MenuItem onClick={() => handleUpdateStatus('PAID')} sx={{ color: 'success.main' }}>
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Mark as Paid</ListItemText>
          </MenuItem>
        )}
        {selectedInvoice?.status === 'PAID' && (
          <MenuItem onClick={() => handleUpdateStatus('PENDING')} sx={{ color: 'warning.main' }}>
            <ListItemIcon><PendingIcon fontSize="small" color="warning" /></ListItemIcon>
            <ListItemText>Mark as Pending</ListItemText>
          </MenuItem>
        )}
        {selectedInvoice?.status !== 'PAID' && (
          <MenuItem onClick={() => handleUpdateStatus('OVERDUE')} sx={{ color: 'error.main' }}>
            <ListItemIcon><PendingIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Mark as Overdue</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteInvoice} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Invoice Form Dialog - Unchanged */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Customer Name"
              fullWidth
              value={newInvoice.customerName}
              onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
            />

            <TextField
              select
              label="Invoice Template"
              fullWidth
              size="small"
              value={newInvoice.templateName || 'STANDARD'}
              onChange={(e) => setNewInvoice({ ...newInvoice, templateName: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="STANDARD">Standard Business</option>
              <option value="MODERN">Modern Minimalist</option>
              <option value="COMPACT">Compact / Retail</option>
            </TextField>

            <Typography variant="subtitle2">Items</Typography>
            {newInvoice.items.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Description"
                  size="small"
                  sx={{ flexGrow: 1 }}
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
                <TextField
                  label="Qty"
                  type="number"
                  size="small"
                  sx={{ width: 80 }}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                />
                <TextField
                  label="Price"
                  type="number"
                  size="small"
                  sx={{ width: 100 }}
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                />
                <IconButton color="error" size="small" onClick={() => handleRemoveItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddItem}>Add Item</Button>
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newInvoice.isRecurring}
                    onChange={(e) => setNewInvoice({ ...newInvoice, isRecurring: e.target.checked })}
                  />
                }
                label="Recurring Invoice?"
              />

              {newInvoice.isRecurring && (
                <TextField
                  select
                  size="small"
                  label="Frequency"
                  value={newInvoice.frequency}
                  onChange={(e) => setNewInvoice({ ...newInvoice, frequency: e.target.value })}
                  SelectProps={{ native: true }}
                  sx={{ width: 150 }}
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                </TextField>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreditNoteForm} onClose={() => setOpenCreditNoteForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create {adjustmentType === 'CREDIT' ? 'Credit' : 'Debit'} Note</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Customer Name"
              fullWidth
              value={newCreditNote.customerName}
              onChange={(e) => setNewCreditNote({ ...newCreditNote, customerName: e.target.value })}
            />
            <TextField
              label="Amount (₹)"
              type="number"
              fullWidth
              value={newCreditNote.amount}
              onChange={(e) => setNewCreditNote({ ...newCreditNote, amount: Number(e.target.value) })}
            />
            {adjustmentType === 'CREDIT' ? (
              <TextField
                select
                label="Reason"
                fullWidth
                size="small"
                value={newCreditNote.reason}
                onChange={(e) => setNewCreditNote({ ...newCreditNote, reason: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="RETURNED_GOODS">Returned Goods</option>
                <option value="OVERCHARGED">Overcharged</option>
                <option value="DAMAGED_ITEMS">Damaged Items</option>
                <option value="OTHER">Other</option>
              </TextField>
            ) : (
              <TextField
                label="Reason"
                fullWidth
                size="small"
                placeholder="e.g. Price Revision, Undercharged"
                value={newCreditNote.reason}
                onChange={(e) => setNewCreditNote({ ...newCreditNote, reason: e.target.value })}
              />
            )}
            <TextField
              label="Invoice ID (Optional)"
              fullWidth
              size="small"
              value={newCreditNote.invoiceId || ''}
              onChange={(e) => setNewCreditNote({ ...newCreditNote, invoiceId: e.target.value })}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              value={newCreditNote.notes}
              onChange={(e) => setNewCreditNote({ ...newCreditNote, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreditNoteForm(false)}>Cancel</Button>
          <Button variant="contained" color={adjustmentType === 'CREDIT' ? 'error' : 'warning'} onClick={handleSubmitAdjustment}>
            Create {adjustmentType === 'CREDIT' ? 'Credit' : 'Debit'} Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Simulation Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6">Secure Payment</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pay for Invoice <strong>{selectedInvoiceForPayment?.invoiceNumber}</strong>
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ my: 2 }}>
            ₹{Number(selectedInvoiceForPayment?.totalAmount).toLocaleString()}
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#2563eb', fontWeight: 'bold' }}>POWERED BY RAZORPAY</Typography>
            <Button variant="contained" fullWidth sx={{ bgcolor: '#3395ff', '&:hover': { bgcolor: '#247fde' } }} onClick={() => {
              notify.showSuccess('Payment successful! Invoice status updated.');
              handleUpdateStatus('PAID');
              setOpenPaymentDialog(false);
            }}>
              Pay Now (Simulation)
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Encrypted 256-bit secure transaction link.
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Partial Payment Dialog */}
      {selectedInvoiceForPartialPayment && (
        <PartialPaymentDialog
          open={partialPaymentDialogOpen}
          onClose={() => {
            setPartialPaymentDialogOpen(false);
            setSelectedInvoiceForPartialPayment(null);
          }}
          invoice={selectedInvoiceForPartialPayment}
          onSuccess={() => {
            load(); // Reload invoices to show updated balances
            notify.showSuccess('Payment recorded successfully');
          }}
        />
      )}

      {/* Invoice History Dialog */}
      {selectedInvoice && (
        <InvoiceHistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.invoiceNumber}
        />
      )}
    </Box >
  );
}
