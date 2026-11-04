import { uiText, useUiLanguage, uiLocale, uiTemplate, uiScopedTemplate, uiDateLocale } from "../../i18n";
import React, { useState } from 'react';
import {
  Add as AddIcon,
  People as HRIcon,
  Payments as PayrollIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../utils/api';

interface Staff {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  role: string;
  phone?: string;
  joinDate?: string;
  monthlySalary: number;
  dailyRate: number;
  salaryType: 'MONTHLY' | 'DAILY' | string;
  active: boolean;
}

interface PayrollEntry {
  id: number;
  staffId: number;
  staff: { employeeId: string; name: string; department: string };
  month: string;
  daysWorked: number;
  overtimeHrs: number;
  basicPay: number;
  overtime: number;
  paid: boolean;
  deductions?: number;
  netPay: number;
  status?: string;
}

const initialStaffForm = {
  employeeId: '',
  name: '',
  department: 'Spinning',
  role: '',
  phone: '',
  salaryType: 'MONTHLY',
  monthlySalary: 20000,
  dailyRate: 750,
  joinDate: new Date().toISOString().slice(0, 10),
};

const initialPayrollForm = {
  staffId: '' as number | '',
  month: new Date().toISOString().slice(0, 7),
  daysWorked: 26,
  overtimeHrs: 0,
  basicPay: 20000,
  overtime: 0,
  deductions: 0,
};

const HRManagement: React.FC = () => {
  useUiLanguage();
  const [tab, setTab] = useState(0);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [openPayrollDialog, setOpenPayrollDialog] = useState(false);
  const [staffForm, setStaffForm] = useState(initialStaffForm);
  const [payrollForm, setPayrollForm] = useState(initialPayrollForm);

  const queryClient = useQueryClient();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const {
    data: employees = [],
    isLoading: loadingEmp,
    isRefetching: refetchingEmp,
    error: staffError,
  } = useQuery<Staff[]>({
    queryKey: ['hr-staff'],
    queryFn: () => api.get('/hr/staff').then((res) => res.data),
  });

  const {
    data: payroll = [],
    isLoading: loadingPayroll,
    isRefetching: refetchingPayroll,
    error: payrollError,
  } = useQuery<PayrollEntry[]>({
    queryKey: ['hr-payroll', currentMonth],
    queryFn: () => api.get(`/hr/payroll?month=${currentMonth}`).then((res) => res.data),
  });

  const createStaffMutation = useMutation({
    mutationFn: (newStaff: typeof staffForm) =>
      api.post('/hr/staff', {
        employeeId: newStaff.employeeId.trim(),
        name: newStaff.name.trim(),
        department: newStaff.department,
        role: newStaff.role.trim(),
        phone: newStaff.phone || undefined,
        salaryType: newStaff.salaryType,
        monthlySalary: Number(newStaff.monthlySalary) || 0,
        dailyRate: Number(newStaff.dailyRate) || 0,
        joinDate: newStaff.joinDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-staff'] });
      toast.success(uiText('Staff member registered successfully', 'feedback'));
      setOpenStaffDialog(false);
      setStaffForm(initialStaffForm);
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to add staff member', 'feedback'));
    },
  });

  const createPayrollMutation = useMutation({
    mutationFn: (entry: typeof payrollForm) => {
      const basicPay = Number(entry.basicPay) || 0;
      const overtime = Number(entry.overtime) || 0;
      const deductions = Number(entry.deductions) || 0;
      const netPay = Math.max(0, basicPay + overtime - deductions);

      return api.post('/hr/payroll', {
        staffId: Number(entry.staffId),
        month: entry.month,
        daysWorked: Number(entry.daysWorked),
        overtimeHrs: Number(entry.overtimeHrs),
        basicPay,
        overtime,
        deductions,
        netPay,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-payroll'] });
      toast.success(uiText('Payroll entry recorded successfully', 'feedback'));
      setOpenPayrollDialog(false);
      setPayrollForm(initialPayrollForm);
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to record payroll entry', 'feedback'));
    },
  });

  const activeCount = employees.filter((e) => e.active).length;
  const inactiveCount = employees.filter((e) => !e.active).length;
  const totalSalary = employees.reduce((sum, e) => sum + (Number(e.monthlySalary) || 0), 0);
  const totalPayrollMonth = payroll.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0);

  const handleStaffSelectForPayroll = (staffId: number) => {
    const selected = employees.find((e) => e.id === staffId);
    setPayrollForm((prev) => ({
      ...prev,
      staffId,
      basicPay: selected?.monthlySalary || prev.basicPay,
    }));
  };

  const calculatedNetPay = Math.max(
    0,
    (Number(payrollForm.basicPay) || 0) +
      (Number(payrollForm.overtime) || 0) -
      (Number(payrollForm.deductions) || 0)
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HRIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>
              {uiText("HR & Payroll ")}</Typography>
            <Typography color="text.secondary">
              {uiText("Staff directory, attendance tracking & salary processing ")}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loadingEmp || loadingPayroll || refetchingEmp || refetchingPayroll}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['hr-staff'] });
              queryClient.invalidateQueries({ queryKey: ['hr-payroll'] });
            }}
          >
            {uiText("Refresh ")}</Button>

          {tab === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenStaffDialog(true)}
            >
              {uiText("Add Staff ")}</Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<PayrollIcon />}
              onClick={() => setOpenPayrollDialog(true)}
              disabled={employees.length === 0}
            >
              {uiText("Process Payroll ")}</Button>
          )}
        </Box>
      </Box>

      {/* Error Notices */}
      {(staffError || payrollError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uiText("Failed to load HR and payroll records from server. ")}</Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("TOTAL STAFF ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#3b82f6">
                {employees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("ACTIVE ON SHIFT ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#059669">
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {uiText("MONTHLY SALARY COMMITMENT ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#8b5cf6">
                {uiText("₹")}{totalSalary.toLocaleString(uiLocale())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {currentMonth} {uiText(" DISBURSED PAYROLL ")}</Typography>
              <Typography variant="h5" fontWeight={800} color="#f59e0b">
                {uiText("₹")}{totalPayrollMonth.toLocaleString(uiLocale())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs Container */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            bgcolor: 'action.hover',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          }}
        >
          <Tab label={uiScopedTemplate('tabs')`Staff Directory (${employees.length})`} />
          <Tab label={uiScopedTemplate('tabs')`Payroll Processing (${payroll.length})`} />
        </Tabs>

        {/* Tab 0: Employee Directory */}
        {tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Employee", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Emp ID", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Department", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Designation", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Salary Type", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Monthly Salary ", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Date of Joining", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Status", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingEmp ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      {uiText("No staff records found. Click \"Add Staff\" to register team members. ", 'tables')}</TableCell>
                  </TableRow>
                ) : (
                  employees.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'primary.main',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {e.name?.charAt(0).toUpperCase() || 'E'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {e.name}
                            </Typography>
                            {e.phone && (
                              <Typography variant="caption" color="text.secondary">
                                {e.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={e.employeeId} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{e.department || 'General'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {e.role}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={e.salaryType || 'MONTHLY'}
                          size="small"
                          color={e.salaryType === 'DAILY' ? 'secondary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {uiText("₹", 'tables')}{(e.monthlySalary || 0).toLocaleString(uiLocale())}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {e.joinDate ? new Date(e.joinDate).toLocaleDateString(uiDateLocale()) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={e.active ? uiText("Active", 'tables') : uiText("Inactive", 'tables')}
                          size="small"
                          color={e.active ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: Payroll Processing */}
        {tab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Employee", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Month", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Days Worked ", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Basic Pay (₹) ", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Overtime (₹) ", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Deductions (₹) ", 'tables')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {uiText("Net Pay (₹) ", 'tables')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{uiText("Payment Status", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingPayroll ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : payroll.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      {uiText("No payroll entries for ", 'tables')}{currentMonth}{uiText(". Click \"Process Payroll\" to add. ", 'tables')}</TableCell>
                  </TableRow>
                ) : (
                  payroll.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {p.staff?.name || uiScopedTemplate('tables')`Staff #${p.staffId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.staff?.employeeId || p.staff?.department}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.month}</TableCell>
                      <TableCell align="right">{p.daysWorked} {uiText(" days", 'tables')}</TableCell>
                      <TableCell align="right">{uiText("₹", 'tables')}{(p.basicPay || 0).toLocaleString(uiLocale())}</TableCell>
                      <TableCell align="right" sx={{ color: 'info.main' }}>
                        {uiText("₹", 'tables')}{(p.overtime || 0).toLocaleString(uiLocale())}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {uiText("-₹", 'tables')}{(p.deductions || 0).toLocaleString(uiLocale())}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={800} color="success.main">
                          {uiText("₹", 'tables')}{(p.netPay || 0).toLocaleString(uiLocale())}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.paid ? uiText("Disbursed", 'tables') : uiText("Pending", 'tables')}
                          size="small"
                          color={p.paid ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add Staff Dialog */}
      <Dialog
        open={openStaffDialog}
        onClose={() => setOpenStaffDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
          {uiText("Register New Staff Member ")}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Employee ID", 'forms')}
                placeholder={uiText("EMP-101", 'forms')}
                fullWidth
                size="small"
                required
                value={staffForm.employeeId}
                onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Full Name", 'forms')}
                fullWidth
                size="small"
                required
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{uiText("Department", 'forms')}</InputLabel>
                <Select
                  value={staffForm.department}
                  label={uiText("Department", 'forms')}
                  onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                >
                  <MenuItem value="Spinning">{uiText("Spinning", 'forms')}</MenuItem>
                  <MenuItem value="Weaving">{uiText("Weaving", 'forms')}</MenuItem>
                  <MenuItem value="Quality Control">{uiText("Quality Control", 'forms')}</MenuItem>
                  <MenuItem value="Maintenance">{uiText("Maintenance", 'forms')}</MenuItem>
                  <MenuItem value="Warehouse">{uiText("Warehouse", 'forms')}</MenuItem>
                  <MenuItem value="Administration">{uiText("Administration", 'forms')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Designation / Role", 'forms')}
                placeholder={uiText("e.g. Ring Frame Operator", 'forms')}
                fullWidth
                size="small"
                required
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{uiText("Salary Structure", 'forms')}</InputLabel>
                <Select
                  value={staffForm.salaryType}
                  label={uiText("Salary Structure", 'forms')}
                  onChange={(e) => setStaffForm({ ...staffForm, salaryType: e.target.value })}
                >
                  <MenuItem value="MONTHLY">{uiText("Monthly Fixed", 'forms')}</MenuItem>
                  <MenuItem value="DAILY">{uiText("Daily Wage", 'forms')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label={staffForm.salaryType === 'DAILY' ? uiText("Daily Wage Rate (₹)", 'forms') : uiText("Monthly Base Salary (₹)", 'forms')}
                fullWidth
                size="small"
                value={staffForm.salaryType === 'DAILY' ? staffForm.dailyRate : staffForm.monthlySalary}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  if (staffForm.salaryType === 'DAILY') {
                    setStaffForm({ ...staffForm, dailyRate: val });
                  } else {
                    setStaffForm({ ...staffForm, monthlySalary: val });
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={uiText("Contact Phone", 'forms')}
                fullWidth
                size="small"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="date"
                label={uiText("Date of Joining", 'forms')}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                value={staffForm.joinDate}
                onChange={(e) => setStaffForm({ ...staffForm, joinDate: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenStaffDialog(false)} color="inherit">
            {uiText("Cancel ")}</Button>
          <Button
            variant="contained"
            disabled={!staffForm.name.trim() || !staffForm.employeeId.trim() || !staffForm.role.trim() || createStaffMutation.isPending}
            onClick={() => createStaffMutation.mutate(staffForm)}
          >
            {createStaffMutation.isPending ? uiText("Saving...") : uiText("Register Staff")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Payroll Dialog */}
      <Dialog
        open={openPayrollDialog}
        onClose={() => setOpenPayrollDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}>
          {uiText("Record Payroll Entry ")}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>{uiText("Select Employee", 'forms')}</InputLabel>
                <Select
                  value={payrollForm.staffId}
                  label={uiText("Select Employee", 'forms')}
                  onChange={(e) => handleStaffSelectForPayroll(Number(e.target.value))}
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employeeId} - {emp.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label={uiText("Month (YYYY-MM)", 'forms')}
                fullWidth
                size="small"
                required
                value={payrollForm.month}
                onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label={uiText("Days Worked", 'forms')}
                fullWidth
                size="small"
                value={payrollForm.daysWorked}
                onChange={(e) => setPayrollForm({ ...payrollForm, daysWorked: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label={uiText("Overtime Hours", 'forms')}
                fullWidth
                size="small"
                value={payrollForm.overtimeHrs}
                onChange={(e) => setPayrollForm({ ...payrollForm, overtimeHrs: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                label={uiText("Basic Pay (₹)", 'forms')}
                fullWidth
                size="small"
                value={payrollForm.basicPay}
                onChange={(e) => setPayrollForm({ ...payrollForm, basicPay: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                label={uiText("Overtime Pay (₹)", 'forms')}
                fullWidth
                size="small"
                value={payrollForm.overtime}
                onChange={(e) => setPayrollForm({ ...payrollForm, overtime: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                type="number"
                label={uiText("Deductions (₹)", 'forms')}
                fullWidth
                size="small"
                value={payrollForm.deductions}
                onChange={(e) => setPayrollForm({ ...payrollForm, deductions: Number(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {uiText("Calculated Net Pay: ")}</Typography>
                  <Typography variant="h6" fontWeight={800} color="success.main">
                    {uiText("₹")}{calculatedNetPay.toLocaleString(uiLocale())}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenPayrollDialog(false)} color="inherit">
            {uiText("Cancel ")}</Button>
          <Button
            variant="contained"
            disabled={!payrollForm.staffId || !payrollForm.month || createPayrollMutation.isPending}
            onClick={() => createPayrollMutation.mutate(payrollForm)}
          >
            {createPayrollMutation.isPending ? uiText("Processing...") : uiText("Submit Payroll")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HRManagement;
