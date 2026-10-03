import { Router } from 'express';
import * as documentService from './document.service';

const router = Router();

// Folder routes
router.post('/folders', async (req, res) => {
    try {
        const folder = await documentService.createFolder(req.body);
        res.status(201).json({ folder });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/folders', async (req, res) => {
    try {
        const { parentId } = req.query;
        const folders = await documentService.listFolders(parentId as string);
        res.json({ folders });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/folders/:id', async (req, res) => {
    try {
        const folder = await documentService.getFolderById(req.params.id);
        if (!folder) return res.status(404).json({ error: 'Folder not found' });
        res.json({ folder });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Document routes
router.post('/documents', async (req, res) => {
    try {
        const document = await documentService.createDocument(req.body);
        res.status(201).json({ document });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/documents', async (req, res) => {
    try {
        const documents = await documentService.listDocuments(req.query);
        res.json({ documents });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/documents/:id', async (req, res) => {
    try {
        const document = await documentService.getDocumentById(req.params.id);
        if (!document) return res.status(404).json({ error: 'Document not found' });
        res.json({ document });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/documents/:id', async (req, res) => {
    try {
        const document = await documentService.updateDocument(req.params.id, req.body);
        res.json({ document });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/documents/:id', async (req, res) => {
    try {
        await documentService.deleteDocument(req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Version routes
router.post('/documents/:id/versions', async (req, res) => {
    try {
        const version = await documentService.uploadDocumentVersion(req.params.id, req.body);
        res.status(201).json({ version });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/documents/:id/versions/:versionNumber', async (req, res) => {
    try {
        const version = await documentService.getDocumentVersion(
            req.params.id,
            parseInt(req.params.versionNumber)
        );
        if (!version) return res.status(404).json({ error: 'Version not found' });
        res.json({ version });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Stats route
router.get('/stats', async (req, res) => {
    try {
        const stats = await documentService.getDocumentStats();
        res.json({ stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
