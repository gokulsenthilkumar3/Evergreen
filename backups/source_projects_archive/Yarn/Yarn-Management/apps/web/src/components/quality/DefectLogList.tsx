import { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, Edit, Eye } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { http } from '../../lib/http';

interface DefectLog {
    id: string;
    defectNumber: string;
    entityType: string;
    entityId: string;
    defectCategory: string;
    defectType: string;
    severity: string;
    quantity?: number;
    description: string;
    rootCause?: string;
    correctiveAction?: string;
    actionStatus: string;
    createdAt: string;
}

interface DefectLogListProps {
    onEdit?: (defect: DefectLog) => void;
    onCreate?: () => void;
}

export default function DefectLogList({ onEdit, onCreate }: DefectLogListProps) {
    const [defects, setDefects] = useState<DefectLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        fetchDefects();
    }, [severityFilter, statusFilter]);

    const fetchDefects = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (severityFilter) params.append('severity', severityFilter);
            if (statusFilter) params.append('actionStatus', statusFilter);

            const response = await http.get(`/quality-control/defects?${params}`);
            setDefects(response.data.defects);
        } catch (error) {
            console.error('Failed to fetch defects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDefects = defects.filter(defect =>
        defect.defectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defect.defectCategory.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSeverityBadge = (severity: string) => {
        const config: Record<string, { bg: string; text: string; icon: boolean }> = {
            CRITICAL: { bg: '#fee2e2', text: '#dc2626', icon: true },
            MAJOR: { bg: '#fed7aa', text: '#ea580c', icon: false },
            MINOR: { bg: '#fef3c7', text: '#d97706', icon: false },
        };
        return config[severity] || { bg: '#f3f4f6', text: '#6b7280', icon: false };
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: '#f59e0b',
            IN_PROGRESS: '#3b82f6',
            COMPLETED: '#10b981',
            CANCELLED: '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#6b7280' }}>
                Loading defect logs...
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: isDark ? '#f8fafc' : '#1a1a1a' }}>
                    Defect Logs
                </h2>
                <button
                    onClick={onCreate}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={18} />
                    Log Defect
                </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    minWidth: 250,
                    padding: '8px 12px',
                    border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                    borderRadius: 6,
                    background: isDark ? '#1e293b' : 'white',
                }}>
                    <Search size={18} style={{ color: isDark ? '#64748b' : '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Search by defect number or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: 14,
                            background: 'transparent',
                            color: isDark ? '#f8fafc' : '#1a1a1a',
                        }}
                    />
                </div>

                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: 'pointer',
                        background: isDark ? '#1e293b' : 'white',
                        color: isDark ? '#f8fafc' : '#1a1a1a',
                    }}
                >
                    <option value="">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="MAJOR">Major</option>
                    <option value="MINOR">Minor</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: 'pointer',
                        background: isDark ? '#1e293b' : 'white',
                        color: isDark ? '#f8fafc' : '#1a1a1a',
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
                {filteredDefects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 40,
                        color: isDark ? '#64748b' : '#9ca3af',
                        background: isDark ? '#1e293b' : 'white',
                        borderRadius: 8,
                        border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                    }}>
                        No defect logs found
                    </div>
                ) : (
                    filteredDefects.map((defect) => {
                        const severityConfig = getSeverityBadge(defect.severity);
                        return (
                            <div
                                key={defect.id}
                                style={{
                                    background: isDark ? '#1e293b' : 'white',
                                    borderRadius: 8,
                                    border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                    padding: 16,
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: 16,
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <span style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: isDark ? '#f8fafc' : '#1a1a1a',
                                        }}>
                                            {defect.defectNumber}
                                        </span>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '4px 10px',
                                            borderRadius: 12,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            background: severityConfig.bg,
                                            color: severityConfig.text,
                                        }}>
                                            {severityConfig.icon && <AlertTriangle size={12} />}
                                            {defect.severity}
                                        </span>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: 12,
                                            fontSize: 11,
                                            fontWeight: 500,
                                            color: 'white',
                                            background: getStatusColor(defect.actionStatus),
                                        }}>
                                            {defect.actionStatus.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: 8 }}>
                                        <strong>{defect.defectCategory}</strong> - {defect.defectType}
                                    </div>

                                    <p style={{
                                        margin: '0 0 8px 0',
                                        fontSize: 14,
                                        color: isDark ? '#cbd5e1' : '#4b5563',
                                        lineHeight: 1.5,
                                    }}>
                                        {defect.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: isDark ? '#64748b' : '#9ca3af' }}>
                                        <span>Entity: {defect.entityType.replace('_', ' ')}</span>
                                        <span>Qty: {defect.quantity || '-'}</span>
                                        <span>Date: {new Date(defect.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    {defect.correctiveAction && (
                                        <div style={{
                                            marginTop: 12,
                                            padding: 10,
                                            background: isDark ? '#0f172a' : '#f0fdf4',
                                            borderRadius: 6,
                                            fontSize: 13,
                                            color: isDark ? '#86efac' : '#15803d',
                                        }}>
                                            <strong>Corrective Action:</strong> {defect.correctiveAction}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <button
                                        onClick={() => onEdit?.(defect)}
                                        style={{
                                            padding: 8,
                                            background: isDark ? '#334155' : '#f3f4f6',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            color: isDark ? '#94a3b8' : '#6b7280',
                                        }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
