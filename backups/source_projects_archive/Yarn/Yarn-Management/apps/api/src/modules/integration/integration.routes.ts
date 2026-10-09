import { Router, Request, Response, NextFunction } from 'express';
import { integrationService } from './integration.service';
import { authenticate } from '../../middleware/authenticate';

export const integrationRouter = Router();

// Get all integration configurations
integrationRouter.get('/configs', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configs = await integrationService.getAllConfigs();
        // Mask credentials in response
        const safeConfigs = configs.map(c => ({
            ...c,
            credentials: c.credentials ? '******' : null
        }));
        res.json(safeConfigs);
    } catch (error) {
        next(error);
    }
});

// Configure/Connect an integration
integrationRouter.post('/connect', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { provider, name, credentials, settings } = req.body;
        const config = await integrationService.upsertConfig(provider, name, credentials, settings);
        res.json(config);
    } catch (error) {
        next(error);
    }
});

// Toggle enable/disable
integrationRouter.patch('/:id/toggle', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { isEnabled } = req.body;
        const config = await integrationService.toggleIntegration(req.params.id, isEnabled);
        res.json(config);
    } catch (error) {
        next(error);
    }
});

// Trigger manual sync
integrationRouter.post('/:id/sync', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType } = req.body;
        const result = await integrationService.triggerSync(req.params.id, entityType);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get sync logs
integrationRouter.get('/:id/logs', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logs = await integrationService.getSyncLogs(req.params.id);
        res.json(logs);
    } catch (error) {
        next(error);
    }
});
