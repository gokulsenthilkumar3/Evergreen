import { prisma } from '../../prisma/client';
import { recordAuditLog } from '../../utils/audit';
import path from 'path';
import fs from 'fs/promises';

/**
 * Document Service
 * Handles supplier document uploads and verification
 */

export interface DocumentUpload {
    supplierId: string;
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    expiryDate?: Date;
}

/**
 * Upload supplier document
 */
export async function uploadDocument(
    data: DocumentUpload,
    userId?: string
) {
    const document = await prisma.supplierDocument.create({
        data: {
            supplierId: data.supplierId,
            type: data.type,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
            expiryDate: data.expiryDate,
            status: 'PENDING'
        }
    });

    await recordAuditLog('SUPPLIER_DOCUMENT_UPLOADED', {
        userId,
        metadata: {
            supplierId: data.supplierId,
            documentId: document.id,
            documentType: data.type
        }
    });

    return document;
}

/**
 * Get supplier documents
 */
export async function getSupplierDocuments(supplierId: string) {
    return prisma.supplierDocument.findMany({
        where: { supplierId },
        orderBy: { uploadedAt: 'desc' }
    });
}

/**
 * Verify document
 */
export async function verifyDocument(
    documentId: string,
    verifiedBy: string,
    notes?: string
) {
    const document = await prisma.supplierDocument.update({
        where: { id: documentId },
        data: {
            status: 'VERIFIED',
            verifiedBy,
            verifiedAt: new Date(),
            notes
        }
    });

    await recordAuditLog('SUPPLIER_DOCUMENT_VERIFIED', {
        userId: verifiedBy,
        metadata: {
            documentId,
            documentType: document.type,
            supplierId: document.supplierId
        }
    });

    return document;
}

/**
 * Reject document
 */
export async function rejectDocument(
    documentId: string,
    rejectedBy: string,
    reason: string
) {
    const document = await prisma.supplierDocument.update({
        where: { id: documentId },
        data: {
            status: 'REJECTED',
            verifiedBy: rejectedBy,
            verifiedAt: new Date(),
            rejectionReason: reason
        }
    });

    await recordAuditLog('SUPPLIER_DOCUMENT_REJECTED', {
        userId: rejectedBy,
        metadata: {
            documentId,
            documentType: document.type,
            supplierId: document.supplierId,
            reason
        }
    });

    return document;
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: string, userId?: string) {
    const document = await prisma.supplierDocument.findUnique({
        where: { id: documentId }
    });

    if (!document) {
        const err: any = new Error('Document not found');
        err.status = 404;
        throw err;
    }

    // Delete file from storage
    try {
        const filePath = path.join(process.cwd(), document.fileUrl);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Failed to delete file:', error);
        // Continue with database deletion even if file deletion fails
    }

    await prisma.supplierDocument.delete({
        where: { id: documentId }
    });

    await recordAuditLog('SUPPLIER_DOCUMENT_DELETED', {
        userId,
        metadata: {
            documentId,
            documentType: document.type,
            supplierId: document.supplierId
        }
    });

    return { success: true };
}

/**
 * Check for expiring documents
 */
export async function getExpiringDocuments(daysThreshold: number = 30) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return prisma.supplierDocument.findMany({
        where: {
            expiryDate: {
                lte: thresholdDate,
                gte: new Date()
            },
            status: 'VERIFIED'
        },
        include: {
            supplier: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { expiryDate: 'asc' }
    });
}
