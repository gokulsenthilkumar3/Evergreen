import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { http } from '../../lib/http';
import PhotoUploader from '../PhotoUploader';

interface ChecklistItem {
    item: string;
    criteria: string;
    result: 'PASS' | 'FAIL' | 'N/A';
    notes?: string;
}

interface InspectionFormProps {
    inspectionId?: string;
    onClose: () => void;
    onSave: () => void;
}

export default function InspectionForm({ inspectionId, onClose, onSave }: InspectionFormProps) {
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [inspectors, setInspectors] = useState<any[]>([]);
    const [rawMaterials, setRawMaterials] = useState<any[]>([]);
    const [productionBatches, setProductionBatches] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        inspectionNumber: '',
        entityType: 'RAW_MATERIAL',
        entityId: '',
        templateId: '',
        inspectorId: '',
        status: 'PENDING',
        result: '',
        notes: '',
        photoUrls: [] as string[],
        checklistItems: [] as ChecklistItem[],
    });

    useEffect(() => {
        fetchDropdownData();
        fetchTemplates();
        fetchInspectors();
        if (inspectionId) {
            fetchInspection();
        }
    }, [inspectionId]);

    const fetchDropdownData = async () => {
        try {
            const [rmRes, batchRes] = await Promise.all([
                http.get('/raw-materials?limit=100'),
                http.get('/manufacturing/batches'),
            ]);
            setRawMaterials(rmRes.data.data || []);
            setProductionBatches(batchRes.data.batches || []);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await http.get('/quality-control/templates?isActive=true');
            setTemplates(response.data.templates);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const fetchInspectors = async () => {
        try {
            const response = await http.get('/users');
            setInspectors(response.data.users || []);
        } catch (error) {
            console.error('Failed to fetch inspectors:', error);
        }
    };

    const fetchInspection = async () => {
        try {
            const response = await http.get(`/quality-control/inspections/${inspectionId}`);
            const inspection = response.data.inspection;
            setFormData({
                inspectionNumber: inspection.inspectionNumber,
                entityType: inspection.entityType,
                entityId: inspection.entityId,
                templateId: inspection.templateId || '',
                inspectorId: inspection.inspectorId || '',
                status: inspection.status,
                result: inspection.result || '',
                notes: inspection.notes || '',
                photoUrls: inspection.photoUrls || [],
                checklistItems: inspection.checklistItems || [],
            });
        } catch (error) {
            console.error('Failed to fetch inspection:', error);
        }
    };

    const handleTemplateChange = async (templateId: string) => {
        setFormData({ ...formData, templateId });

        if (templateId) {
            try {
                const response = await http.get(`/quality-control/templates/${templateId}`);
                const template = response.data.template;
                setFormData(prev => ({
                    ...prev,
                    templateId,
                    checklistItems: template.checklistItems.map((item: any) => ({
                        ...item,
                        result: 'N/A',
                        notes: '',
                    })),
                }));
            } catch (error) {
                console.error('Failed to fetch template:', error);
            }
        }
    };

    const updateChecklistItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.checklistItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, checklistItems: newItems });
    };

    const addChecklistItem = () => {
        setFormData({
            ...formData,
            checklistItems: [
                ...formData.checklistItems,
                { item: '', criteria: '', result: 'N/A', notes: '' },
            ],
        });
    };

    const removeChecklistItem = (index: number) => {
        setFormData({
            ...formData,
            checklistItems: formData.checklistItems.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                templateId: formData.templateId || undefined,
                inspectorId: formData.inspectorId || undefined,
                result: formData.result || undefined,
                checklistItems: formData.checklistItems.map(item => ({
                    item: item.item || '',
                    criteria: item.criteria || '',
                    result: item.result || 'N/A',
                    notes: item.notes || null // Send null if empty/undefined to match new schema
                }))
            };

            if (inspectionId) {
                await http.patch(`/quality-control/inspections/${inspectionId}`, payload);
            } else {
                await http.post('/quality-control/inspections', payload);
            }

            onSave();
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save inspection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{inspectionId ? 'Edit Inspection' : 'New Inspection'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Inspection Number *</label>
                            <input
                                type="text"
                                value={formData.inspectionNumber}
                                onChange={(e) => setFormData({ ...formData, inspectionNumber: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Entity Type *</label>
                            <select
                                value={formData.entityType}
                                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                                required
                            >
                                <option value="RAW_MATERIAL">Raw Material</option>
                                <option value="PRODUCTION_BATCH">Production Batch</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Entity ID *</label>
                            <select
                                value={formData.entityId}
                                onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                                required
                            >
                                <option value="">Select Entity...</option>
                                {formData.entityType === 'RAW_MATERIAL'
                                    ? rawMaterials.map((rm) => (
                                        <option key={rm.id} value={rm.id}>{rm.batchNo} ({rm.materialType})</option>
                                    ))
                                    : productionBatches.map((batch) => (
                                        <option key={batch.id} value={batch.id}>{batch.batchNumber} ({batch.currentStage})</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Template</label>
                            <select
                                value={formData.templateId}
                                onChange={(e) => handleTemplateChange(e.target.value)}
                            >
                                <option value="">Select template...</option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Inspector</label>
                            <select
                                value={formData.inspectorId}
                                onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })}
                            >
                                <option value="">Select inspector...</option>
                                {inspectors.map((inspector) => (
                                    <option key={inspector.id} value={inspector.id}>
                                        {inspector.name || inspector.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status *</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                required
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Result</label>
                            <select
                                value={formData.result}
                                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                            >
                                <option value="">Not determined</option>
                                <option value="PASS">Pass</option>
                                <option value="FAIL">Fail</option>
                                <option value="CONDITIONAL_PASS">Conditional Pass</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form-section">
                        <div className="section-header">
                            <h3>Checklist Items</h3>
                            <button type="button" className="btn-secondary" onClick={addChecklistItem}>
                                Add Item
                            </button>
                        </div>

                        {formData.checklistItems.map((item, index) => (
                            <div key={index} className="checklist-item">
                                <div className="item-grid">
                                    <input
                                        type="text"
                                        placeholder="Item"
                                        value={item.item}
                                        onChange={(e) => updateChecklistItem(index, 'item', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Criteria"
                                        value={item.criteria}
                                        onChange={(e) => updateChecklistItem(index, 'criteria', e.target.value)}
                                    />
                                    <select
                                        value={item.result}
                                        onChange={(e) => updateChecklistItem(index, 'result', e.target.value)}
                                    >
                                        <option value="N/A">N/A</option>
                                        <option value="PASS">Pass</option>
                                        <option value="FAIL">Fail</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="btn-icon btn-danger"
                                        onClick={() => removeChecklistItem(index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Notes (optional)"
                                    value={item.notes || ''}
                                    onChange={(e) => updateChecklistItem(index, 'notes', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-section">
                        <h3>Photos</h3>
                        <PhotoUploader
                            value={formData.photoUrls}
                            onChange={(urls) => setFormData({ ...formData, photoUrls: urls })}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Inspection'}
                        </button>
                    </div>
                </form>

                <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .close-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #6b7280;
          }

          .close-btn:hover {
            color: #1f2937;
          }

          form {
            padding: 24px;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          label {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }

          input, select, textarea {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
          }

          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-section {
            margin: 24px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .section-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .checklist-item {
            background: white;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 12px;
          }

          .item-grid {
            display: grid;
            grid-template-columns: 1fr 1fr auto auto;
            gap: 8px;
            margin-bottom: 8px;
          }

          .btn-secondary {
            padding: 8px 16px;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
          }

          .btn-secondary:hover {
            background: #f9fafb;
          }

          .btn-icon {
            padding: 8px;
            background: #f3f4f6;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .btn-icon.btn-danger:hover {
            background: #fee2e2;
            color: #dc2626;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }

          .btn-primary {
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }

          .btn-primary:hover:not(:disabled) {
            background: #2563eb;
          }

          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
            </div>
        </div>
    );
}
