import { prisma } from '../../prisma/client';

export class QualityPredictionService {

    /**
     * Predict quality score (0-100) for incoming raw material from a supplier.
     * Logic: Weighted average of Supplier's avgQualityRating and their historical RawMaterial scores.
     */
    async predictMaterialQuality(supplierId: string, materialType: string): Promise<any> {
        // 1. Get Supplier Performance
        const performance = await prisma.supplierPerformance.findUnique({
            where: { supplierId },
        });

        // 2. Get historical material data
        const historicalMaterials = await prisma.rawMaterial.findMany({
            where: { supplierId, materialType },
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { qualityScore: true }
        });

        // Calculate baseline from performance
        const baseScore = performance?.avgQualityRating ? Number(performance.avgQualityRating) * 20 : 85; // 0-5 scale to 0-100

        // Calculate historical average
        let historicalAvg = baseScore;
        if (historicalMaterials.length > 0) {
            const sum = historicalMaterials.reduce((acc, curr) => acc + Number(curr.qualityScore), 0);
            historicalAvg = sum / historicalMaterials.length;
        }

        // Weighted Prediction: 40% Supplier Rating, 60% Item History
        const predictedScore = (baseScore * 0.4) + (historicalAvg * 0.6);

        return {
            supplierId,
            materialType,
            predictedScore: Math.round(predictedScore * 100) / 100,
            confidenceLevel: historicalMaterials.length > 5 ? 'HIGH' : 'MEDIUM', // More history = higher confidence
            factors: {
                supplierRating: Number(performance?.avgQualityRating || 0),
                historicalBatchesAnalyzed: historicalMaterials.length
            }
        };
    }

    /**
     * Predict quality for a production batch.
     * Logic: Input Material Score (70%) + Machine/Process Factor (30%)
     */
    async predictBatchQuality(batchId: string): Promise<any> {
        const batch = await prisma.productionBatch.findUnique({
            where: { id: batchId },
            include: {
                rawMaterial: true,
                machine: true
            }
        });

        if (!batch) throw new Error('Batch not found');

        const inputQuality = Number(batch.rawMaterial.qualityScore) || 90; // Default to 90 if no score

        // Machine reliability (Mock logic: newer machines are better? No, let's just assume 95% efficiency for now)
        // In real ML, this would analyze machine maintenance logs and downtime.
        const machineReliability = 95;

        // Prediction formula
        const predictedScore = (inputQuality * 0.7) + (machineReliability * 0.3);

        return {
            batchId,
            predictedScore: Math.round(predictedScore * 100) / 100,
            riskLevel: this.calculateRiskLevel(predictedScore),
            inputQuality,
            machineFactor: machineReliability
        };
    }

    /**
     * Assess defect risk
     */
    async predictDefectRisk(batchId: string): Promise<any> {
        const prediction = await this.predictBatchQuality(batchId);
        const score = prediction.predictedScore;

        const possibleDefects = [];
        if (score < 80) possibleDefects.push('Unevenness');
        if (score < 70) possibleDefects.push('Tenacity Loss');
        if (prediction.inputQuality < 80) possibleDefects.push('Raw Material Contamination');

        return {
            batchId,
            predictedQualityScore: score,
            riskLevel: prediction.riskLevel,
            possibleDefects,
            recommendation: this.getRecommendation(prediction.riskLevel)
        };
    }

    /**
     * Get active alerts for currently processing batches
     */
    async getPredictiveAlerts(): Promise<any[]> {
        const activeBatches = await prisma.productionBatch.findMany({
            where: { status: 'IN_PROGRESS' },
            include: { rawMaterial: true }
        });

        const alerts = [];
        for (const batch of activeBatches) {
            const prediction = await this.predictBatchQuality(batch.id);
            if (prediction.riskLevel === 'HIGH' || prediction.riskLevel === 'MEDIUM') {
                alerts.push({
                    id: batch.id,
                    batchNumber: batch.batchNumber, // Changed from id to number for display if possible, checking schema... batchNumber exists.
                    predictedScore: prediction.predictedScore,
                    riskLevel: prediction.riskLevel,
                    timestamp: new Date()
                });
            }
        }
        return alerts;
    }

    private calculateRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
        if (score < 75) return 'HIGH';
        if (score < 90) return 'MEDIUM';
        return 'LOW';
    }

    private getRecommendation(risk: string): string {
        switch (risk) {
            case 'HIGH': return 'STOP PRODUCTION IMMEDIATELY. Inspect Raw Material and Machine settings.';
            case 'MEDIUM': return 'Proceed with caution. Increase sampling frequency.';
            default: return 'Process is stable. Standard sampling.';
        }
    }
}
