import { prisma } from '../../prisma/client';
import { RiskLevel, RiskCategory } from '@prisma/client';
import { recordAuditLog } from '../../utils/audit';

/**
 * Create a risk assessment for a supplier
 */
export async function createRiskAssessment(
    supplierId: string,
    userId: string,
    data: {
        riskCategory: RiskCategory;
        riskLevel: RiskLevel;
        description: string;
        mitigationPlan?: string;
        reviewDate?: Date;
        notes?: string;
    }
) {
    const assessment = await prisma.supplierRiskAssessment.create({
        data: {
            supplierId,
            assessedBy: userId,
            ...data,
        },
        include: {
            assessor: { select: { name: true } },
        },
    });

    await recordAuditLog('supplier.risk.assess', {
        userId,
        entityType: 'Supplier',
        entityId: supplierId,
        metadata: { riskLevel: data.riskLevel, riskCategory: data.riskCategory },
    });

    // Update supplier's overall risk score
    await updateSupplierRiskScore(supplierId);

    return assessment;
}

/**
 * Calculate overall risk score (0-100, higher = more risky)
 */
async function updateSupplierRiskScore(supplierId: string) {
    const assessments = await prisma.supplierRiskAssessment.findMany({
        where: {
            supplierId,
            status: 'ACTIVE',
        },
    });

    if (assessments.length === 0) {
        await prisma.supplier.update({
            where: { id: supplierId },
            data: { riskScore: 0 },
        });
        return;
    }

    // Risk level weights
    const riskWeights: Record<RiskLevel, number> = {
        LOW: 25,
        MEDIUM: 50,
        HIGH: 75,
        CRITICAL: 100,
    };

    // Category weights (some risks are more critical)
    const categoryWeights: Record<RiskCategory, number> = {
        FINANCIAL: 1.5,
        COMPLIANCE: 1.3,
        QUALITY: 1.2,
        DELIVERY: 1.0,
        OPERATIONAL: 1.0,
        GEOPOLITICAL: 0.8,
    };

    let totalWeightedRisk = 0;
    let totalWeight = 0;

    assessments.forEach((a) => {
        const riskValue = riskWeights[a.riskLevel];
        const weight = categoryWeights[a.riskCategory];
        totalWeightedRisk += riskValue * weight;
        totalWeight += weight;
    });

    const riskScore = totalWeight > 0 ? totalWeightedRisk / totalWeight : 0;

    await prisma.supplier.update({
        where: { id: supplierId },
        data: { riskScore },
    });
}

/**
 * Get active risk assessments for a supplier
 */
export async function getActiveRisks(supplierId: string) {
    return prisma.supplierRiskAssessment.findMany({
        where: {
            supplierId,
            status: 'ACTIVE',
        },
        include: {
            assessor: { select: { name: true } },
        },
        orderBy: [{ riskLevel: 'desc' }, { assessedAt: 'desc' }],
    });
}

/**
 * Get all risk assessments (including historical)
 */
export async function getAllRisks(supplierId: string) {
    return prisma.supplierRiskAssessment.findMany({
        where: { supplierId },
        include: {
            assessor: { select: { name: true } },
        },
        orderBy: { assessedAt: 'desc' },
    });
}

/**
 * Update risk assessment status
 */
export async function updateRiskStatus(
    assessmentId: string,
    userId: string,
    status: 'ACTIVE' | 'MITIGATED' | 'CLOSED',
    notes?: string
) {
    const assessment = await prisma.supplierRiskAssessment.update({
        where: { id: assessmentId },
        data: {
            status,
            ...(notes && { notes }),
        },
    });

    await recordAuditLog('supplier.risk.update', {
        userId,
        entityType: 'SupplierRiskAssessment',
        entityId: assessmentId,
        metadata: { status },
    });

    await updateSupplierRiskScore(assessment.supplierId);

    return assessment;
}

/**
 * Get risk summary by category
 */
export async function getRiskSummary(supplierId: string) {
    const risks = await getActiveRisks(supplierId);

    const byCategoryAndLevel: Record<RiskCategory, Record<RiskLevel, number>> = {
        FINANCIAL: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        OPERATIONAL: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        COMPLIANCE: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        QUALITY: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        DELIVERY: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        GEOPOLITICAL: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    };

    risks.forEach((risk) => {
        byCategoryAndLevel[risk.riskCategory][risk.riskLevel]++;
    });

    const overallRiskLevel =
        risks.some((r) => r.riskLevel === 'CRITICAL')
            ? 'CRITICAL'
            : risks.some((r) => r.riskLevel === 'HIGH')
                ? 'HIGH'
                : risks.some((r) => r.riskLevel === 'MEDIUM')
                    ? 'MEDIUM'
                    : 'LOW';

    return {
        totalActiveRisks: risks.length,
        overallRiskLevel,
        byCategoryAndLevel,
        criticalRisks: risks.filter((r) => r.riskLevel === 'CRITICAL'),
    };
}

/**
 * Get suppliers due for risk review
 */
export async function getSuppliersForRiskReview() {
    const today = new Date();

    return prisma.supplierRiskAssessment.findMany({
        where: {
            status: 'ACTIVE',
            reviewDate: {
                lte: today,
                not: null,
            },
        },
        include: {
            supplier: { select: { id: true, name: true } },
            assessor: { select: { name: true } },
        },
        orderBy: { reviewDate: 'asc' },
    });
}
