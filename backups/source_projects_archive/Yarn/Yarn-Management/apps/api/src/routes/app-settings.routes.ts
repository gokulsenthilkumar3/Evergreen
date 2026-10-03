import { Router, Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticate } from '../middleware/authenticate';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename and add timestamp
        const ext = path.extname(file.originalname);
        cb(null, `logo-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// POST /api/app-settings/logo - Upload logo
router.post('/logo', authenticate, upload.single('logo'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return relative URL
        const url = `/uploads/${req.file.filename}`;
        res.json({ url });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
});

// Default module settings
const DEFAULT_MODULES = {
    procurement: true,
    inventory: true,
    warehouse: true,
    manufacturing: true,
    quality: true,
    sales: true,
    customers: true,
    finance: true,
    hr: true,
    documents: true,
    communication: true,
    reports: true,
    integrations: true,
    developer: true,
};

// GET /api/app-settings - Get all app settings
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const settings = await prisma.appSettings.findMany({
            where: { key: { in: ['modules', 'general'] } }
        });

        const moduleSettings = settings.find(s => s.key === 'modules');
        const generalSettings = settings.find(s => s.key === 'general');

        if (!moduleSettings) {
            // Create default settings if not exists (lazy init)
            await prisma.appSettings.create({
                data: {
                    key: 'modules',
                    value: DEFAULT_MODULES,
                    description: 'Module visibility settings',
                },
            });
        }

        res.json({
            modules: moduleSettings?.value || DEFAULT_MODULES,
            general: generalSettings?.value || { companyName: 'Yarn Management', taxId: '', adminEmail: '' },
        });
    } catch (error) {
        console.error('Error fetching app settings:', error);
        res.status(500).json({ error: 'Failed to fetch app settings' });
    }
});

// PUT /api/app-settings - Update app settings
router.put('/', authenticate, async (req: Request, res: Response) => {
    try {
        console.log('PUT /app-settings body:', req.body);
        const { modules, general } = req.body;
        const userId = (req as any).user?.id;

        const results: any = {};

        if (modules) {
            const updated = await prisma.appSettings.upsert({
                where: { key: 'modules' },
                update: { value: modules, updatedBy: userId },
                create: { key: 'modules', value: modules, description: 'Module visibility settings', updatedBy: userId },
            });
            results.modules = updated.value;
        }

        if (general) {
            const updated = await prisma.appSettings.upsert({
                where: { key: 'general' },
                update: { value: general, updatedBy: userId },
                create: { key: 'general', value: general, description: 'General application settings', updatedBy: userId },
            });
            results.general = updated.value;
        }

        res.json({ success: true, ...results });
    } catch (error) {
        console.error('Error updating app settings:', error);
        res.status(500).json({ error: 'Failed to update app settings' });
    }
});

// GET /api/app-settings/all - Get all settings (admin)
router.get('/all', authenticate, async (req: Request, res: Response) => {
    try {
        const settings = await prisma.appSettings.findMany({
            orderBy: { key: 'asc' },
        });

        res.json(settings);
    } catch (error) {
        console.error('Error fetching all settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

export default router;
