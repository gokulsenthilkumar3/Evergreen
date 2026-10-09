import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middleware/authenticate';
import {
    updateOnboardingStep,
    submitForApproval,
    approveSupplier,
    rejectSupplier,
    getOnboardingProgress
} from './onboarding.service';
import {
    uploadDocument,
    getSupplierDocuments,
    verifyDocument,
    rejectDocument,
    deleteDocument,
    getExpiringDocuments
} from './document.service';

export const onboardingRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/supplier-documents/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    }
});

/**
 * GET /api/suppliers/onboarding/:supplierId/progress
 * Get onboarding progress for a supplier
 */
onboardingRouter.get('/:supplierId/progress', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const progress = await getOnboardingProgress(supplierId);
        return res.json(progress);
    } catch (e) {
        return next(e);
    }
});

/**
 * PUT /api/suppliers/onboarding/:supplierId/step
 * Update onboarding step data
 */
const stepDataSchema = z.object({
    step: z.number().int().min(1).max(4),
    data: z.record(z.any())
});

onboardingRouter.put('/:supplierId/step', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const { step, data } = stepDataSchema.parse(req.body);

        const updated = await updateOnboardingStep(supplierId, step, data, req.userId);
        return res.json(updated);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/suppliers/onboarding/:supplierId/submit
 * Submit supplier for approval
 */
onboardingRouter.post('/:supplierId/submit', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const updated = await submitForApproval(supplierId, req.userId);
        return res.json(updated);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/suppliers/onboarding/:supplierId/approve
 * Approve supplier onboarding
 */
const approvalSchema = z.object({
    comments: z.string().optional()
});

onboardingRouter.post('/:supplierId/approve', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const { comments } = approvalSchema.parse(req.body);

        const updated = await approveSupplier(supplierId, req.userId!, comments);
        return res.json(updated);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/suppliers/onboarding/:supplierId/reject
 * Reject supplier onboarding
 */
const rejectionSchema = z.object({
    reason: z.string().min(1, 'Rejection reason is required')
});

onboardingRouter.post('/:supplierId/reject', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const { reason } = rejectionSchema.parse(req.body);

        const updated = await rejectSupplier(supplierId, req.userId!, reason);
        return res.json(updated);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/suppliers/onboarding/:supplierId/documents
 * Upload supplier document
 */
onboardingRouter.post('/:supplierId/documents', authenticate, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const { type, expiryDate } = req.body;

        if (!req.file) {
            const err: any = new Error('No file uploaded');
            err.status = 400;
            throw err;
        }

        const document = await uploadDocument({
            supplierId,
            type,
            fileName: req.file.originalname,
            fileUrl: `/uploads/supplier-documents/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined
        }, req.userId);

        return res.status(201).json(document);
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /api/suppliers/onboarding/:supplierId/documents
 * Get supplier documents
 */
onboardingRouter.get('/:supplierId/documents', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { supplierId } = req.params;
        const documents = await getSupplierDocuments(supplierId);
        return res.json(documents);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/suppliers/onboarding/documents/:documentId/verify
 * Verify a document
 */
const verifySchema = z.object({
    notes: z.string().optional()
});

onboardingRouter.post('/documents/:documentId/verify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const { notes } = verifySchema.parse(req.body);

        const document = await verifyDocument(documentId, req.userId!, notes);
        return res.json(document);
    } catch (e) {
        return next(e);
    }
});

/**
 * POST /api/suppliers/onboarding/documents/:documentId/reject
 * Reject a document
 */
const rejectDocSchema = z.object({
    reason: z.string().min(1, 'Rejection reason is required')
});

onboardingRouter.post('/documents/:documentId/reject', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const { reason } = rejectDocSchema.parse(req.body);

        const document = await rejectDocument(documentId, req.userId!, reason);
        return res.json(document);
    } catch (e) {
        return next(e);
    }
});

/**
 * DELETE /api/suppliers/onboarding/documents/:documentId
 * Delete a document
 */
onboardingRouter.delete('/documents/:documentId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { documentId } = req.params;
        const result = await deleteDocument(documentId, req.userId);
        return res.json(result);
    } catch (e) {
        return next(e);
    }
});

/**
 * GET /api/suppliers/onboarding/documents/expiring
 * Get expiring documents
 */
onboardingRouter.get('/documents/expiring', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 30;
        const documents = await getExpiringDocuments(days);
        return res.json(documents);
    } catch (e) {
        return next(e);
    }
});
