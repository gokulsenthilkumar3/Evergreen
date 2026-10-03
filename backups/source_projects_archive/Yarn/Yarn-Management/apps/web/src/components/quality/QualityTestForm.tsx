import { useState, useEffect } from 'react';
import { X, Save, FlaskConical } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { http } from '../../lib/http';

interface QualityTestFormProps {
    testId?: string;
    onClose: () => void;
    onSave: () => void;
}

interface RawMaterial {
    id: string;
    batchNo: string;
    materialType: string;
}

interface ProductionBatch {
    id: string;
    batchNumber: string;
}

export default function QualityTestForm({ testId, onClose, onSave }: QualityTestFormProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [formData, setFormData] = useState({
        entityType: 'RAW_MATERIAL',
        entityId: '',
        testDate: new Date().toISOString().split('T')[0],
        testParameters: {
            tensileStrength: '',
            elongation: '',
            moisture: '',
            colorFastness: '',
            shrinkage: '',
        },
        notes: '',
        status: 'IN_PROGRESS',
    });

    const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
    const [calculatedGrade, setCalculatedGrade] = useState<string | null>(null);

    useEffect(() => {
        fetchDropdownData();
        if (testId) {
            fetchTestDetails();
        }
    }, [testId]);

    useEffect(() => {
        calculateScore();
    }, [formData.testParameters]);

    const fetchDropdownData = async () => {
        try {
            const [rmRes, batchRes] = await Promise.all([
                http.get('/raw-materials?limit=100'),
                http.get('/production-batches?limit=100'),
            ]);
            setRawMaterials(rmRes.data.data || []);
            setProductionBatches(batchRes.data.batches || []);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
        }
    };

    const fetchTestDetails = async () => {
        try {
            setLoading(true);
            const response = await http.get(`/quality-control/tests/${testId}`);
            const test = response.data.test;
            setFormData({
                entityType: test.entityType,
                entityId: test.entityId,
                testDate: test.testDate.split('T')[0],
                testParameters: test.testParameters || {},
                notes: test.notes || '',
                status: test.status,
            });
            setCalculatedScore(test.qualityScore);
            setCalculatedGrade(test.qualityGrade);
        } catch (error) {
            console.error('Failed to fetch test details:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateScore = () => {
        const params = formData.testParameters;
        const values = [
            parseFloat(params.tensileStrength) || 0,
            parseFloat(params.elongation) || 0,
            parseFloat(params.moisture) || 0,
            parseFloat(params.colorFastness) || 0,
            parseFloat(params.shrinkage) || 0,
        ];

        const filledValues = values.filter(v => v > 0);
        if (filledValues.length === 0) {
            setCalculatedScore(null);
            setCalculatedGrade(null);
            return;
        }

        // Simple weighted average (each param contributes 20 points max)
        const avgScore = Math.min(100, (filledValues.reduce((a, b) => a + b, 0) / filledValues.length) * 10);
        setCalculatedScore(Math.round(avgScore * 10) / 10);

        if (avgScore >= 90) setCalculatedGrade('A');
        else if (avgScore >= 80) setCalculatedGrade('B');
        else if (avgScore >= 70) setCalculatedGrade('C');
        else if (avgScore >= 60) setCalculatedGrade('D');
        else setCalculatedGrade('F');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.entityId) {
            alert('Please select an entity');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...formData,
                qualityScore: calculatedScore,
                qualityGrade: calculatedGrade,
            };

            if (testId) {
                await http.patch(`/quality-control/tests/${testId}`, payload);
            } else {
                await http.post('/quality-control/tests', payload);
            }

            onSave();
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save test');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
        borderRadius: 6,
        fontSize: 14,
        background: isDark ? '#1e293b' : 'white',
        color: isDark ? '#f8fafc' : '#1a1a1a',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        fontSize: 13,
        fontWeight: 500,
        color: isDark ? '#94a3b8' : '#6b7280',
        marginBottom: 6,
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#6b7280' }}>
                Loading test details...
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                background: isDark ? '#1e293b' : 'white',
                borderRadius: 12,
                width: '100%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: isDark ? '#f8fafc' : '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FlaskConical size={20} />
                        {testId ? 'Edit Quality Test' : 'New Quality Test'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#94a3b8' : '#6b7280' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Entity Type *</label>
                            <select
                                value={formData.entityType}
                                onChange={(e) => setFormData({ ...formData, entityType: e.target.value, entityId: '' })}
                                style={inputStyle}
                            >
                                <option value="RAW_MATERIAL">Raw Material</option>
                                <option value="PRODUCTION_BATCH">Production Batch</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Select Entity *</label>
                            <select
                                value={formData.entityId}
                                onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="">Select...</option>
                                {formData.entityType === 'RAW_MATERIAL'
                                    ? rawMaterials.map(rm => (
                                        <option key={rm.id} value={rm.id}>{rm.batchNo} - {rm.materialType}</option>
                                    ))
                                    : productionBatches.map(batch => (
                                        <option key={batch.id} value={batch.id}>{batch.batchNumber}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Test Date *</label>
                            <input
                                type="date"
                                value={formData.testDate}
                                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div style={{
                        background: isDark ? '#0f172a' : '#f9fafb',
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 16,
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: isDark ? '#f8fafc' : '#1a1a1a' }}>
                            Test Parameters
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {Object.entries(formData.testParameters).map(([key, value]) => (
                                <div key={key}>
                                    <label style={labelStyle}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={value}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            testParameters: { ...formData.testParameters, [key]: e.target.value }
                                        })}
                                        placeholder="0.0"
                                        style={inputStyle}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {calculatedScore !== null && (
                        <div style={{
                            display: 'flex',
                            gap: 20,
                            padding: 16,
                            background: calculatedGrade === 'A' || calculatedGrade === 'B' ? (isDark ? '#022c22' : '#d1fae5') : (isDark ? '#422006' : '#fef3c7'),
                            borderRadius: 8,
                            marginBottom: 16,
                        }}>
                            <div>
                                <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}>Calculated Score</div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#f8fafc' : '#1a1a1a' }}>{calculatedScore}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}>Quality Grade</div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    fontSize: 18,
                                    fontWeight: 700,
                                    background: calculatedGrade === 'A' ? '#10b981' : calculatedGrade === 'B' ? '#3b82f6' : '#f59e0b',
                                    color: 'white',
                                }}>
                                    {calculatedGrade}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            placeholder="Add any notes or observations..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                                borderRadius: 6,
                                background: 'transparent',
                                color: isDark ? '#f8fafc' : '#1a1a1a',
                                fontSize: 14,
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: 6,
                                background: '#3b82f6',
                                color: 'white',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1,
                            }}
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
