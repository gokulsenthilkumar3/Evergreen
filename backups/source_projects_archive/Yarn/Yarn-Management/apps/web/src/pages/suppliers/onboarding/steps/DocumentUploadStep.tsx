import React, { useState, useRef } from 'react';
import './DocumentUploadStep.css';

interface Document {
    id?: string;
    type: string;
    fileName: string;
    fileUrl?: string;
    file?: File;
    expiryDate?: string;
    status?: string;
}

interface DocumentUploadStepProps {
    documents: Document[];
    onChange: (documents: Document[]) => void;
}

const DOCUMENT_TYPES = [
    { value: 'GST_CERTIFICATE', label: 'GST Certificate', required: true },
    { value: 'PAN_CARD', label: 'PAN Card', required: true },
    { value: 'BANK_PROOF', label: 'Bank Account Proof', required: true },
    { value: 'TRADE_LICENSE', label: 'Trade License', required: false },
    { value: 'MSME_CERTIFICATE', label: 'MSME Certificate', required: false },
    { value: 'OTHER', label: 'Other Document', required: false },
];

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
    documents,
    onChange,
}) => {
    const [selectedType, setSelectedType] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedType) return;

        const newDocument: Document = {
            type: selectedType,
            fileName: file.name,
            file,
            expiryDate: expiryDate || undefined,
            status: 'PENDING',
        };

        onChange([...documents, newDocument]);

        // Reset form
        setSelectedType('');
        setExpiryDate('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        onChange(documents.filter((_, i) => i !== index));
    };

    const requiredDocs = DOCUMENT_TYPES.filter((dt) => dt.required);
    const uploadedTypes = documents.map((d) => d.type);
    const missingRequired = requiredDocs.filter((dt) => !uploadedTypes.includes(dt.value));

    return (
        <div className="document-upload-step">
            <h3 className="step-heading">Document Upload</h3>
            <p className="step-description">
                Please upload the required documents. Accepted formats: PDF, JPG, PNG (Max 10MB)
            </p>

            {missingRequired.length > 0 && (
                <div className="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>
                        Missing required documents: {missingRequired.map((d) => d.label).join(', ')}
                    </span>
                </div>
            )}

            <div className="upload-section">
                <div className="upload-form">
                    <div className="form-group">
                        <label htmlFor="docType">Document Type</label>
                        <select
                            id="docType"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">Select document type</option>
                            {DOCUMENT_TYPES.map((dt) => (
                                <option key={dt.value} value={dt.value}>
                                    {dt.label} {dt.required && '*'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date (Optional)</label>
                        <input
                            type="date"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fileUpload">Choose File</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="fileUpload"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileSelect}
                            disabled={!selectedType}
                        />
                    </div>
                </div>
            </div>

            {documents.length > 0 && (
                <div className="documents-list">
                    <h4>Uploaded Documents ({documents.length})</h4>
                    <div className="documents-grid">
                        {documents.map((doc, index) => (
                            <div key={index} className="document-card">
                                <div className="document-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM7 10H17V8H7V10ZM5 22C4.45 22 3.979 21.804 3.587 21.412C3.195 21.02 2.999 20.549 3 20V4C3 3.45 3.196 2.979 3.588 2.587C3.98 2.195 4.451 1.999 5 2H14L21 9V20C21 20.55 20.804 21.021 20.412 21.413C20.02 21.805 19.549 22.001 19 22H5Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                                <div className="document-info">
                                    <div className="document-name">{doc.fileName}</div>
                                    <div className="document-type">
                                        {DOCUMENT_TYPES.find((dt) => dt.value === doc.type)?.label}
                                    </div>
                                    {doc.expiryDate && (
                                        <div className="document-expiry">Expires: {doc.expiryDate}</div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="btn-remove"
                                    aria-label="Remove document"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
