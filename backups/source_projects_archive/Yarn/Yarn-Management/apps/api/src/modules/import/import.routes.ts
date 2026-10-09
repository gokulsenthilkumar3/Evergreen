import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { handleSupplierImport, handleRawMaterialImport } from './import.service';
import { authenticate } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/requirePermission';
import { blankTemplate, IMPORT_COLUMNS, type ImportKind } from './import.columns';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!/\.(csv|xlsx|xls)$/i.test(file.originalname)) return callback(new Error('Only CSV or Excel files are accepted'));
    callback(null, true);
  },
});

function uploadFile(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (error: unknown) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File exceeds the 2 MB import limit' });
    }
    return res.status(415).json({ message: error instanceof Error ? error.message : 'Invalid import file' });
  });
}

function template(kind: ImportKind) {
  return (req: import('express').Request, res: import('express').Response) => {
    if (req.query.format === 'json') return res.json({ columns: IMPORT_COLUMNS[kind] });
    res.type('text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${kind}-template.csv"`);
    return res.send(blankTemplate(kind));
  };
}

router.get('/suppliers/import/template', authenticate, requirePermission('suppliers.create'), template('suppliers'));
router.get('/raw-materials/import/template', authenticate, requirePermission('raw-materials.create'), template('raw-materials'));
router.post('/suppliers/import', authenticate, requirePermission('suppliers.create'), uploadFile, handleSupplierImport);
router.post('/raw-materials/import', authenticate, requirePermission('raw-materials.create'), uploadFile, handleRawMaterialImport);

export default router;
