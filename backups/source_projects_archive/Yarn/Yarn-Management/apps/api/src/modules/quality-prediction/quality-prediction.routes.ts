import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as qualityPredictionController from './quality-prediction.controller';

export const qualityPredictionRouter = Router();

// Predict quality for incoming material from a supplier
qualityPredictionRouter.get(
    '/predictions/material/:supplierId',
    authenticate,
    qualityPredictionController.predictMaterialQuality
);

// Predict quality/risk for a specific production batch
qualityPredictionRouter.get(
    '/predictions/batch/:batchId',
    authenticate,
    qualityPredictionController.predictBatchQuality
);

// Get all active predictive alerts
qualityPredictionRouter.get(
    '/predictions/alerts',
    authenticate,
    qualityPredictionController.getPredictiveAlerts
);
