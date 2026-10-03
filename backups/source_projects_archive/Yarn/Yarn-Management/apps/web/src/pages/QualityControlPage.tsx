import { useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, ClipboardList, FlaskConical, BrainCircuit } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import InspectionList from '../components/quality/InspectionList';
import InspectionForm from '../components/quality/InspectionForm';
import QualityTestList from '../components/quality/QualityTestList';
import QualityTestForm from '../components/quality/QualityTestForm';
import DefectLogList from '../components/quality/DefectLogList';
import DefectLogForm from '../components/quality/DefectLogForm';
import InspectionTemplateManager from '../components/quality/InspectionTemplateManager';
import QualityPredictionView from '../components/quality/QualityPredictionView';

export default function QualityControlPage() {
    const [activeTab, setActiveTab] = useState<'inspections' | 'tests' | 'defects' | 'templates' | 'predictions'>('inspections');
    const [showInspectionForm, setShowInspectionForm] = useState(false);
    const [editingInspection, setEditingInspection] = useState<any>(null);
    const [showTestForm, setShowTestForm] = useState(false);
    const [editingTest, setEditingTest] = useState<any>(null);
    const [showDefectForm, setShowDefectForm] = useState(false);
    const [editingDefect, setEditingDefect] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const handleRefresh = () => setRefreshKey(k => k + 1);

    // Inspection handlers
    const handleCreateInspection = () => { setEditingInspection(null); setShowInspectionForm(true); };
    const handleEditInspection = (inspection: any) => { setEditingInspection(inspection); setShowInspectionForm(true); };
    const handleCloseInspectionForm = () => { setShowInspectionForm(false); setEditingInspection(null); };

    // Test handlers
    const handleCreateTest = () => { setEditingTest(null); setShowTestForm(true); };
    const handleEditTest = (test: any) => { setEditingTest(test); setShowTestForm(true); };
    const handleCloseTestForm = () => { setShowTestForm(false); setEditingTest(null); };

    // Defect handlers
    const handleCreateDefect = () => { setEditingDefect(null); setShowDefectForm(true); };
    const handleEditDefect = (defect: any) => { setEditingDefect(defect); setShowDefectForm(true); };
    const handleCloseDefectForm = () => { setShowDefectForm(false); setEditingDefect(null); };

    return (
        <div className="quality-control-page" style={{ background: isDark ? '#0f172a' : '#f9fafb', minHeight: '100vh' }}>
            <div className="page-header" style={{ background: isDark ? '#1e293b' : 'white', borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, padding: 24 }}>
                <h1 style={{ color: isDark ? '#f8fafc' : '#1a1a1a', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Quality Control</h1>
                <p style={{ color: isDark ? '#94a3b8' : '#666', fontSize: 14, margin: 0 }}>Manage quality inspections, tests, defects, and templates</p>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: 8, padding: '0 24px', background: isDark ? '#1e293b' : 'white', borderBottom: `2px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>
                {[
                    { id: 'inspections', icon: ClipboardList, label: 'Inspections' },
                    { id: 'tests', icon: FlaskConical, label: 'Quality Tests' },
                    { id: 'defects', icon: AlertTriangle, label: 'Defect Logs' },
                    { id: 'templates', icon: FileText, label: 'Templates' },
                    { id: 'predictions', icon: BrainCircuit, label: 'AI Prediction' },
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'none', border: 'none',
                            borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -2,
                            fontSize: 14, fontWeight: 500, cursor: 'pointer', color: isActive ? '#3b82f6' : (isDark ? '#94a3b8' : '#666'),
                            transition: 'all 0.2s'
                        }}>
                            <Icon size={18} />{tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="tab-content" style={{ background: isDark ? '#0f172a' : '#f9fafb', minHeight: 400 }}>
                {activeTab === 'inspections' && <InspectionList key={refreshKey} onCreate={handleCreateInspection} onEdit={handleEditInspection} />}
                {activeTab === 'tests' && <QualityTestList key={refreshKey} onCreate={handleCreateTest} onEdit={handleEditTest} />}
                {activeTab === 'defects' && <DefectLogList key={refreshKey} onCreate={handleCreateDefect} onEdit={handleEditDefect} />}
                {activeTab === 'templates' && <InspectionTemplateManager key={refreshKey} />}
                {activeTab === 'predictions' && <QualityPredictionView />}
            </div>

            {showInspectionForm && <InspectionForm inspectionId={editingInspection?.id} onClose={handleCloseInspectionForm} onSave={handleRefresh} />}
            {showTestForm && <QualityTestForm testId={editingTest?.id} onClose={handleCloseTestForm} onSave={handleRefresh} />}
            {showDefectForm && <DefectLogForm defectId={editingDefect?.id} onClose={handleCloseDefectForm} onSave={handleRefresh} />}
        </div>
    );
}
