import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';

const POSTED_PAYROLL = 'This payroll entry is already posted to the accounts and cannot be changed here.';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  // ── Staff ────────────────────────────────────────────────────────────────
  listStaff() {
    return (this.prisma as any).staff.findMany({
      orderBy: { employeeId: 'asc' },
    });
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
    const netPay =
      Math.round(
        (data.basicPay + (data.overtime ?? 0) - (data.deductions ?? 0)) * 100,
      ) / 100;
    if (netPay < 0 || Math.abs(data.netPay - netPay) > 0.01) {
      throw new BadRequestException(
        'Net pay must equal basic pay plus overtime minus deductions',
      );
    }
    return this.prisma.stockTransaction((tx) =>
      tx.payrollEntry.create({ data: { ...data, netPay } }),
    );
  }

  /**
   * Correction path for a stored row the ledger reports as unposted (an invalid
   * month or amounts from older data). Runs inside the stock transaction, so the
   * corrected row is journaled by the same commit. A posted row is left alone.
   */
  async updatePayrollEntry(id: string, data: {
    month?: string;
    daysWorked?: number;
    overtimeHrs?: number;
    basicPay?: number;
    overtime?: number;
    deductions?: number;
    netPay?: number;
  }) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) return null;
    return this.prisma.stockTransaction(async tx => {
      const existing = await tx.payrollEntry.findUnique({ where: { id: numId } });
      if (!existing) return null;
      if (await tx.journalEntry.findUnique({ where: { sourceKey: `PAYROLL:${numId}` } })) throw new BadRequestException(POSTED_PAYROLL);
      const month = data.month ?? existing.month;
      if (month !== existing.month && await tx.payrollEntry.findFirst({ where: { staffId: existing.staffId, month, id: { not: numId } } }))
        throw new ConflictException(`This staff member already has a payroll entry for ${month}`);
      const basicPay = data.basicPay ?? existing.basicPay, overtime = data.overtime ?? existing.overtime, deductions = data.deductions ?? existing.deductions;
      // A stored amount this request leaves untouched can itself be the invalid one.
      if (![basicPay, overtime, deductions].every(amount => Number.isFinite(amount) && amount >= 0)) throw new BadRequestException('Basic pay, overtime and deductions must be non-negative numbers');
      const netPay = Math.round((basicPay + overtime - deductions) * 100) / 100;
      if (netPay < 0 || (data.netPay !== undefined && Math.abs(data.netPay - netPay) > 0.01)) throw new BadRequestException('Net pay must equal basic pay plus overtime minus deductions');
      return tx.payrollEntry.update({ where: { id: numId }, data: { month, daysWorked: data.daysWorked, overtimeHrs: data.overtimeHrs, basicPay, overtime, deductions, netPay } });
    });
  }

  /** Removes a payroll row that never reached the accounts. */
  async deletePayrollEntry(id: string): Promise<boolean> {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) return false;
    return this.prisma.stockTransaction(async tx => {
      if (!(await tx.payrollEntry.findUnique({ where: { id: numId } }))) return false;
      if (await tx.journalEntry.findUnique({ where: { sourceKey: `PAYROLL:${numId}` } })) throw new BadRequestException(POSTED_PAYROLL);
      await tx.payrollEntry.delete({ where: { id: numId } });
      return true;
    });
  }
}
