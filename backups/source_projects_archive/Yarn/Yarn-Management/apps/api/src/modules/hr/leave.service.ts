import { prisma } from '../../prisma/client';

/**
 * Leave Management Service
 */
export async function createLeaveRequest(data: any) {
    // Calculate number of days
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return await prisma.leaveRequest.create({
        data: {
            ...data,
            days
        },
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true,
                    employeeCode: true
                }
            }
        }
    });
}

export async function getLeaveRequestById(id: string) {
    return await prisma.leaveRequest.findUnique({
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

export async function listLeaveRequests(filters: {
    employeeId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    const where: any = {};

    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
        where.startDate = {};
        if (filters.startDate) where.startDate.gte = filters.startDate;
        if (filters.endDate) where.startDate.lte = filters.endDate;
    }

    return await prisma.leaveRequest.findMany({
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
        orderBy: { createdAt: 'desc' }
    });
}

export async function approveLeaveRequest(id: string, approvedBy: string) {
    return await prisma.leaveRequest.update({
        where: { id },
        data: {
            status: 'APPROVED',
            approvedBy,
            approvedAt: new Date()
        }
    });
}

export async function rejectLeaveRequest(id: string, rejectedBy: string, notes?: string) {
    return await prisma.leaveRequest.update({
        where: { id },
        data: {
            status: 'REJECTED',
            rejectedBy,
            rejectedAt: new Date(),
            notes
        }
    });
}

export async function getLeaveBalance(employeeId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const approvedLeaves = await prisma.leaveRequest.findMany({
        where: {
            employeeId,
            status: 'APPROVED',
            startDate: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    const totalDays = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);

    // Assuming 20 days annual leave
    const annualLeave = 20;
    const balance = annualLeave - totalDays;

    return {
        annualLeave,
        used: totalDays,
        balance,
        breakdown: approvedLeaves.reduce((acc: any, leave) => {
            acc[leave.leaveType] = (acc[leave.leaveType] || 0) + leave.days;
            return acc;
        }, {})
    };
}
