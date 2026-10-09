import { useState, useEffect } from 'react';
import { Plus, Search, FileCheck, Award } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { http } from '../../lib/http';

interface QualityTest {
    id: string;
    testNumber: string;
    entityType: string;
    entityId: string;
    testDate: string;
    testParameters: any;
    qualityScore?: number;
    qualityGrade?: string;
    status: string;
    testedBy?: string;
    notes?: string;
}

interface QualityTestListProps {
    onEdit?: (test: QualityTest) => void;
    onCreate?: () => void;
}

export default function QualityTestList({ onEdit, onCreate }: QualityTestListProps) {
    const [tests, setTests] = useState<QualityTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        fetchTests();
    }, [statusFilter, entityTypeFilter]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (entityTypeFilter) params.append('entityType', entityTypeFilter);

            const response = await http.get(`/quality-control/tests?${params}`);
            setTests(response.data.tests);
        } catch (error) {
            console.error('Failed to fetch tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCertificate = async (testId: string) => {
        try {
            const response = await http.post(`/quality-control/tests/${testId}/certificate`);
            if (response.data.certificateUrl) {
                window.open(response.data.certificateUrl, '_blank');
            }
            alert('Certificate generated successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to generate certificate');
        }
    };

    const filteredTests = tests.filter(test =>
        test.testNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getGradeBadge = (grade?: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            A: { bg: '#d1fae5', text: '#059669' },
            B: { bg: '#dbeafe', text: '#2563eb' },
            C: { bg: '#fef3c7', text: '#d97706' },
            D: { bg: '#fed7aa', text: '#ea580c' },
            F: { bg: '#fee2e2', text: '#dc2626' },
        };
        return colors[grade || ''] || { bg: '#f3f4f6', text: '#6b7280' };
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            IN_PROGRESS: '#3b82f6',
            COMPLETED: '#10b981',
            CANCELLED: '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#6b7280' }}>
                Loading quality tests...
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: isDark ? '#f8fafc' : '#1a1a1a' }}>
                    Quality Tests
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
                    New Test
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
                        placeholder="Search by test number..."
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
                            {['Test #', 'Entity Type', 'Date', 'Score', 'Grade', 'Status', 'Actions'].map(header => (
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
                        {filteredTests.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: isDark ? '#64748b' : '#9ca3af' }}>
                                    No quality tests found
                                </td>
                            </tr>
                        ) : (
                            filteredTests.map((test) => {
                                const gradeColors = getGradeBadge(test.qualityGrade);
                                return (
                                    <tr key={test.id}>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: isDark ? '#f8fafc' : '#1a1a1a',
                                        }}>
                                            {test.testNumber}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                            fontSize: 14,
                                            color: isDark ? '#94a3b8' : '#6b7280',
                                        }}>
                                            {test.entityType.replace('_', ' ')}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                            fontSize: 14,
                                            color: isDark ? '#94a3b8' : '#6b7280',
                                        }}>
                                            {new Date(test.testDate).toLocaleDateString()}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: isDark ? '#f8fafc' : '#1a1a1a',
                                        }}>
                                            {test.qualityScore ? Number(test.qualityScore).toFixed(1) : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>
                                            {test.qualityGrade ? (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    background: gradeColors.bg,
                                                    color: gradeColors.text,
                                                }}>
                                                    {test.qualityGrade}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                fontWeight: 500,
                                                color: 'white',
                                                background: getStatusColor(test.status),
                                            }}>
                                                {test.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => onEdit?.(test)}
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
                                                    <FileCheck size={16} />
                                                </button>
                                                {test.status === 'COMPLETED' && (
                                                    <button
                                                        onClick={() => handleGenerateCertificate(test.id)}
                                                        title="Generate Certificate"
                                                        style={{
                                                            padding: 6,
                                                            background: '#10b981',
                                                            border: 'none',
                                                            borderRadius: 4,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                        }}
                                                    >
                                                        <Award size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
