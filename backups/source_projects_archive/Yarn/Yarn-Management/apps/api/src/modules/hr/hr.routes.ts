import { Router } from 'express';
import * as employeeService from './employee.service';
import * as attendanceService from './attendance.service';
import * as leaveService from './leave.service';
import * as payrollService from './payroll.service';

const router = Router();

// Employee routes
router.post('/employees', async (req, res) => {
    try {
        const employee = await employeeService.createEmployee(req.body);
        res.status(201).json({ employee });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/employees', async (req, res) => {
    try {
        const employees = await employeeService.listEmployees(req.query);
        res.json({ employees });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/employees/:id', async (req, res) => {
    try {
        const employee = await employeeService.getEmployeeById(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json({ employee });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/employees/:id', async (req, res) => {
    try {
        const employee = await employeeService.updateEmployee(req.params.id, req.body);
        res.json({ employee });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/employees/:id', async (req, res) => {
    try {
        await employeeService.deleteEmployee(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Department routes
router.post('/departments', async (req, res) => {
    try {
        const department = await employeeService.createDepartment(req.body);
        res.status(201).json({ department });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/departments', async (req, res) => {
    try {
        const departments = await employeeService.listDepartments();
        res.json({ departments });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Attendance routes
router.post('/attendance', async (req, res) => {
    try {
        const attendance = await attendanceService.markAttendance(req.body);
        res.status(201).json({ attendance });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/attendance/bulk', async (req, res) => {
    try {
        const results = await attendanceService.bulkMarkAttendance(req.body.records);
        res.json({ results });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/attendance/employee/:employeeId', async (req, res) => {
    try {
        const { month, year } = req.query;
        const attendance = await attendanceService.getAttendanceByEmployee(
            req.params.employeeId,
            parseInt(month as string),
            parseInt(year as string)
        );
        res.json({ attendance });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/attendance/summary/:employeeId', async (req, res) => {
    try {
        const { month, year } = req.query;
        const summary = await attendanceService.getAttendanceSummary(
            req.params.employeeId,
            parseInt(month as string),
            parseInt(year as string)
        );
        res.json({ summary });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Leave routes
router.post('/leaves', async (req, res) => {
    try {
        const leave = await leaveService.createLeaveRequest(req.body);
        res.status(201).json({ leave });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/leaves', async (req, res) => {
    try {
        const leaves = await leaveService.listLeaveRequests(req.query);
        res.json({ leaves });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/leaves/:id', async (req, res) => {
    try {
        const leave = await leaveService.getLeaveRequestById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave request not found' });
        res.json({ leave });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/leaves/:id/approve', async (req, res) => {
    try {
        const leave = await leaveService.approveLeaveRequest(req.params.id, req.body.approvedBy);
        res.json({ leave });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/leaves/:id/reject', async (req, res) => {
    try {
        const leave = await leaveService.rejectLeaveRequest(req.params.id, req.body.rejectedBy, req.body.notes);
        res.json({ leave });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/leaves/balance/:employeeId', async (req, res) => {
    try {
        const { year } = req.query;
        const balance = await leaveService.getLeaveBalance(req.params.employeeId, parseInt(year as string));
        res.json({ balance });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Payroll routes
router.post('/payroll/generate', async (req, res) => {
    try {
        const { employeeId, month, year } = req.body;
        const payroll = await payrollService.generatePayroll(employeeId, month, year);
        res.status(201).json({ payroll });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/payroll/bulk-generate', async (req, res) => {
    try {
        const { month, year } = req.body;
        const results = await payrollService.bulkGeneratePayroll(month, year);
        res.json({ results });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/payroll', async (req, res) => {
    try {
        const payrolls = await payrollService.listPayrolls(req.query);
        res.json({ payrolls });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/payroll/:id', async (req, res) => {
    try {
        const payroll = await payrollService.getPayrollById(req.params.id);
        if (!payroll) return res.status(404).json({ error: 'Payroll not found' });
        res.json({ payroll });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/payroll/:id/process', async (req, res) => {
    try {
        const payroll = await payrollService.processPayroll(req.params.id);
        res.json({ payroll });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/payroll/:id/pay', async (req, res) => {
    try {
        const { paymentMethod, paymentRef } = req.body;
        const payroll = await payrollService.markPayrollAsPaid(req.params.id, paymentMethod, paymentRef);
        res.json({ payroll });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
