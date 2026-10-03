import { prisma } from '../../prisma/client';

export class DemandForecastingService {
    /**
     * Generates demand forecasts for the next month based on historical invoice data.
     * Uses a Simple Moving Average (SMA) augmented by Seasonality and Market Trends.
     */
    async generateForecasts() {
        // 1. Get invoices from last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const invoices = await prisma.invoice.findMany({
            where: {
                date: { gte: sixMonthsAgo },
                status: { in: ['PAID', 'PENDING'] }
            },
            include: { items: true }
        });

        // 2. Aggregate sales by product (description) and month
        const salesHistory: Record<string, Record<string, number>> = {};

        invoices.forEach(inv => {
            const monthKey = `${inv.date.getFullYear()}-${inv.date.getMonth() + 1}`;
            inv.items.forEach(item => {
                const product = item.description;
                if (!salesHistory[product]) salesHistory[product] = {};
                if (!salesHistory[product][monthKey]) salesHistory[product][monthKey] = 0;
                salesHistory[product][monthKey] += Number(item.quantity);
            });
        });

        // 3. Simple Moving Average (SMA) Forecast
        const forecasts: any[] = [];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const forecastMonth = nextMonth.getMonth() + 1;
        const forecastYear = nextMonth.getFullYear();

        for (const [product, history] of Object.entries(salesHistory)) {
            const quantities = Object.values(history);
            if (quantities.length === 0) continue;

            const sum = quantities.reduce((a, b) => a + b, 0);
            const avg = sum / quantities.length; // SMA Base

            // 4. Apply Seasonality
            const seasonality = await prisma.seasonalityIndex.findUnique({
                where: {
                    month_productType: { month: forecastMonth, productType: product }
                }
            });
            const seasonalMultiplier = seasonality ? Number(seasonality.multiplier) : 1.0;

            // 5. Apply Market Factors (Simplified: Average of 'Yarn Demand' category trends)
            const marketTrends = await prisma.marketTrend.findMany({
                where: { category: 'Yarn Demand' }
            });

            let marketMultiplier = 1.0;
            if (marketTrends.length > 0) {
                // Weighted average based on confidence
                let totalWeightedValue = 0;
                let totalConfidence = 0;
                marketTrends.forEach(trend => {
                    const weight = Number(trend.confidence);
                    totalWeightedValue += Number(trend.trendValue) * weight;
                    totalConfidence += weight;
                });
                if (totalConfidence > 0) {
                    marketMultiplier = totalWeightedValue / totalConfidence;
                }
            }

            const finalForecastValue = avg * seasonalMultiplier * marketMultiplier;

            // Store forecast
            const forecast = await prisma.demandForecast.upsert({
                where: {
                    month_year_productType: {
                        month: forecastMonth,
                        year: forecastYear,
                        productType: product
                    }
                },
                update: {
                    forecastedQuantity: finalForecastValue,
                    marketAdjustmentFactor: marketMultiplier,
                    confidenceLevel: 80
                },
                create: {
                    month: forecastMonth,
                    year: forecastYear,
                    productType: product,
                    forecastedQuantity: finalForecastValue,
                    marketAdjustmentFactor: marketMultiplier,
                    confidenceLevel: 80
                }
            });
            forecasts.push(forecast);
        }
        return forecasts;
    }

    async getForecasts() {
        return prisma.demandForecast.findMany({
            orderBy: [{ year: 'asc' }, { month: 'asc' }]
        });
    }

    async getHistoricalData() {
        // Helper to return historical aggregated data for charts
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const invoices = await prisma.invoice.findMany({
            where: {
                date: { gte: sixMonthsAgo },
                status: { in: ['PAID', 'PENDING'] }
            },
            include: { items: true }
        });

        const result: any[] = [];
        const map: Record<string, any> = {};

        // Aggregate by Month-Product
        invoices.forEach(inv => {
            const m = inv.date.getMonth() + 1;
            const y = inv.date.getFullYear();
            const key = `${y}-${m}`;

            inv.items.forEach(item => {
                const compositeKey = `${key}-${item.description}`;
                if (!map[compositeKey]) {
                    map[compositeKey] = {
                        month: m,
                        year: y,
                        productType: item.description,
                        quantity: 0
                    }
                }
                map[compositeKey].quantity += Number(item.quantity);
            });
        });

        return Object.values(map);
    }
}

export const demandForecastingService = new DemandForecastingService();
