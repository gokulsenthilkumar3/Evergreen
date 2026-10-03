import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../../middleware/authenticate';
import {
    createInspectionSchema,
    updateInspectionSchema,
    createQualityTestSchema,
    updateQualityTestSchema,
    createDefectLogSchema,
    updateDefectLogSchema,
    createInspectionTemplateSchema,
    updateInspectionTemplateSchema,
} from './quality-control.schemas';
import { uploadQualityPhotos, getPhotoUrl } from '../../middleware/uploadPhotos';
import { createNotification } from '../notifications/notification.service';

// Helper to notify all active users (usually admins/managers would be filtered but using all for now)
async function notifyQualityIssue(title: string, message: string, data: any) {
    try {
        const users = await prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true }
        });

        for (const user of users) {
            await createNotification({
                userId: user.id,
                type: 'QUALITY_ALERT',
                title,
                message,
                data
            });
        }
    } catch (err) {
        console.error('Failed to send notification:', err);
    }
}

export const qualityControlRouter = Router();

// ============================================
// PHOTO UPLOAD
// ============================================

// Upload photos
qualityControlRouter.post('/upload-photos', authenticate, uploadQualityPhotos.array('photos', 10), async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const photoUrls = req.files.map(file => getPhotoUrl(file.filename));

        return res.json({ photoUrls });
    } catch (e) {
        return next(e);
    }
});

// ============================================
// QUALITY INSPECTIONS
// ============================================

// List all inspections
qualityControlRouter.get('/inspections', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId, status, inspectorId } = req.query;

        const where: any = {};
        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;
        if (status) where.status = status;
        if (inspectorId) where.inspectorId = inspectorId;

        const inspections = await prisma.qualityInspection.findMany({
            where,
            include: {
                template: { select: { id: true, name: true } },
                inspector: { select: { id: true, name: true, email: true } },
            },
            orderBy: { inspectionDate: 'desc' },
        });

        return res.json({ inspections });
    } catch (e) {
        return next(e);
    }
});

// Get single inspection
qualityControlRouter.get('/inspections/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const inspection = await prisma.qualityInspection.findUnique({
            where: { id },
            include: {
                template: true,
                inspector: { select: { id: true, name: true, email: true } },
            },
        });

        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }

        return res.json({ inspection });
    } catch (e) {
        return next(e);
    }
});

// Create inspection
qualityControlRouter.post('/inspections', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createInspectionSchema.parse(req.body);

        const inspection = await prisma.qualityInspection.create({
            data: {
                ...body,
                inspectionDate: body.inspectionDate ? new Date(body.inspectionDate) : new Date(),
            },
            include: {
                template: true,
                inspector: { select: { id: true, name: true, email: true } },
            },
        });

        // Trigger notification if failed
        if (inspection.result === 'FAIL') {
            await notifyQualityIssue(
                'Quality Inspection Failed',
                `Inspection ${inspection.inspectionNumber} failed for ${inspection.entityType} ${inspection.entityId}`,
                { inspectionId: inspection.id, entityType: inspection.entityType, entityId: inspection.entityId }
            );
        }

        // Auto-update RawMaterial status if it's currently QUALITY_CHECK
        if (inspection.entityType === 'RAW_MATERIAL' && inspection.result === 'PASS') {
            await prisma.rawMaterial.updateMany({
                where: { id: inspection.entityId, status: 'QUALITY_CHECK' },
                data: { status: 'IN_STOCK' }
            });
        }

        return res.status(201).json({ inspection });
    } catch (e) {
        return next(e);
    }
});

// Update inspection
qualityControlRouter.patch('/inspections/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updateInspectionSchema.parse(req.body);

        const existing = await prisma.qualityInspection.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Inspection not found' });
        }

        const inspection = await prisma.qualityInspection.update({
            where: { id },
            data: {
                ...body,
                inspectionDate: body.inspectionDate ? new Date(body.inspectionDate) : undefined,
            },
            include: {
                template: true,
                inspector: { select: { id: true, name: true, email: true } },
            },
        });

        // Trigger notification if result changed to FAIL
        if (inspection.result === 'FAIL' && existing.result !== 'FAIL') {
            await notifyQualityIssue(
                'Quality Inspection Failed',
                `Inspection ${inspection.inspectionNumber} failed for ${inspection.entityType} ${inspection.entityId}`,
                { inspectionId: inspection.id, entityType: inspection.entityType, entityId: inspection.entityId }
            );
        }

        // Auto-update RawMaterial status if it's currently QUALITY_CHECK and inspection passed
        if (inspection.entityType === 'RAW_MATERIAL' && inspection.result === 'PASS') {
            await prisma.rawMaterial.updateMany({
                where: { id: inspection.entityId, status: 'QUALITY_CHECK' },
                data: { status: 'IN_STOCK' }
            });
        }

        return res.json({ inspection });
    } catch (e) {
        return next(e);
    }
});

// Delete inspection
qualityControlRouter.delete('/inspections/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.qualityInspection.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return next(e);
    }
});

// ============================================
// QUALITY TESTS
// ============================================

// List all tests
qualityControlRouter.get('/tests', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId, status } = req.query;

        const where: any = {};
        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;
        if (status) where.status = status;

        const tests = await prisma.qualityTest.findMany({
            where,
            orderBy: { testDate: 'desc' },
        });

        return res.json({ tests });
    } catch (e) {
        return next(e);
    }
});

// Get single test
qualityControlRouter.get('/tests/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const test = await prisma.qualityTest.findUnique({
            where: { id },
        });

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        return res.json({ test });
    } catch (e) {
        return next(e);
    }
});

// Create test
qualityControlRouter.post('/tests', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createQualityTestSchema.parse(req.body);

        // Calculate quality score if not provided
        let qualityScore = body.qualityScore;
        let qualityGrade = body.qualityGrade;

        if (!qualityScore && body.testParameters) {
            const params = body.testParameters as any[];
            const totalWeight = params.reduce((sum, p) => sum + (p.weight || 1), 0);
            const weightedScore = params.reduce((sum, p) => {
                const weight = p.weight || 1;
                const score = p.passed ? 100 : 0;
                return sum + (score * weight);
            }, 0);
            qualityScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
        }

        // Determine quality grade based on score
        if (!qualityGrade && qualityScore !== undefined) {
            if (qualityScore >= 90) qualityGrade = 'A';
            else if (qualityScore >= 80) qualityGrade = 'B';
            else if (qualityScore >= 70) qualityGrade = 'C';
            else if (qualityScore >= 60) qualityGrade = 'D';
            else qualityGrade = 'F';
        }

        const test = await prisma.qualityTest.create({
            data: {
                ...body,
                testDate: body.testDate ? new Date(body.testDate) : new Date(),
                qualityScore,
                qualityGrade,
            },
        });

        // Trigger notification if score is low
        if (test.qualityScore !== null && Number(test.qualityScore) < 70) {
            await notifyQualityIssue(
                'Low Quality Score Alert',
                `Test ${test.testNumber} resulted in a low score of ${Number(test.qualityScore)} for ${test.entityType} ${test.entityId}`,
                { testId: test.id, entityType: test.entityType, entityId: test.entityId, score: Number(test.qualityScore) }
            );
        }

        // Auto-update scores in target modules
        if (test.entityType === 'RAW_MATERIAL') {
            await prisma.rawMaterial.update({
                where: { id: test.entityId },
                data: { qualityScore: test.qualityScore || 0 }
            });
        } else if (test.entityType === 'PRODUCTION_BATCH') {
            await prisma.productionBatch.update({
                where: { id: test.entityId },
                data: {
                    qualityScore: test.qualityScore || 0,
                    qualityGrade: test.qualityGrade
                }
            });
        }

        return res.status(201).json({ test });
    } catch (e) {
        return next(e);
    }
});

// Update test
qualityControlRouter.patch('/tests/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updateQualityTestSchema.parse(req.body);

        const existing = await prisma.qualityTest.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Recalculate quality score if test parameters changed
        let qualityScore = body.qualityScore;
        let qualityGrade = body.qualityGrade;

        if (body.testParameters && !body.qualityScore) {
            const params = body.testParameters as any[];
            const totalWeight = params.reduce((sum, p) => sum + (p.weight || 1), 0);
            const weightedScore = params.reduce((sum, p) => {
                const weight = p.weight || 1;
                const score = p.passed ? 100 : 0;
                return sum + (score * weight);
            }, 0);
            qualityScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
        }

        if (!qualityGrade && qualityScore !== undefined) {
            if (qualityScore >= 90) qualityGrade = 'A';
            else if (qualityScore >= 80) qualityGrade = 'B';
            else if (qualityScore >= 70) qualityGrade = 'C';
            else if (qualityScore >= 60) qualityGrade = 'D';
            else qualityGrade = 'F';
        }

        const test = await prisma.qualityTest.update({
            where: { id },
            data: {
                ...body,
                testDate: body.testDate ? new Date(body.testDate) : undefined,
                qualityScore,
                qualityGrade,
            },
        });

        // Trigger notification if score is low and was previously higher
        if (test.qualityScore !== null && Number(test.qualityScore) < 70 && (existing.qualityScore === null || Number(existing.qualityScore) >= 70)) {
            await notifyQualityIssue(
                'Low Quality Score Alert',
                `Test ${test.testNumber} resulted in a low score of ${Number(test.qualityScore)} for ${test.entityType} ${test.entityId}`,
                { testId: test.id, entityType: test.entityType, entityId: test.entityId, score: Number(test.qualityScore) }
            );
        }

        // Auto-update scores in target modules
        if (test.entityType === 'RAW_MATERIAL') {
            await prisma.rawMaterial.update({
                where: { id: test.entityId },
                data: { qualityScore: test.qualityScore || 0 }
            });
        } else if (test.entityType === 'PRODUCTION_BATCH') {
            await prisma.productionBatch.update({
                where: { id: test.entityId },
                data: {
                    qualityScore: test.qualityScore || 0,
                    qualityGrade: test.qualityGrade
                }
            });
        }

        return res.json({ test });
    } catch (e) {
        return next(e);
    }
});

// Delete test
qualityControlRouter.delete('/tests/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.qualityTest.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return next(e);
    }
});

// Generate certificate
qualityControlRouter.post('/tests/:id/certificate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const test = await prisma.qualityTest.findUnique({ where: { id } });
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // In a real implementation, this would generate a PDF certificate
        // For now, we'll just return the test data formatted for certificate
        const certificateData = {
            testNumber: test.testNumber,
            testDate: test.testDate,
            qualityScore: test.qualityScore,
            qualityGrade: test.qualityGrade,
            testParameters: test.testParameters,
            testedBy: test.testedBy,
            certificateUrl: `/certificates/${test.testNumber}.pdf`, // Mock URL
        };

        // Update test with certificate URL
        await prisma.qualityTest.update({
            where: { id },
            data: { certificateUrl: certificateData.certificateUrl },
        });

        return res.json({ certificate: certificateData });
    } catch (e) {
        return next(e);
    }
});

// ============================================
// DEFECT LOGS
// ============================================

// List all defects
qualityControlRouter.get('/defects', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, entityId, severity, actionStatus, defectCategory } = req.query;

        const where: any = {};
        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;
        if (severity) where.severity = severity;
        if (actionStatus) where.actionStatus = actionStatus;
        if (defectCategory) where.defectCategory = defectCategory;

        const defects = await prisma.defectLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return res.json({ defects });
    } catch (e) {
        return next(e);
    }
});

// Get single defect
qualityControlRouter.get('/defects/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const defect = await prisma.defectLog.findUnique({
            where: { id },
        });

        if (!defect) {
            return res.status(404).json({ message: 'Defect not found' });
        }

        return res.json({ defect });
    } catch (e) {
        return next(e);
    }
});

// Create defect
qualityControlRouter.post('/defects', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createDefectLogSchema.parse(req.body);

        const defect = await prisma.defectLog.create({
            data: {
                ...body,
                actionDueDate: body.actionDueDate ? new Date(body.actionDueDate) : undefined,
                actionCompletedDate: body.actionCompletedDate ? new Date(body.actionCompletedDate) : undefined,
            },
        });

        // Trigger notification for high-severity defects
        if (['MAJOR', 'CRITICAL'].includes(defect.severity)) {
            await notifyQualityIssue(
                `High Severity Defect Alert: ${defect.severity}`,
                `A ${defect.severity} defect (${defect.defectCategory}) has been logged for ${defect.entityType} ${defect.entityId}`,
                { defectId: defect.id, severity: defect.severity, category: defect.defectCategory }
            );
        }

        return res.status(201).json({ defect });
    } catch (e) {
        return next(e);
    }
});

// Update defect
qualityControlRouter.patch('/defects/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updateDefectLogSchema.parse(req.body);

        const existing = await prisma.defectLog.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Defect not found' });
        }

        const defect = await prisma.defectLog.update({
            where: { id },
            data: {
                ...body,
                actionDueDate: body.actionDueDate ? new Date(body.actionDueDate) : undefined,
                actionCompletedDate: body.actionCompletedDate ? new Date(body.actionCompletedDate) : undefined,
            },
        });

        // Trigger notification if severity changed to high
        if (['MAJOR', 'CRITICAL'].includes(defect.severity) && !['MAJOR', 'CRITICAL'].includes(existing.severity)) {
            await notifyQualityIssue(
                `High Severity Defect Alert: ${defect.severity}`,
                `A ${defect.severity} defect (${defect.defectCategory}) has been logged for ${defect.entityType} ${defect.entityId}`,
                { defectId: defect.id, severity: defect.severity, category: defect.defectCategory }
            );
        }

        return res.json({ defect });
    } catch (e) {
        return next(e);
    }
});

// Delete defect
qualityControlRouter.delete('/defects/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.defectLog.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return next(e);
    }
});

// Get defect analytics
qualityControlRouter.get('/defects/analytics', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if (endDate) where.createdAt.lte = new Date(endDate as string);
        }

        const defects = await prisma.defectLog.findMany({ where });

        // Calculate analytics
        const totalDefects = defects.length;
        const bySeverity = {
            CRITICAL: defects.filter((d: any) => d.severity === 'CRITICAL').length,
            MAJOR: defects.filter((d: any) => d.severity === 'MAJOR').length,
            MINOR: defects.filter((d: any) => d.severity === 'MINOR').length,
        };
        const byCategory = defects.reduce((acc: Record<string, number>, d: any) => {
            acc[d.defectCategory] = (acc[d.defectCategory] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const byStatus = {
            PENDING: defects.filter((d: any) => d.actionStatus === 'PENDING').length,
            IN_PROGRESS: defects.filter((d: any) => d.actionStatus === 'IN_PROGRESS').length,
            COMPLETED: defects.filter((d: any) => d.actionStatus === 'COMPLETED').length,
            CANCELLED: defects.filter((d: any) => d.actionStatus === 'CANCELLED').length,
        };

        return res.json({
            analytics: {
                totalDefects,
                bySeverity,
                byCategory,
                byStatus,
            },
        });
    } catch (e) {
        return next(e);
    }
});

// ============================================
// INSPECTION TEMPLATES
// ============================================

// List all templates
qualityControlRouter.get('/templates', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, isActive } = req.query;

        const where: any = {};
        if (entityType) where.entityType = entityType;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const templates = await prisma.inspectionTemplate.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return res.json({ templates });
    } catch (e) {
        return next(e);
    }
});

// Get single template
qualityControlRouter.get('/templates/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const template = await prisma.inspectionTemplate.findUnique({
            where: { id },
            include: {
                inspections: {
                    select: { id: true, inspectionNumber: true, inspectionDate: true, status: true },
                    orderBy: { inspectionDate: 'desc' },
                    take: 10,
                },
            },
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        return res.json({ template });
    } catch (e) {
        return next(e);
    }
});

// Create template
qualityControlRouter.post('/templates', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = createInspectionTemplateSchema.parse(req.body);

        const template = await prisma.inspectionTemplate.create({
            data: body,
        });

        return res.status(201).json({ template });
    } catch (e) {
        return next(e);
    }
});

// Update template
qualityControlRouter.patch('/templates/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = updateInspectionTemplateSchema.parse(req.body);

        const existing = await prisma.inspectionTemplate.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const template = await prisma.inspectionTemplate.update({
            where: { id },
            data: body,
        });

        return res.json({ template });
    } catch (e) {
        return next(e);
    }
});

// Delete template
qualityControlRouter.delete('/templates/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.inspectionTemplate.delete({ where: { id } });
        return res.json({ ok: true });
    } catch (e) {
        return next(e);
    }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// Quality metrics overview
qualityControlRouter.get('/analytics/overview', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate as string);
        if (endDate) dateFilter.lte = new Date(endDate as string);

        // Get inspection stats
        const inspections = await prisma.qualityInspection.findMany({
            where: startDate || endDate ? { inspectionDate: dateFilter } : undefined,
        });

        const totalInspections = inspections.length;
        const passedInspections = inspections.filter((i: any) => i.result === 'PASS').length;
        const failedInspections = inspections.filter((i: any) => i.result === 'FAIL').length;
        const conditionalPass = inspections.filter((i: any) => i.result === 'CONDITIONAL_PASS').length;
        const pendingInspections = inspections.filter((i: any) => i.status === 'PENDING' || i.status === 'IN_PROGRESS').length;

        // Get test stats
        const tests = await prisma.qualityTest.findMany({
            where: startDate || endDate ? { testDate: dateFilter } : undefined,
        });

        const totalTests = tests.length;
        const avgQualityScore = tests.length > 0
            ? tests.reduce((sum: number, t: any) => sum + (t.qualityScore || 0), 0) / tests.length
            : 0;

        const gradeDistribution = {
            A: tests.filter((t: any) => t.qualityGrade === 'A').length,
            B: tests.filter((t: any) => t.qualityGrade === 'B').length,
            C: tests.filter((t: any) => t.qualityGrade === 'C').length,
            D: tests.filter((t: any) => t.qualityGrade === 'D').length,
            F: tests.filter((t: any) => t.qualityGrade === 'F').length,
        };

        // Get defect stats
        const defects = await prisma.defectLog.findMany({
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
        });

        const totalDefects = defects.length;
        const criticalDefects = defects.filter((d: any) => d.severity === 'CRITICAL').length;
        const openDefects = defects.filter((d: any) => d.actionStatus === 'PENDING' || d.actionStatus === 'IN_PROGRESS').length;

        // Calculate pass rate
        const passRate = totalInspections > 0
            ? ((passedInspections + conditionalPass) / totalInspections) * 100
            : 0;

        return res.json({
            overview: {
                inspections: {
                    total: totalInspections,
                    passed: passedInspections,
                    failed: failedInspections,
                    conditionalPass,
                    pending: pendingInspections,
                    passRate: Math.round(passRate * 100) / 100,
                },
                tests: {
                    total: totalTests,
                    avgQualityScore: Math.round(avgQualityScore * 100) / 100,
                    gradeDistribution,
                },
                defects: {
                    total: totalDefects,
                    critical: criticalDefects,
                    open: openDefects,
                },
            },
        });
    } catch (e) {
        return next(e);
    }
});

// Supplier quality comparison
qualityControlRouter.get('/analytics/supplier-quality', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate as string);
        if (endDate) dateFilter.lte = new Date(endDate as string);

        // Get raw material inspections with supplier info
        const inspections = await prisma.qualityInspection.findMany({
            where: {
                entityType: 'RAW_MATERIAL',
                ...(startDate || endDate ? { inspectionDate: dateFilter } : {}),
            },
        });

        // Get quality tests with material info
        const tests = await prisma.qualityTest.findMany({
            where: {
                entityType: 'RAW_MATERIAL',
                ...(startDate || endDate ? { testDate: dateFilter } : {}),
            },
        });

        // Get raw materials with supplier info
        const rawMaterials = await prisma.rawMaterial.findMany({
            include: {
                supplier: { select: { id: true, name: true } },
            },
        });

        // Build supplier quality map
        const supplierMap = new Map<string, {
            supplierId: string;
            supplierName: string;
            totalInspections: number;
            passedInspections: number;
            totalTests: number;
            avgScore: number;
            totalDefects: number;
        }>();

        // Map materials to suppliers
        const materialToSupplier = new Map<string, { supplierId: string; supplierName: string }>();
        rawMaterials.forEach((rm: any) => {
            if (rm.supplier) {
                materialToSupplier.set(rm.id, {
                    supplierId: rm.supplier.id,
                    supplierName: rm.supplier.name,
                });
            }
        });

        // Process inspections
        inspections.forEach((insp: any) => {
            const supplier = materialToSupplier.get(insp.entityId);
            if (!supplier) return;

            if (!supplierMap.has(supplier.supplierId)) {
                supplierMap.set(supplier.supplierId, {
                    supplierId: supplier.supplierId,
                    supplierName: supplier.supplierName,
                    totalInspections: 0,
                    passedInspections: 0,
                    totalTests: 0,
                    avgScore: 0,
                    totalDefects: 0,
                });
            }

            const entry = supplierMap.get(supplier.supplierId)!;
            entry.totalInspections++;
            if (insp.result === 'PASS' || insp.result === 'CONDITIONAL_PASS') {
                entry.passedInspections++;
            }
        });

        // Process tests
        tests.forEach((test: any) => {
            const supplier = materialToSupplier.get(test.entityId);
            if (!supplier) return;

            const entry = supplierMap.get(supplier.supplierId);
            if (entry) {
                entry.totalTests++;
                entry.avgScore = ((entry.avgScore * (entry.totalTests - 1)) + (test.qualityScore || 0)) / entry.totalTests;
            }
        });

        // Get defects
        const defects = await prisma.defectLog.findMany({
            where: {
                entityType: 'RAW_MATERIAL',
                ...(startDate || endDate ? { createdAt: dateFilter } : {}),
            },
        });

        defects.forEach((defect: any) => {
            const supplier = materialToSupplier.get(defect.entityId);
            if (!supplier) return;

            const entry = supplierMap.get(supplier.supplierId);
            if (entry) {
                entry.totalDefects++;
            }
        });

        // Convert to array and calculate rates
        const supplierQuality = Array.from(supplierMap.values()).map(s => ({
            ...s,
            passRate: s.totalInspections > 0
                ? Math.round((s.passedInspections / s.totalInspections) * 100 * 100) / 100
                : 0,
            avgScore: Math.round(s.avgScore * 100) / 100,
        }));

        // Sort by pass rate descending
        supplierQuality.sort((a, b) => b.passRate - a.passRate);

        return res.json({ supplierQuality });
    } catch (e) {
        return next(e);
    }
});

// Stage-wise quality trends
qualityControlRouter.get('/analytics/stage-trends', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period as string, 10) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get inspections grouped by date
        const inspections = await prisma.qualityInspection.findMany({
            where: { inspectionDate: { gte: startDate } },
            orderBy: { inspectionDate: 'asc' },
        });

        // Get tests grouped by date
        const tests = await prisma.qualityTest.findMany({
            where: { testDate: { gte: startDate } },
            orderBy: { testDate: 'asc' },
        });

        // Group by date
        const trendMap = new Map<string, {
            date: string;
            rawMaterialInspections: number;
            rawMaterialPassed: number;
            productionInspections: number;
            productionPassed: number;
            avgQualityScore: number;
            testCount: number;
        }>();

        inspections.forEach((insp: any) => {
            const dateKey = new Date(insp.inspectionDate).toISOString().split('T')[0];

            if (!trendMap.has(dateKey)) {
                trendMap.set(dateKey, {
                    date: dateKey,
                    rawMaterialInspections: 0,
                    rawMaterialPassed: 0,
                    productionInspections: 0,
                    productionPassed: 0,
                    avgQualityScore: 0,
                    testCount: 0,
                });
            }

            const entry = trendMap.get(dateKey)!;
            if (insp.entityType === 'RAW_MATERIAL') {
                entry.rawMaterialInspections++;
                if (insp.result === 'PASS' || insp.result === 'CONDITIONAL_PASS') {
                    entry.rawMaterialPassed++;
                }
            } else if (insp.entityType === 'PRODUCTION_BATCH') {
                entry.productionInspections++;
                if (insp.result === 'PASS' || insp.result === 'CONDITIONAL_PASS') {
                    entry.productionPassed++;
                }
            }
        });

        tests.forEach((test: any) => {
            const dateKey = new Date(test.testDate).toISOString().split('T')[0];

            if (!trendMap.has(dateKey)) {
                trendMap.set(dateKey, {
                    date: dateKey,
                    rawMaterialInspections: 0,
                    rawMaterialPassed: 0,
                    productionInspections: 0,
                    productionPassed: 0,
                    avgQualityScore: 0,
                    testCount: 0,
                });
            }

            const entry = trendMap.get(dateKey)!;
            entry.testCount++;
            entry.avgQualityScore = ((entry.avgQualityScore * (entry.testCount - 1)) + (test.qualityScore || 0)) / entry.testCount;
        });

        // Convert to array and calculate rates
        const trends = Array.from(trendMap.values())
            .map(t => ({
                ...t,
                rawMaterialPassRate: t.rawMaterialInspections > 0
                    ? Math.round((t.rawMaterialPassed / t.rawMaterialInspections) * 100)
                    : null,
                productionPassRate: t.productionInspections > 0
                    ? Math.round((t.productionPassed / t.productionInspections) * 100)
                    : null,
                avgQualityScore: Math.round(t.avgQualityScore * 100) / 100,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return res.json({ trends });
    } catch (e) {
        return next(e);
    }
});

// Rejection rate analysis
qualityControlRouter.get('/analytics/rejection-rates', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate, groupBy = 'category' } = req.query;

        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate as string);
        if (endDate) dateFilter.lte = new Date(endDate as string);

        // Get failed inspections
        const failedInspections = await prisma.qualityInspection.findMany({
            where: {
                result: 'FAIL',
                ...(startDate || endDate ? { inspectionDate: dateFilter } : {}),
            },
        });

        // Get all inspections for calculating rates
        const allInspections = await prisma.qualityInspection.findMany({
            where: startDate || endDate ? { inspectionDate: dateFilter } : undefined,
        });

        // Get defects
        const defects = await prisma.defectLog.findMany({
            where: startDate || endDate ? { createdAt: dateFilter } : undefined,
        });

        // Group by entity type
        const byEntityType = {
            RAW_MATERIAL: {
                total: allInspections.filter((i: any) => i.entityType === 'RAW_MATERIAL').length,
                failed: failedInspections.filter((i: any) => i.entityType === 'RAW_MATERIAL').length,
                defects: defects.filter((d: any) => d.entityType === 'RAW_MATERIAL').length,
            },
            PRODUCTION_BATCH: {
                total: allInspections.filter((i: any) => i.entityType === 'PRODUCTION_BATCH').length,
                failed: failedInspections.filter((i: any) => i.entityType === 'PRODUCTION_BATCH').length,
                defects: defects.filter((d: any) => d.entityType === 'PRODUCTION_BATCH').length,
            },
        };

        // Calculate rejection rates
        const rejectionByEntity = Object.entries(byEntityType).map(([entityType, data]) => ({
            entityType,
            totalInspections: data.total,
            failedInspections: data.failed,
            defectCount: data.defects,
            rejectionRate: data.total > 0
                ? Math.round((data.failed / data.total) * 100 * 100) / 100
                : 0,
        }));

        // Group defects by category
        const defectsByCategory = defects.reduce((acc: Record<string, number>, d: any) => {
            const category = d.defectCategory || 'Unknown';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        // Group defects by severity
        const defectsBySeverity = {
            CRITICAL: defects.filter((d: any) => d.severity === 'CRITICAL').length,
            MAJOR: defects.filter((d: any) => d.severity === 'MAJOR').length,
            MINOR: defects.filter((d: any) => d.severity === 'MINOR').length,
        };

        // Calculate overall rejection rate
        const overallRejectionRate = allInspections.length > 0
            ? Math.round((failedInspections.length / allInspections.length) * 100 * 100) / 100
            : 0;

        return res.json({
            rejectionAnalysis: {
                overallRejectionRate,
                totalInspections: allInspections.length,
                totalRejections: failedInspections.length,
                totalDefects: defects.length,
                byEntityType: rejectionByEntity,
                defectsByCategory: Object.entries(defectsByCategory).map(([category, count]) => ({
                    category,
                    count,
                })),
                defectsBySeverity,
            },
        });
    } catch (e) {
        return next(e);
    }
});
