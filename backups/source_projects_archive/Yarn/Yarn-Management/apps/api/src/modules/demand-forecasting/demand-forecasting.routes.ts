import { Router } from 'express';
import { demandForecastingController } from './demand-forecasting.controller';

const router = Router();

router.get('/', demandForecastingController.getForecasts);
router.get('/news', demandForecastingController.getNews);
router.post('/generate', demandForecastingController.generateForecasts);
router.get('/history', demandForecastingController.getHistoricalData);

export const demandForecastingRouter = router;
