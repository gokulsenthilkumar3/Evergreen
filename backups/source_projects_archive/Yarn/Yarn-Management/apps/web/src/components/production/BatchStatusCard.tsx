import React, { useEffect, useState } from 'react';
import { http } from '../../lib/http';
import { useNotification } from '../../context/NotificationContext';
import './BatchStatusCard.css';

interface Alert {
    id: string;
    alertType: string;
    severity: string;
}

interface Batch {
    id: string;
    batchNumber: string;
    currentStage: string;
    currentStageProgress: number | null;
    status: string;
    machine: {
        id: string;
        name: string;
        code: string;
        status: string;
    } | null;
    operator: {
        id: string;
        name: string;
    } | null;
    rawMaterial: {
        materialType: string;
        batchNo: string;
    };
    alerts: Alert[];
    updatedAt: string;
}

interface Props {
    batch: Batch;
    onRefresh: () => void;
}

const BatchStatusCard: React.FC<Props> = ({ batch, onRefresh }) => {
    const { showSuccess, showError } = useNotification();
    const [updating, setUpdating] = useState(false);

    const handleProgressUpdate = async (newProgress: number) => {
        setUpdating(true);
        try {
            await http.patch(`/production/batches/${batch.id}/progress`, {
                currentStageProgress: newProgress,
            });
            showSuccess('Progress updated');
            onRefresh();
        } catch (error: any) {
            showError('Failed to update progress');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return '#3b82f6';
            case 'COMPLETED': return '#10b981';
            case 'PENDING': return '#f59e0b';
            case 'CANCELLED': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const hasCriticalAlert = batch.alerts.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

    return (
        <div className={`batch-status-card ${hasCriticalAlert ? 'has-alert' : ''}`}>
            <div className="batch-header">
                <div className="batch-id">
                    <span className="label">Batch</span>
                    <span className="value">{batch.batchNumber}</span>
                </div>
                <div className="batch-status-badge" style={{ backgroundColor: getStatusColor(batch.status) }}>
                    {batch.status}
                </div>
            </div>

            <div className="batch-info">
                <div className="info-row">
                    <span className="label">Material:</span>
                    <span className="value">{batch.rawMaterial.materialType} ({batch.rawMaterial.batchNo})</span>
                </div>
                <div className="info-row">
                    <span className="label">Stage:</span>
                    <span className="value">{batch.currentStage}</span>
                </div>
                {batch.machine && (
                    <div className="info-row">
                        <span className="label">Machine:</span>
                        <span className="value">{batch.machine.name}</span>
                    </div>
                )}
                {batch.operator && (
                    <div className="info-row">
                        <span className="label">Operator:</span>
                        <span className="value">{batch.operator.name}</span>
                    </div>
                )}
            </div>

            <div className="progress-section">
                <div className="progress-label">
                    <span>Progress</span>
                    <span>{batch.currentStageProgress || 0}%</span>
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${batch.currentStageProgress || 0}%`, backgroundColor: getStatusColor(batch.status) }}
                    />
                </div>
                <div className="progress-controls">
                    <button disabled={updating} onClick={() => handleProgressUpdate(Math.min((batch.currentStageProgress || 0) + 10, 100))}>+10%</button>
                    <button disabled={updating} onClick={() => handleProgressUpdate(100)}>Complete</button>
                </div>
            </div>

            {batch.alerts.length > 0 && (
                <div className="batch-alerts">
                    {batch.alerts.map(alert => (
                        <div key={alert.id} className={`alert-badge ${alert.severity.toLowerCase()}`}>
                            {alert.alertType}
                        </div>
                    ))}
                </div>
            )}

            <div className="last-updated">
                Updated: {new Date(batch.updatedAt).toLocaleTimeString()}
            </div>
        </div>
    );
};

export default BatchStatusCard;
