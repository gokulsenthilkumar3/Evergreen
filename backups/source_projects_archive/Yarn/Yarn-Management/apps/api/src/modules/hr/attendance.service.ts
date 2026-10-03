import { prisma } from '../../prisma/client';
import { AttendanceStatus } from '@prisma/client';

/**
 * Attendance Management Service
 */
export async function markAttendance(data: {
    employeeId: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: string;
    notes?: string;
}) {
    const { employeeId, date, ...rest } = data;

    // Check if attendance already exists for this date
    const existing = await prisma.attendance.findUnique({
        where: {
            employeeId_date: {
                employeeId,
                date: new Date(date.toDateString())
            }
        }
    });

    if (existing) {
        return await prisma.attendance.update({
            where: { id: existing.id },
            data: {
                ...rest,
                status: rest.status as AttendanceStatus
            }
        });
    }

    return await prisma.attendance.create({
        data: {
            employeeId,
            date: new Date(date.toDateString()),
            ...rest,
            status: rest.status as AttendanceStatus
        }
    });
}

export async function getAttendanceByEmployee(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return await prisma.attendance.findMany({
        where: {
            employeeId,
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { date: 'asc' }
    });
}

export async function getAttendanceSummary(employeeId: string, month: number, year: number) {
    const records = await getAttendanceByEmployee(employeeId, month, year);

    return {
        totalDays: records.length,
        present: records.filter(r => r.status === 'PRESENT').length,
        absent: records.filter(r => r.status === 'ABSENT').length,
        halfDay: records.filter(r => r.status === 'HALF_DAY').length,
        late: records.filter(r => r.status === 'LATE').length,
        onLeave: records.filter(r => r.status === 'ON_LEAVE').length,
        totalWorkHours: records.reduce((sum, r) => sum + (Number(r.workHours) || 0), 0)
    };
}

export async function bulkMarkAttendance(attendanceData: any[]) {
    const results = [];
    for (const data of attendanceData) {
        const result = await markAttendance(data);
        results.push(result);
    }
    return results;
}
