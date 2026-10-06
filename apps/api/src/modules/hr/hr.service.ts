import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  // ── Staff ────────────────────────────────────────────────────────────────
  listStaff() {
    return (this.prisma as any).staff.findMany({ orderBy: { employeeId: 'asc' } });
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
    return (this.prisma as any).staff.create({ data });
  }

  // ── Shifts ───────────────────────────────────────────────────────────────
  listShifts() {
    return (this.prisma as any).shift.findMany({ orderBy: { name: 'asc' } });
  }

  createShift(data: { name: string; startTime: string; endTime: string }) {
    return (this.prisma as any).shift.create({ data });
  }

  // ── Payroll ──────────────────────────────────────────────────────────────
  listPayroll(month?: string) {
    const where = month ? { month } : undefined;
    return (this.prisma as any).payrollEntry.findMany({
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
    const netPay = Math.round((data.basicPay + (data.overtime ?? 0) - (data.deductions ?? 0)) * 100) / 100;
    if (netPay < 0 || Math.abs(data.netPay - netPay) > 0.01) {
      throw new BadRequestException('Net pay must equal basic pay plus overtime minus deductions');
    }
    return this.prisma.stockTransaction(tx => tx.payrollEntry.create({ data: { ...data, netPay } }));
  }
}
