import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { http } from '../../lib/http';

interface Inspection {
    id: string;
    inspectionNumber: string;
    entityType: string;
    status: string;
    result?: string;
    inspectionDate: string;
    inspector?: { name: string };
    template?: { name: string };
}

interface InspectionListProps {
    onEdit?: (inspection: Inspection) => void;
    onCreate?: () => void;
}

export default function InspectionList({ onEdit, onCreate }: InspectionListProps) {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        fetchInspections();
    }, [statusFilter, entityTypeFilter]);

    const fetchInspections = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (entityTypeFilter) params.append('entityType', entityTypeFilter);

            const response = await http.get(`/quality-control/inspections?${params}`);
            setInspections(response.data.inspections);
        } catch (error) {
            console.error('Failed to fetch inspections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inspection?')) return;

        try {
            await http.delete(`/quality-control/inspections/${id}`);
            fetchInspections();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete inspection');
        }
    };

    const filteredInspections = inspections.filter(inspection =>
        inspection.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: '#f59e0b',
            IN_PROGRESS: '#3b82f6',
            COMPLETED: '#10b981',
            CANCELLED: '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    const getResultBadge = (result?: string) => {
        const colors: Record<string, string> = {
            PASS: '#10b981',
            FAIL: '#ef4444',
            CONDITIONAL_PASS: '#f59e0b',
        };
        return result ? colors[result] || '#6b7280' : '#6b7280';
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 40,
                color: isDark ? '#94a3b8' : '#6b7280'
            }}>
                Loading inspections...
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
            }}>
                <h2 style={{
                    fontSize: 24,
                    fontWeight: 600,
                    margin: 0,
                    color: isDark ? '#f8fafc' : '#1a1a1a'
                }}>
                    Quality Inspections
                </h2>
                <button
                    onClick={onCreate}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={18} />
                    New Inspection
                </button>
            </div>

            <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 20,
                flexWrap: 'wrap'
            }}>
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
                        placeholder="Search by inspection number..."
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
                    <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                    value={entityTypeFilter}
                    onChange={(e) => setEntityTypeFilter(e.target.value)}
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
                    <option value="">All Types</option>
                    <option value="RAW_MATERIAL">Raw Material</option>
                    <option value="PRODUCTION_BATCH">Production Batch</option>
                </select>
            </div>

            <div style={{
                background: isDark ? '#1e293b' : 'white',
                borderRadius: 8,
                border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                overflow: 'hidden',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: isDark ? '#0f172a' : '#f9fafb' }}>
                        <tr>
                            {['Inspection #', 'Entity Type', 'Date', 'Inspector', 'Template', 'Status', 'Result', 'Actions'].map(header => (
                                <th key={header} style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: isDark ? '#94a3b8' : '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInspections.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{
                                    textAlign: 'center',
                                    padding: 40,
                                    color: isDark ? '#64748b' : '#9ca3af',
                                }}>
                                    No inspections found
                                </td>
                            </tr>
                        ) : (
                            filteredInspections.map((inspection) => (
                                <tr key={inspection.id}>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: isDark ? '#f8fafc' : '#1a1a1a',
                                    }}>
                                        {inspection.inspectionNumber}
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                        fontSize: 14,
                                        color: isDark ? '#94a3b8' : '#6b7280',
                                    }}>
                                        {inspection.entityType.replace('_', ' ')}
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                        fontSize: 14,
                                        color: isDark ? '#94a3b8' : '#6b7280',
                                    }}>
                                        {new Date(inspection.inspectionDate).toLocaleDateString()}
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                        fontSize: 14,
                                        color: isDark ? '#94a3b8' : '#6b7280',
                                    }}>
                                        {inspection.inspector?.name || '-'}
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                        fontSize: 14,
                                        color: isDark ? '#94a3b8' : '#6b7280',
                                    }}>
                                        {inspection.template?.name || '-'}
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                    }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: 'white',
                                            background: getStatusBadge(inspection.status),
                                        }}>
                                            {inspection.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                    }}>
                                        {inspection.result ? (
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                fontWeight: 500,
                                                color: 'white',
                                                background: getResultBadge(inspection.result),
                                            }}>
                                                {inspection.result.replace('_', ' ')}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                    }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => onEdit?.(inspection)}
                                                title="Edit"
                                                style={{
                                                    padding: 6,
                                                    background: isDark ? '#334155' : '#f3f4f6',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: isDark ? '#94a3b8' : '#6b7280',
                                                }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inspection.id)}
                                                title="Delete"
                                                style={{
                                                    padding: 6,
                                                    background: isDark ? '#334155' : '#f3f4f6',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#ef4444',
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
