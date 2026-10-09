import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as searchService from './search.service';

export const searchRouter = Router();

// Global search endpoint
searchRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q, limit } = req.query;

        if (!q || typeof q !== 'string') {
            return res.json({ results: [] });
        }

        const limitNum = limit ? parseInt(limit as string) : 20;
        const results = await searchService.globalSearch(q, limitNum);

        return res.json({ results, query: q });
    } catch (e) {
        return next(e);
    }
});
