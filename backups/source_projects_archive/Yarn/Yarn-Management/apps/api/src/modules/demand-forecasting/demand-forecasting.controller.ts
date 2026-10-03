import { Request, Response } from 'express';
import { demandForecastingService } from './demand-forecasting.service';
import { MarketIntelligenceService } from './market-intelligence.service';

export class DemandForecastingController {
    async getForecasts(req: Request, res: Response) {
        try {
            const forecasts = await demandForecastingService.getForecasts();
            res.json(forecasts);
        } catch (error) {
            console.error('Error fetching forecasts:', error);
            res.status(500).json({ error: 'Failed to fetch forecasts' });
        }
    }

    async generateForecasts(req: Request, res: Response) {
        try {
            const result = await demandForecastingService.generateForecasts();
            res.json({ message: 'Forecasts generated successfully', count: result.length, data: result });
        } catch (error) {
            console.error('Error generating forecasts:', error);
            res.status(500).json({ error: 'Failed to generate forecasts' });
        }
    }

    async getNews(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const news = await MarketIntelligenceService.getCuratedInsights(userId);
            res.json(news);
        } catch (error) {
            console.error('Error fetching news:', error);
            res.status(500).json({ error: 'Failed to fetch news' });
        }
    }

    async getHistoricalData(req: Request, res: Response) {
        try {
            const data = await demandForecastingService.getHistoricalData();
            res.json(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            res.status(500).json({ error: 'Failed to fetch historical data' });
        }
    }
}

export const demandForecastingController = new DemandForecastingController();
