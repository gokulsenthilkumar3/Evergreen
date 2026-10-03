import { prisma } from '../../prisma/client';

/**
 * Employee Management Service
 */
export async function createEmployee(data: any) {
    // Generate employee code
    const count = await prisma.employee.count();
    const employeeCode = `EMP${(count + 1).toString().padStart(4, '0')}`;

    return await prisma.employee.create({
        data: {
            ...data,
            employeeCode
        },
        include: {
            department: true
        }
    });
}

export async function getEmployeeById(id: string) {
    return await prisma.employee.findUnique({
        where: { id },
        include: {
            department: true,
            attendance: {
                take: 30,
                orderBy: { date: 'desc' }
            },
            leaveRequests: {
                take: 10,
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}

export async function listEmployees(filters: {
    departmentId?: string;
    status?: string;
    search?: string;
}) {
    const where: any = {};

    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
        where.OR = [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { employeeCode: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    return await prisma.employee.findMany({
        where,
        include: {
            department: {
                select: { name: true }
            }
        },
        orderBy: { employeeCode: 'asc' }
    });
}

export async function updateEmployee(id: string, data: any) {
    return await prisma.employee.update({
        where: { id },
        data,
        include: {
            department: true
        }
    });
}

export async function deleteEmployee(id: string) {
    return await prisma.employee.delete({
        where: { id }
    });
}

/**
 * Department Management
 */
export async function createDepartment(data: any) {
    return await prisma.department.create({
        data
    });
}

export async function listDepartments() {
    return await prisma.department.findMany({
        include: {
            _count: {
                select: { employees: true }
            }
        },
        orderBy: { name: 'asc' }
    });
}
