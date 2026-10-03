import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../../../lib/http';
import { useNotification } from '../../../context/NotificationContext';
import './SupplierPerformanceDashboard.css';
import PerformanceTrendChart from './components/PerformanceTrendChart';
import RiskAssessmentPanel from './components/RiskAssessmentPanel';

interface PerformanceMetric {
    id: string;
    metricType: string;
    value: number;
    weight: number;
    recordedAt: string;
}

interface RatingStats {
    average: number;
    total: number;
    distribution: { [key: number]: number };
}

interface Supplier {
    id: string;
    name: string;
    performanceScore: number;
    riskScore: number;
    lastPerformanceUpdate: string;
    rating: number;
}

const METRIC_ICONS: Record<string, string> = {
    ON_TIME_DELIVERY: '🚚',
    QUALITY_SCORE: '⭐',
    PRICE_COMPETITIVENESS: '💰',
    RESPONSIVENESS: '⚡',
    ORDER_ACCURACY: '✓',
    DEFECT_RATE: '⚠️',
    LEAD_TIME_ADHERENCE: '⏱️',
    COMPLIANCE: '📋',
};

const METRIC_LABELS: Record<string, string> = {
    ON_TIME_DELIVERY: 'On-Time Delivery',
    QUALITY_SCORE: 'Quality Score',
    PRICE_COMPETITIVENESS: 'Price Competitiveness',
    RESPONSIVENESS: 'Responsiveness',
    ORDER_ACCURACY: 'Order Accuracy',
    DEFECT_RATE: 'Defect Rate',
    LEAD_TIME_ADHERENCE: 'Lead Time',
    COMPLIANCE: 'Compliance',
};

export const SupplierPerformanceDashboard: React.FC = () => {
    const { supplierId } = useParams<{ supplierId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (supplierId) {
            fetchData();
        }
    }, [supplierId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [supplierRes, metricsRes, ratingsRes] = await Promise.all([
                http.get(`/suppliers/${supplierId}`),
                http.get(`/suppliers/performance/${supplierId}/metrics/trends?days=30`),
                http.get(`/suppliers/performance/${supplierId}/ratings/statistics`),
            ]);

            setSupplier(supplierRes.data.supplier);
            setMetrics(metricsRes.data.trends);
            setRatingStats(ratingsRes.data.statistics);
        } catch (error: any) {
            showError(error.response?.data?.message || 'Failed to load performance data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMetrics = async () => {
        try {
            await http.post(`/suppliers/performance/${supplierId}/metrics/update-all`);
            showSuccess('Performance metrics updated successfully');
            fetchData();
        } catch (error: any) {
            showError(error.response?.data?.message || 'Failed to update metrics');
        }
    };

    const getLatestMetricValue = (metricType: string): number | null => {
        const metric = metrics.find((m) => m.metricType === metricType);
        return metric ? metric.value : null;
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getRiskColor = (riskScore: number): string => {
        if (riskScore >= 75) return '#ef4444';
        if (riskScore >= 50) return '#f59e0b';
        if (riskScore >= 25) return '#eab308';
        return '#10b981';
    };

    if (loading) {
        return <div className="performance-loading">Loading performance data...</div>;
    }

    if (!supplier) {
        return <div className="performance-error">Supplier not found</div>;
    }

    const performanceScore = supplier.performanceScore || 0;
    const riskScore = supplier.riskScore || 0;

    return (
        <div className="supplier-performance-dashboard">
            <div className="performance-header">
                <div>
                    <h1>{supplier.name}</h1>
                    <p className="subtitle">Supplier Performance Overview</p>
                </div>
                <div className="header-actions">
                    <button onClick={handleUpdateMetrics} className="btn btn-primary">
                        Update Metrics
                    </button>
                    <button onClick={() => navigate(`/suppliers/${supplierId}`)} className="btn btn-secondary">
                        Back to Supplier
                    </button>
                </div>
            </div>

            <div className="performance-overview">
                <div className="overview-card performance-card">
                    <h3>Performance Score</h3>
                    <div className="score-gauge">
                        <div className="score-value" style={{ color: getScoreColor(performanceScore) }}>
                            {performanceScore.toFixed(1)}
                        </div>
                        <div className="score-label">/ 100</div>
                    </div>
                    <div className="score-bar">
                        <div
                            className="score-fill"
                            style={{ width: `${performanceScore}%`, backgroundColor: getScoreColor(performanceScore) }}
                        />
                    </div>
                    <p className="last-updated">
                        Last updated: {supplier.lastPerformanceUpdate ? new Date(supplier.lastPerformanceUpdate).toLocaleDateString() : 'Never'}
                    </p>
                </div>

                <div className="overview-card risk-card">
                    <h3>Risk Score</h3>
                    <div className="score-gauge">
                        <div className="score-value" style={{ color: getRiskColor(riskScore) }}>
                            {riskScore.toFixed(1)}
                        </div>
                        <div className="score-label">/ 100</div>
                    </div>
                    <div className="score-bar">
                        <div
                            className="score-fill"
                            style={{ width: `${riskScore}%`, backgroundColor: getRiskColor(riskScore) }}
                        />
                    </div>
                    <p className="risk-level">
                        {riskScore >= 75 ? 'Critical' : riskScore >= 50 ? 'High' : riskScore >= 25 ? 'Medium' : 'Low'} Risk
                    </p>
                </div>

                <div className="overview-card rating-card">
                    <h3>Average Rating</h3>
                    <div className="rating-display">
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= (ratingStats?.average || 0) ? 'star filled' : 'star'}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <div className="rating-value">{ratingStats?.average.toFixed(1) || '0.0'}</div>
                    </div>
                    <p className="rating-count">{ratingStats?.total || 0} ratings</p>
                </div>
            </div>

            <div className="metrics-grid">
                <h2>Performance Metrics</h2>
                <div className="metrics-cards">
                    {Object.keys(METRIC_LABELS).map((metricType) => {
                        const value = getLatestMetricValue(metricType);
                        return (
                            <div key={metricType} className="metric-card">
                                <div className="metric-icon">{METRIC_ICONS[metricType]}</div>
                                <div className="metric-label">{METRIC_LABELS[metricType]}</div>
                                <div className="metric-value" style={{ color: value ? getScoreColor(value) : '#6b7280' }}>
                                    {value !== null ? `${value.toFixed(1)}%` : 'N/A'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <PerformanceTrendChart supplierId={supplierId!} />

            <RiskAssessmentPanel supplierId={supplierId!} />

            {ratingStats && ratingStats.total > 0 && (
                <div className="ratings-section">
                    <h2>Rating Distribution</h2>
                    <div className="rating-distribution">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingStats.distribution[star] || 0;
                            const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
                            return (
                                <div key={star} className="distribution-row">
                                    <span className="star-label">{star} ★</span>
                                    <div className="distribution-bar">
                                        <div className="distribution-fill" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <span className="distribution-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierPerformanceDashboard;
