import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { http } from '../../lib/http';

interface InspectionTemplate {
    id: string;
    name: string;
    description?: string;
    entityType: string;
    checklistItems: any[];
    testParameters: any[];
    isActive: boolean;
    createdAt: string;
}

interface InspectionTemplateManagerProps {
    onEdit?: (template: InspectionTemplate) => void;
    onCreate?: () => void;
}

export default function InspectionTemplateManager({ onEdit, onCreate }: InspectionTemplateManagerProps) {
    const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => { fetchTemplates(); }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await http.get('/quality-control/templates');
            setTemplates(response.data.templates);
        } catch (error) { console.error('Failed to fetch templates:', error); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this template?')) return;
        try {
            await http.delete(`/quality-control/templates/${id}`);
            fetchTemplates();
        } catch (error: any) { alert(error.response?.data?.message || 'Failed to delete'); }
    };

    const handleToggleActive = async (template: InspectionTemplate) => {
        try {
            await http.patch(`/quality-control/templates/${template.id}`, { isActive: !template.isActive });
            fetchTemplates();
        } catch (error: any) { alert(error.response?.data?.message || 'Failed to update'); }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#6b7280' }}>Loading templates...</div>;

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: isDark ? '#f8fafc' : '#1a1a1a' }}>Inspection Templates</h2>
                <button onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    <Plus size={18} />New Template
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`, borderRadius: 6, background: isDark ? '#1e293b' : 'white', marginBottom: 20 }}>
                <Search size={18} style={{ color: isDark ? '#64748b' : '#9ca3af' }} />
                <input type="text" placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: isDark ? '#f8fafc' : '#1a1a1a' }} />
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
                {filteredTemplates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#64748b' : '#9ca3af', background: isDark ? '#1e293b' : 'white', borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>No templates found</div>
                ) : (
                    filteredTemplates.map((template) => (
                        <div key={template.id} style={{ background: isDark ? '#1e293b' : 'white', borderRadius: 8, border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <FileText size={20} style={{ color: '#8b5cf6' }} />
                                        <span style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f8fafc' : '#1a1a1a' }}>{template.name}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: template.isActive ? '#d1fae5' : '#fee2e2', color: template.isActive ? '#059669' : '#dc2626' }}>
                                            {template.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: isDark ? '#334155' : '#f3f4f6', color: isDark ? '#94a3b8' : '#6b7280' }}>
                                            {template.entityType.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {template.description && <p style={{ margin: '0 0 12px 0', fontSize: 14, color: isDark ? '#94a3b8' : '#6b7280' }}>{template.description}</p>}
                                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: isDark ? '#64748b' : '#9ca3af' }}>
                                        <span>📋 {template.checklistItems?.length || 0} checklist items</span>
                                        <span>🧪 {template.testParameters?.length || 0} test parameters</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleToggleActive(template)} title={template.isActive ? 'Deactivate' : 'Activate'} style={{ padding: 8, background: isDark ? '#334155' : '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: template.isActive ? '#ef4444' : '#10b981' }}>
                                        {template.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                    </button>
                                    <button onClick={() => onEdit?.(template)} title="Edit" style={{ padding: 8, background: isDark ? '#334155' : '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: isDark ? '#94a3b8' : '#6b7280' }}><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(template.id)} title="Delete" style={{ padding: 8, background: isDark ? '#334155' : '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
