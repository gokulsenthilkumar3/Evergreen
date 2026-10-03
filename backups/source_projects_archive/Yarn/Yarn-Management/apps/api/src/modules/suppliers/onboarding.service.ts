import { prisma } from '../../prisma/client';
import { recordAuditLog } from '../../utils/audit';

/**
 * Supplier Onboarding Service
 * Handles multi-step onboarding workflow
 */

export interface OnboardingStepData {
    step: number;
    data: Record<string, any>;
}

/**
 * Update supplier onboarding step
 */
export async function updateOnboardingStep(
    supplierId: string,
    stepNumber: number,
    stepData: Record<string, any>,
    userId?: string
) {
    const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        select: { id: true, onboardingStatus: true, onboardingStep: true }
    });

    if (!supplier) {
        const err: any = new Error('Supplier not found');
        err.status = 404;
        throw err;
    }

    // Update supplier with step data
    const updated = await prisma.supplier.update({
        where: { id: supplierId },
        data: {
            ...stepData,
            onboardingStep: stepNumber,
            lastModifiedBy: userId,
            lastModifiedDate: new Date()
        }
    });

    await recordAuditLog('SUPPLIER_ONBOARDING_STEP_UPDATED', {
        userId,
        metadata: {
            supplierId,
            step: stepNumber,
            status: supplier.onboardingStatus
        }
    });

    return updated;
}

/**
 * Submit supplier for approval
 */
export async function submitForApproval(supplierId: string, userId?: string) {
    const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        include: { documents: true, account: true }
    });

    if (!supplier) {
        const err: any = new Error('Supplier not found');
        err.status = 404;
        throw err;
    }

    // Validate required fields
    const errors: string[] = [];

    if (!supplier.name) errors.push('Supplier name is required');
    if (!supplier.email) errors.push('Email is required');
    if (!supplier.phone) errors.push('Phone is required');
    if (!supplier.businessType) errors.push('Business type is required');
    if (!supplier.supplierType) errors.push('Supplier type is required');

    // Check for required documents
    const requiredDocTypes = ['GST_CERTIFICATE', 'PAN_CARD', 'BANK_PROOF'];
    const uploadedTypes = supplier.documents.map(d => d.type);
    const missingDocs = requiredDocTypes.filter(type => !uploadedTypes.includes(type));

    if (missingDocs.length > 0) {
        errors.push(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    if (errors.length > 0) {
        const err: any = new Error('Validation failed');
        err.status = 400;
        err.errors = errors;
        throw err;
    }

    // Update status to submitted
    const updated = await prisma.supplier.update({
        where: { id: supplierId },
        data: {
            onboardingStatus: 'SUBMITTED',
            lastModifiedBy: userId,
            lastModifiedDate: new Date()
        }
    });

    await recordAuditLog('SUPPLIER_SUBMITTED_FOR_APPROVAL', {
        userId,
        metadata: { supplierId, supplierName: supplier.name }
    });

    // TODO: Send notification to admins for approval

    return updated;
}

/**
 * Approve supplier onboarding
 */
export async function approveSupplier(
    supplierId: string,
    approvedBy: string,
    comments?: string
) {
    const updated = await prisma.supplier.update({
        where: { id: supplierId },
        data: {
            onboardingStatus: 'APPROVED',
            status: 'Active',
            approvedBy,
            approvalDate: new Date(),
            lastModifiedBy: approvedBy,
            lastModifiedDate: new Date()
        }
    });

    await recordAuditLog('SUPPLIER_APPROVED', {
        userId: approvedBy,
        metadata: {
            supplierId,
            supplierName: updated.name,
            comments
        }
    });

    // TODO: Send notification to supplier

    return updated;
}

/**
 * Reject supplier onboarding
 */
export async function rejectSupplier(
    supplierId: string,
    rejectedBy: string,
    reason: string
) {
    const updated = await prisma.supplier.update({
        where: { id: supplierId },
        data: {
            onboardingStatus: 'REJECTED',
            status: 'Inactive',
            lastModifiedBy: rejectedBy,
            lastModifiedDate: new Date(),
            notes: reason
        }
    });

    await recordAuditLog('SUPPLIER_REJECTED', {
        userId: rejectedBy,
        metadata: {
            supplierId,
            supplierName: updated.name,
            reason
        }
    });

    // TODO: Send notification to supplier

    return updated;
}

/**
 * Get onboarding progress
 */
export async function getOnboardingProgress(supplierId: string) {
    const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        include: {
            documents: true,
            account: true
        }
    });

    if (!supplier) {
        const err: any = new Error('Supplier not found');
        err.status = 404;
        throw err;
    }

    // Calculate completion percentage
    const steps = [
        {
            step: 1,
            name: 'Basic Information',
            completed: !!(supplier.name && supplier.email && supplier.phone && supplier.businessType)
        },
        {
            step: 2,
            name: 'Documents',
            completed: supplier.documents.length >= 3
        },
        {
            step: 3,
            name: 'Bank Details',
            completed: !!(supplier.account?.bankAccountNumber && supplier.account?.bankIfscCode)
        },
        {
            step: 4,
            name: 'Review',
            completed: supplier.onboardingStatus !== 'DRAFT'
        }
    ];

    const completedSteps = steps.filter(s => s.completed).length;
    const progress = Math.round((completedSteps / steps.length) * 100);

    return {
        supplier,
        steps,
        currentStep: supplier.onboardingStep || 1,
        progress,
        status: supplier.onboardingStatus
    };
}
