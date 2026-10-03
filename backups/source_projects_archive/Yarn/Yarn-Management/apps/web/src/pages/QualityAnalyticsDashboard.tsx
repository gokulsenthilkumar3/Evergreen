import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, BarChart3, Activity, Package } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { http } from '../lib/http';

interface OverviewData {
    inspections: {
        total: number;
        passed: number;
        failed: number;
        conditionalPass: number;
        pending: number;
        passRate: number;
    };
    tests: {
        total: number;
        avgQualityScore: number;
        gradeDistribution: Record<string, number>;
    };
    defects: {
        total: number;
        critical: number;
        open: number;
    };
}

interface SupplierQuality {
    supplierId: string;
    supplierName: string;
    totalInspections: number;
    passedInspections: number;
    passRate: number;
    avgScore: number;
    totalDefects: number;
}

interface TrendData {
    date: string;
    rawMaterialPassRate: number | null;
    productionPassRate: number | null;
    avgQualityScore: number;
}

interface RejectionData {
    overallRejectionRate: number;
    totalInspections: number;
    totalRejections: number;
    totalDefects: number;
    byEntityType: Array<{
        entityType: string;
        rejectionRate: number;
        defectCount: number;
    }>;
    defectsByCategory: Array<{ category: string; count: number }>;
    defectsBySeverity: Record<string, number>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function QualityAnalyticsDashboard() {
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [supplierQuality, setSupplierQuality] = useState<SupplierQuality[]>([]);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [rejection, setRejection] = useState<RejectionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const muiTheme = useTheme();
    const isDark = muiTheme.palette.mode === 'dark';

    // Theme colors
    const colors = {
        bg: isDark ? '#0f172a' : '#f9fafb',
        card: isDark ? '#1e293b' : 'white',
        text: isDark ? '#f8fafc' : '#1a1a1a',
        textSecondary: isDark ? '#94a3b8' : '#666',
        textMuted: isDark ? '#64748b' : '#9ca3af',
        border: isDark ? '#334155' : '#e5e7eb',
        gridLine: isDark ? '#334155' : '#e5e7eb',
    };

    useEffect(() => {
        fetchAllData();
    }, [period]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [overviewRes, supplierRes, trendsRes, rejectionRes] = await Promise.all([
                http.get('/quality-control/analytics/overview'),
                http.get('/quality-control/analytics/supplier-quality'),
                http.get(`/quality-control/analytics/stage-trends?period=${period}`),
                http.get('/quality-control/analytics/rejection-rates'),
            ]);

            setOverview(overviewRes.data.overview);
            setSupplierQuality(supplierRes.data.supplierQuality);
            setTrends(trendsRes.data.trends);
            setRejection(rejectionRes.data.rejectionAnalysis);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 400,
                gap: 16,
                background: colors.bg,
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: `3px solid ${colors.border}`,
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ color: colors.textSecondary }}>Loading analytics...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const gradeData = overview ? Object.entries(overview.tests.gradeDistribution).map(([grade, count]) => ({
        name: `Grade ${grade}`,
        value: count,
    })) : [];

    const severityData = rejection ? Object.entries(rejection.defectsBySeverity).map(([severity, count]) => ({
        name: severity,
        value: count,
    })) : [];

    return (
        <div style={{ padding: 24, background: colors.bg, minHeight: '100vh', transition: 'background 0.3s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 8px 0' }}>
                        Quality Analytics Dashboard
                    </h1>
                    <p style={{ color: colors.textSecondary, margin: 0 }}>
                        Real-time insights into quality performance across your supply chain
                    </p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                        fontSize: 14,
                        background: colors.card,
                        color: colors.text,
                        cursor: 'pointer',
                    }}
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
                {[
                    { icon: CheckCircle, label: 'Pass Rate', value: `${(overview?.inspections.passRate || 0).toFixed(1)}%`, detail: `${overview?.inspections.passed} of ${overview?.inspections.total} passed`, color: 'green' },
                    { icon: Activity, label: 'Avg Quality Score', value: (overview?.tests.avgQualityScore || 0).toFixed(1), detail: `${overview?.tests.total} tests conducted`, color: 'blue' },
                    { icon: AlertTriangle, label: 'Open Defects', value: overview?.defects.open, detail: `${overview?.defects.critical} critical`, color: 'orange' },
                    { icon: TrendingUp, label: 'Rejection Rate', value: `${(rejection?.overallRejectionRate || 0).toFixed(1)}%`, detail: `${rejection?.totalRejections} rejections`, color: 'red' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    const gradients: Record<string, string> = {
                        green: 'linear-gradient(135deg, #10b981, #059669)',
                        blue: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        orange: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        red: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    };
                    return (
                        <div key={i} style={{
                            background: colors.card,
                            borderRadius: 12,
                            padding: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                        }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: gradients[kpi.color],
                                color: 'white',
                            }}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <span style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>{kpi.label}</span>
                                <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{kpi.value}</div>
                                <span style={{ fontSize: 12, color: colors.textMuted }}>{kpi.detail}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
                <div style={{
                    background: colors.card,
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                    gridColumn: 'span 2',
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '0 0 16px 0' }}>Quality Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: colors.textSecondary }} />
                            <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} />
                            <Tooltip
                                contentStyle={{
                                    background: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 8,
                                    color: colors.text,
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="rawMaterialPassRate" name="Raw Material Pass %" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} connectNulls />
                            <Line type="monotone" dataKey="productionPassRate" name="Production Pass %" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} connectNulls />
                            <Line type="monotone" dataKey="avgQualityScore" name="Avg Quality Score" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{
                    background: colors.card,
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '0 0 16px 0' }}>Grade Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={gradeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                            >
                                {gradeData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
                <div style={{ background: colors.card, borderRadius: 12, padding: 20, boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '0 0 16px 0' }}>Supplier Quality Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={supplierQuality.slice(0, 10)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: colors.textSecondary }} />
                            <YAxis dataKey="supplierName" type="category" width={120} tick={{ fontSize: 12, fill: colors.textSecondary }} />
                            <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text }} />
                            <Bar dataKey="passRate" name="Pass Rate %" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: colors.card, borderRadius: 12, padding: 20, boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '0 0 16px 0' }}>Defects by Severity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                <Cell fill="#ef4444" />
                                <Cell fill="#f59e0b" />
                                <Cell fill="#10b981" />
                            </Pie>
                            <Tooltip contentStyle={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Supplier Table */}
            <div style={{ background: colors.card, borderRadius: 12, padding: 20, boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '0 0 16px 0' }}>Supplier Quality Rankings</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Rank', 'Supplier', 'Inspections', 'Pass Rate', 'Avg Score', 'Defects'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: 12, fontSize: 12, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', borderBottom: `2px solid ${colors.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {supplierQuality.map((supplier, index) => (
                                <tr key={supplier.supplierId}>
                                    <td style={{ padding: 12, fontSize: 14, borderBottom: `1px solid ${colors.border}`, color: colors.text }}>{index + 1}</td>
                                    <td style={{ padding: 12, fontSize: 14, fontWeight: 500, borderBottom: `1px solid ${colors.border}`, color: colors.text }}>{supplier.supplierName}</td>
                                    <td style={{ padding: 12, fontSize: 14, borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>{supplier.totalInspections}</td>
                                    <td style={{ padding: 12, borderBottom: `1px solid ${colors.border}` }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            background: supplier.passRate >= 90 ? '#d1fae5' : supplier.passRate >= 70 ? '#fef3c7' : '#fee2e2',
                                            color: supplier.passRate >= 90 ? '#059669' : supplier.passRate >= 70 ? '#d97706' : '#dc2626',
                                        }}>
                                            {(supplier.passRate || 0).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td style={{ padding: 12, fontSize: 14, borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>{(supplier.avgScore || 0).toFixed(1)}</td>
                                    <td style={{ padding: 12, fontSize: 14, borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary }}>{supplier.totalDefects}</td>
                                </tr>
                            ))}
                            {supplierQuality.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: colors.textMuted, padding: 40 }}>No supplier data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
