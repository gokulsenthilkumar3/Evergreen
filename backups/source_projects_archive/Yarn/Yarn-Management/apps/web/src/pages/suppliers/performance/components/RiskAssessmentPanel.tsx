import React, { useEffect, useState } from 'react';
import { http } from '../../../../lib/http';
import { useNotification } from '../../../../context/NotificationContext';
import './RiskAssessmentPanel.css';

interface RiskAssessment {
    id: string;
    riskCategory: string;
    riskLevel: string;
    description: string;
    mitigationPlan?: string;
    status: string;
    assessedAt: string;
    assessor: { name: string };
}

interface Props {
    supplierId: string;
}

const RISK_LEVEL_COLORS: Record<string, string> = {
    LOW: '#10b981',
    MEDIUM: '#eab308',
    HIGH: '#f59e0b',
    CRITICAL: '#ef4444',
};

const RiskAssessmentPanel: React.FC<Props> = ({ supplierId }) => {
    const [risks, setRisks] = useState<RiskAssessment[]>([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchRisks();
    }, [supplierId]);

    const fetchRisks = async () => {
        setLoading(true);
        try {
            const res = await http.get(`/suppliers/performance/${supplierId}/risks?activeOnly=true`);
            setRisks(res.data.risks);
        } catch (error: any) {
            showError(error.response?.data?.message || 'Failed to load risks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (assessmentId: string, status: string) => {
        try {
            await http.put(`/suppliers/performance/risks/${assessmentId}/status`, { status });
            showSuccess('Risk status updated');
            fetchRisks();
        } catch (error: any) {
            showError(error.response?.data?.message || 'Failed to update risk');
        }
    };

    const groupedRisks = risks.reduce((acc, risk) => {
        if (!acc[risk.riskLevel]) acc[risk.riskLevel] = [];
        acc[risk.riskLevel].push(risk);
        return acc;
    }, {} as Record<string, RiskAssessment[]>);

    const totalRisks = risks.length;
    const criticalCount = groupedRisks.CRITICAL?.length || 0;
    const highCount = groupedRisks.HIGH?.length || 0;

    return (
        <div className="risk-assessment-panel">
            <h2>Active Risk Assessments</h2>

            {totalRisks > 0 && (
                <div className="risk-summary-bar">
                    <div className="risk-summary-item">
                        <span className="risk-count critical">{criticalCount}</span>
                        <span className="risk-label">Critical</span>
                    </div>
                    <div className="risk-summary-item">
                        <span className="risk-count high">{highCount}</span>
                        <span className="risk-label">High</span>
                    </div>
                    <div className="risk-summary-item">
                        <span className="risk-count total">{totalRisks}</span>
                        <span className="risk-label">Total</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="risk-loading">Loading risk assessments...</div>
            ) : risks.length === 0 ? (
                <div className="no-risks">No active risks identified</div>
            ) : (
                <div className="risks-list">
                    {risks.map((risk) => (
                        <div key={risk.id} className="risk-card">
                            <div className="risk-header">
                                <div className="risk-badge-group">
                                    <span
                                        className="risk-level-badge"
                                        style={{ backgroundColor: RISK_LEVEL_COLORS[risk.riskLevel] }}
                                    >
                                        {risk.riskLevel}
                                    </span>
                                    <span className="risk-category-badge">{risk.riskCategory}</span>
                                </div>
                                <select
                                    value={risk.status}
                                    onChange={(e) => handleStatusChange(risk.id, e.target.value)}
                                    className="risk-status-select"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="MITIGATED">Mitigated</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            <div className="risk-description">
                                <strong>Description:</strong> {risk.description}
                            </div>

                            {risk.mitigationPlan && (
                                <div className="risk-mitigation">
                                    <strong>Mitigation Plan:</strong> {risk.mitigationPlan}
                                </div>
                            )}

                            <div className="risk-footer">
                                <span className="risk-assessor">Assessed by {risk.assessor.name}</span>
                                <span className="risk-date">
                                    {new Date(risk.assessedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RiskAssessmentPanel;
