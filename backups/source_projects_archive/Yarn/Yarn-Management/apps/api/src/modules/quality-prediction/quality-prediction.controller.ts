import { Request, Response, NextFunction } from 'express';
import { QualityPredictionService } from './quality-prediction.service';

const service = new QualityPredictionService();

export async function predictMaterialQuality(req: Request, res: Response, next: NextFunction) {
    try {
        const { supplierId } = req.params;
        const { materialType } = req.query;

        if (!materialType) {
            return res.status(400).json({ message: 'materialType query parameter is required' });
        }

        const result = await service.predictMaterialQuality(supplierId, String(materialType));
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function predictBatchQuality(req: Request, res: Response, next: NextFunction) {
    try {
        const { batchId } = req.params;
        const result = await service.predictDefectRisk(batchId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getPredictiveAlerts(req: Request, res: Response, next: NextFunction) {
    try {
        const alerts = await service.getPredictiveAlerts();
        res.json({ alerts });
    } catch (error) {
        next(error);
    }
}
