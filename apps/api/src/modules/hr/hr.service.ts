import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  // ── Staff ────────────────────────────────────────────────────────────────
  listStaff() {
    return this.prisma.staff.findMany({ orderBy: { employeeId: 'asc' } });
  }

  createStaff(data: {
    employeeId: string;
    name: string;
    role: string;
    department?: string;
    phone?: string;
    joinDate?: Date | string;
    salaryType?: string;
    dailyRate?: number;
    monthlySalary?: number;
  }) {
    return this.prisma.staff.create({ data });
  }

  // ── Shifts ───────────────────────────────────────────────────────────────
  listShifts() {
    return this.prisma.shift.findMany({ orderBy: { name: 'asc' } });
  }

  createShift(data: { name: string; startTime: string; endTime: string }) {
    return this.prisma.shift.create({ data });
  }

  // ── Payroll ──────────────────────────────────────────────────────────────
  listPayroll(month?: string) {
    const where = month ? { month } : undefined;
    return this.prisma.payrollEntry.findMany({
      where,
      include: {
        staff: { select: { employeeId: true, name: true, department: true } },
      },
      orderBy: [{ month: 'desc' }, { staffId: 'asc' }],
    });
  }

  createPayrollEntry(data: {
    staffId: number;
    month: string;
    daysWorked: number;
    overtimeHrs?: number;
    basicPay: number;
    overtime?: number;
    deductions?: number;
    netPay: number;
  }) {
    return this.prisma.payrollEntry.create({ data });
  }
}
