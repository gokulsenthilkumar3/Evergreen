import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
    AlertTriangle,
    BrainCircuit,
    TrendingUp,
    Activity,
    Search,
    CheckCircle,
    XCircle
} from 'lucide-react';

export default function QualityPredictionView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // State
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);

    // Prediction Form State
    const [predictType, setPredictType] = useState<'material' | 'batch'>('material');
    const [supplierId, setSupplierId] = useState('');
    const [materialType, setMaterialType] = useState('COTTON');
    const [batchId, setBatchId] = useState('');
    const [predictionResult, setPredictionResult] = useState<any>(null);
    const [predicting, setPredicting] = useState(false);

    // Fetch alerts on mount
    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch('http://localhost:4000/quality-prediction/predictions/alerts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Simple auth assumption
            });
            const data = await res.json();
            if (data.alerts) setAlerts(data.alerts);
        } catch (error) {
            console.error('Failed to fetch alerts', error);
        } finally {
            setLoadingAlerts(false);
        }
    };

    const handlePredict = async () => {
        setPredicting(true);
        setPredictionResult(null);
        try {
            let url = '';
            if (predictType === 'material') {
                if (!supplierId) { alert('Supplier ID is required'); return; }
                url = `http://localhost:4000/quality-prediction/predictions/material/${supplierId}?materialType=${materialType}`;
            } else {
                if (!batchId) { alert('Batch ID is required'); return; }
                url = `http://localhost:4000/quality-prediction/predictions/batch/${batchId}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!res.ok) throw new Error('Prediction failed');

            const data = await res.json();
            setPredictionResult(data);
        } catch (error) {
            console.error(error);
            alert('Failed to generate prediction');
        } finally {
            setPredicting(false);
        }
    };

    // Helper styles
    const cardStyle = {
        background: isDark ? '#1e293b' : 'white',
        borderRadius: 12,
        padding: 24,
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        marginBottom: 24
    };

    return (
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Active Alerts Section */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <AlertTriangle color="#ef4444" />
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: isDark ? '#f8fafc' : '#1e293b' }}>
                            Predictive Alerts (High Risk Batches)
                        </h2>
                    </div>

                    {loadingAlerts ? (
                        <p>Loading alerts...</p>
                    ) : alerts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                            <CheckCircle size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <p>No high-risk batches detected. Systems nominal.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                            {alerts.map(alert => (
                                <div key={alert.id} style={{
                                    padding: 16,
                                    borderRadius: 8,
                                    background: isDark ? '#450a0a' : '#fef2f2',
                                    border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}`,
                                    borderColor: alert.riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: isDark ? '#fca5a5' : '#991b1b', fontWeight: 600 }}>
                                            Batch #{alert.batchNumber}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: 14, color: isDark ? '#fecaca' : '#b91c1c' }}>
                                            Predicted Score: {alert.predictedScore} | Risk: {alert.riskLevel}
                                        </p>
                                    </div>
                                    <button style={{
                                        background: isDark ? '#7f1d1d' : '#fee2e2',
                                        color: isDark ? '#fee2e2' : '#991b1b',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: 6,
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}>View Details</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Prediction Simulator */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <BrainCircuit color="#3b82f6" />
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: isDark ? '#f8fafc' : '#1e293b' }}>
                            AI Prediction Simulator
                        </h2>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                        <button
                            onClick={() => setPredictType('material')}
                            style={{
                                flex: 1, padding: 12, borderRadius: 8,
                                border: `1px solid ${predictType === 'material' ? '#3b82f6' : (isDark ? '#334155' : '#e2e8f0')}`,
                                background: predictType === 'material' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                                color: predictType === 'material' ? '#3b82f6' : 'inherit',
                                fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Predict Material Quality
                        </button>
                        <button
                            onClick={() => setPredictType('batch')}
                            style={{
                                flex: 1, padding: 12, borderRadius: 8,
                                border: `1px solid ${predictType === 'batch' ? '#3b82f6' : (isDark ? '#334155' : '#e2e8f0')}`,
                                background: predictType === 'batch' ? (isDark ? '#1e3a8a' : '#eff6ff') : 'transparent',
                                color: predictType === 'batch' ? '#3b82f6' : 'inherit',
                                fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Predict Batch Outcome
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                        {predictType === 'material' ? (
                            <>
                                <input
                                    placeholder="Enter Supplier ID (UUID)..."
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                    style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: isDark ? '#0f172a' : 'white', color: 'inherit' }}
                                />
                                <select
                                    value={materialType}
                                    onChange={(e) => setMaterialType(e.target.value)}
                                    style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: isDark ? '#0f172a' : 'white', color: 'inherit' }}
                                >
                                    <option value="COTTON">Cotton</option>
                                    <option value="POLYESTER">Polyester</option>
                                    <option value="SILK">Silk</option>
                                </select>
                            </>
                        ) : (
                            <input
                                placeholder="Enter Production Batch ID (UUID)..."
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: isDark ? '#0f172a' : 'white', color: 'inherit', gridColumn: 'span 2' }}
                            />
                        )}
                    </div>

                    <button
                        onClick={handlePredict}
                        disabled={predicting}
                        style={{
                            marginTop: 16, width: '100%', padding: 12, borderRadius: 8,
                            background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600,
                            cursor: 'pointer', opacity: predicting ? 0.7 : 1
                        }}
                    >
                        {predicting ? 'Analyzing...' : 'Run Prediction'}
                    </button>

                    {/* Result Display */}
                    {predictionResult && (
                        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                            <h3 style={{ marginTop: 0 }}>Prediction Result</h3>
                            <pre style={{ overflow: 'auto', fontSize: 13 }}>
                                {JSON.stringify(predictionResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={cardStyle}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Why utilize AI?</h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                        Our Random Forest algorithm analyzes 10,000+ historical data points to predict quality outcomes with 85% accuracy.
                    </p>
                    <div style={{ marginTop: 16, padding: 12, background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: 8 }}>
                        <strong style={{ display: 'block', fontSize: 24, color: '#3b82f6' }}>85%</strong>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Accuracy Rate</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
