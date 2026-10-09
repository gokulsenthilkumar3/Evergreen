import { prisma } from '../../prisma/client';
import { getAttendanceSummary } from './attendance.service';

/**
 * Payroll Management Service
 */
export async function generatePayroll(employeeId: string, month: number, year: number) {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
    });

    if (!employee) {
        throw new Error('Employee not found');
    }

    // Get attendance summary
    const attendance = await getAttendanceSummary(employeeId, month, year);

    // Calculate working days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays = daysInMonth; // Simplified, should exclude weekends/holidays

    // Calculate salary
    const baseSalary = Number(employee.baseSalary) || 0;
    const perDaySalary = baseSalary / workingDays;
    const earnedSalary = perDaySalary * attendance.present;

    // Default allowances and deductions (can be customized)
    const allowances = 0;
    const deductions = 0;
    const netSalary = earnedSalary + allowances - deductions;

    // Check if payroll already exists
    const existing = await prisma.payroll.findUnique({
        where: {
            employeeId_month_year: {
                employeeId,
                month,
                year
            }
        }
    });

    if (existing) {
        return await prisma.payroll.update({
            where: { id: existing.id },
            data: {
                baseSalary,
                allowances,
                deductions,
                netSalary,
                workingDays,
                presentDays: attendance.present,
                leaveDays: attendance.onLeave
            }
        });
    }

    return await prisma.payroll.create({
        data: {
            employeeId,
            month,
            year,
            baseSalary,
            allowances,
            deductions,
            netSalary,
            workingDays,
            presentDays: attendance.present,
            leaveDays: attendance.onLeave
        }
    });
}

export async function getPayrollById(id: string) {
    return await prisma.payroll.findUnique({
        where: { id },
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    employeeCode: true,
                    department: {
                        select: { name: true }
                    }
                }
            }
        }
    });
}

export async function listPayrolls(filters: {
    month?: number;
    year?: number;
    employeeId?: string;
    status?: string;
}) {
    const where: any = {};

    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;

    return await prisma.payroll.findMany({
        where,
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    employeeCode: true
                }
            }
        },
        orderBy: [
            { year: 'desc' },
            { month: 'desc' }
        ]
    });
}

export async function processPayroll(id: string) {
    return await prisma.payroll.update({
        where: { id },
        data: {
            status: 'PROCESSED'
        }
    });
}

export async function markPayrollAsPaid(id: string, paymentMethod: string, paymentRef?: string) {
    return await prisma.payroll.update({
        where: { id },
        data: {
            status: 'PAID',
            paidAt: new Date(),
            paymentMethod,
            paymentRef
        }
    });
}

export async function bulkGeneratePayroll(month: number, year: number) {
    const employees = await prisma.employee.findMany({
        where: { status: 'ACTIVE' }
    });

    const results = [];
    for (const employee of employees) {
        try {
            const payroll = await generatePayroll(employee.id, month, year);
            results.push({ success: true, employeeId: employee.id, payroll });
        } catch (error: any) {
            results.push({ success: false, employeeId: employee.id, error: error.message });
        }
    }

    return results;
}
