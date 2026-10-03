import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { http } from '../../lib/http';

interface DefectLogFormProps {
    defectId?: string;
    onClose: () => void;
    onSave: () => void;
}

export default function DefectLogForm({ defectId, onClose, onSave }: DefectLogFormProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [productionBatches, setProductionBatches] = useState<any[]>([]);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const defectCategories = ['Color Variation', 'Contamination', 'Count Deviation', 'Strength Issue', 'Packaging Damage', 'Other'];
    const defectTypes = ['Visual', 'Physical', 'Measurement', 'Structural', 'Packaging', 'Other'];

    const [formData, setFormData] = useState({
        entityType: 'RAW_MATERIAL',
        entityId: '',
        defectCategory: '',
        defectType: '',
        severity: 'MINOR',
        quantity: '',
        description: '',
        rootCause: '',
        correctiveAction: '',
        actionStatus: 'PENDING',
    });

    useEffect(() => {
        fetchDropdownData();
        if (defectId) fetchDefectDetails();
    }, [defectId]);

    const fetchDropdownData = async () => {
        try {
            const [rmRes, batchRes] = await Promise.all([
                http.get('/raw-materials?limit=100'),
                http.get('/manufacturing/batches'),
            ]);
            setRawMaterials(rmRes.data.data || []);
            setProductionBatches(batchRes.data.batches || []);
        } catch (error) { console.error(error); }
    };

    const fetchDefectDetails = async () => {
        try {
            setLoading(true);
            const response = await http.get(`/quality-control/defects/${defectId}`);
            const d = response.data.defect;
            setFormData({
                entityType: d.entityType, entityId: d.entityId, defectCategory: d.defectCategory,
                defectType: d.defectType, severity: d.severity, quantity: d.quantity?.toString() || '',
                description: d.description, rootCause: d.rootCause || '', correctiveAction: d.correctiveAction || '',
                actionStatus: d.actionStatus,
            });
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.entityId || !formData.defectCategory || !formData.description) {
            alert('Please fill required fields'); return;
        }
        try {
            setSaving(true);
            const payload = { ...formData, quantity: formData.quantity ? parseFloat(formData.quantity) : null };
            if (defectId) await http.patch(`/quality-control/defects/${defectId}`, payload);
            else await http.post('/quality-control/defects', payload);
            onSave(); onClose();
        } catch (error: any) { alert(error.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
    };

    const inputStyle = { width: '100%', padding: '10px 12px', border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`, borderRadius: 6, fontSize: 14, background: isDark ? '#1e293b' : 'white', color: isDark ? '#f8fafc' : '#1a1a1a', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: 6 };

    if (loading) return <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#6b7280' }}>Loading...</div>;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: isDark ? '#1e293b' : 'white', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: isDark ? '#f8fafc' : '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={20} color="#ef4444" />{defectId ? 'Edit Defect' : 'Log Defect'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#94a3b8' : '#6b7280' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div><label style={labelStyle}>Entity Type *</label><select value={formData.entityType} onChange={(e) => setFormData({ ...formData, entityType: e.target.value, entityId: '' })} style={inputStyle}><option value="RAW_MATERIAL">Raw Material</option><option value="PRODUCTION_BATCH">Production Batch</option></select></div>
                        <div><label style={labelStyle}>Entity *</label><select value={formData.entityId} onChange={(e) => setFormData({ ...formData, entityId: e.target.value })} style={inputStyle}><option value="">Select...</option>{formData.entityType === 'RAW_MATERIAL' ? rawMaterials.map(rm => <option key={rm.id} value={rm.id}>{rm.batchNo}</option>) : productionBatches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}</select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div><label style={labelStyle}>Category *</label><select value={formData.defectCategory} onChange={(e) => setFormData({ ...formData, defectCategory: e.target.value })} style={inputStyle}><option value="">Select...</option>{defectCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label style={labelStyle}>Type *</label><select value={formData.defectType} onChange={(e) => setFormData({ ...formData, defectType: e.target.value })} style={inputStyle}><option value="">Select...</option>{defectTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label style={labelStyle}>Severity *</label><select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} style={inputStyle}><option value="MINOR">Minor</option><option value="MAJOR">Major</option><option value="CRITICAL">Critical</option></select></div>
                    </div>
                    <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description *</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the defect..." /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div><label style={labelStyle}>Root Cause</label><textarea value={formData.rootCause} onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                        <div><label style={labelStyle}>Corrective Action</label><textarea value={formData.correctiveAction} onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`, borderRadius: 6, background: 'transparent', color: isDark ? '#f8fafc' : '#1a1a1a', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: 'none', borderRadius: 6, background: '#ef4444', color: 'white', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}><Save size={16} />{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
