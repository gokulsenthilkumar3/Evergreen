import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';

interface QualityOverview {
    inspections: { total: number; passed: number; failed: number; pending: number; passRate: number };
    tests: { total: number; avgQualityScore: number };
    defects: { total: number; critical: number; open: number };
}

export default function QualityDashboardWidget() {
    const [data, setData] = useState<QualityOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();

    useEffect(() => {
        http.get('/quality-control/analytics/overview')
            .then(res => setData(res.data.overview))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: 12, padding: 20, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Loading quality data...</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: 12, padding: 20, boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: isDark ? '#f8fafc' : '#1a1a1a' }}>Quality Overview</h3>
                <button onClick={() => navigate('/quality-analytics')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                    View Analytics <ArrowRight size={14} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ background: isDark ? '#0f172a' : '#ecfdf5', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <CheckCircle size={24} style={{ color: '#10b981', marginBottom: 4 }} />
                    <div style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#f8fafc' : '#1a1a1a' }}>{data.inspections.passRate.toFixed(0)}%</div>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}>Pass Rate</div>
                </div>
                <div style={{ background: isDark ? '#0f172a' : '#eff6ff', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#f8fafc' : '#1a1a1a' }}>{data.tests.avgQualityScore?.toFixed(1) || '-'}</div>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}>Avg Score</div>
                </div>
                <div style={{ background: isDark ? '#0f172a' : (data.defects.critical > 0 ? '#fef2f2' : '#fefce8'), borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    {data.defects.critical > 0 ? <AlertTriangle size={24} style={{ color: '#ef4444', marginBottom: 4 }} /> : <XCircle size={24} style={{ color: '#f59e0b', marginBottom: 4 }} />}
                    <div style={{ fontSize: 24, fontWeight: 700, color: data.defects.critical > 0 ? '#ef4444' : (isDark ? '#f8fafc' : '#1a1a1a') }}>{data.defects.open}</div>
                    <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}>Open Defects</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 13, color: isDark ? '#64748b' : '#9ca3af' }}>
                <span>📋 {data.inspections.total} inspections</span>
                <span>🧪 {data.tests.total} tests</span>
                <span>⚠️ {data.defects.critical} critical</span>
            </div>
        </div>
    );
}
