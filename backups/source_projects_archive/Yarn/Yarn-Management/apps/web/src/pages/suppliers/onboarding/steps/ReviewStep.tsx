import React from 'react';
import './ReviewStep.css';

interface ReviewStepProps {
    basicInfo: any;
    documents: any[];
    bankDetails: any;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
    basicInfo,
    documents,
    bankDetails,
}) => {
    return (
        <div className="review-step">
            <h3 className="step-heading">Review & Submit</h3>
            <p className="step-description">
                Please review all the information before submitting for approval
            </p>

            <div className="review-sections">
                {/* Basic Information */}
                <div className="review-section">
                    <h4 className="section-title">Basic Information</h4>
                    <div className="review-grid">
                        <div className="review-item">
                            <span className="review-label">Supplier Name:</span>
                            <span className="review-value">{basicInfo.name || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">Email:</span>
                            <span className="review-value">{basicInfo.email || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">Phone:</span>
                            <span className="review-value">{basicInfo.phone || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">Business Type:</span>
                            <span className="review-value">{basicInfo.businessType || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">Supplier Type:</span>
                            <span className="review-value">{basicInfo.supplierType || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">GSTIN:</span>
                            <span className="review-value">{basicInfo.gstin || '-'}</span>
                        </div>
                        {basicInfo.address && (
                            <div className="review-item full-width">
                                <span className="review-label">Address:</span>
                                <span className="review-value">
                                    {basicInfo.address}
                                    {basicInfo.city && `, ${basicInfo.city}`}
                                    {basicInfo.state && `, ${basicInfo.state}`}
                                    {basicInfo.pinCode && ` - ${basicInfo.pinCode}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Documents */}
                <div className="review-section">
                    <h4 className="section-title">Uploaded Documents ({documents.length})</h4>
                    <div className="documents-list-review">
                        {documents.map((doc, index) => (
                            <div key={index} className="document-item-review">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="doc-name">{doc.fileName}</span>
                                <span className="doc-type">{doc.type.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bank Details */}
                <div className="review-section">
                    <h4 className="section-title">Bank & Tax Details</h4>
                    <div className="review-grid">
                        <div className="review-item">
                            <span className="review-label">Account Holder:</span>
                            <span className="review-value">{bankDetails.bankAccountHolderName || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">Bank Name:</span>
                            <span className="review-value">{bankDetails.bankName || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">Account Number:</span>
                            <span className="review-value">
                                {bankDetails.bankAccountNumber
                                    ? `****${bankDetails.bankAccountNumber.slice(-4)}`
                                    : '-'}
                            </span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">IFSC Code:</span>
                            <span className="review-value">{bankDetails.bankIfscCode || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">PAN Number:</span>
                            <span className="review-value">{bankDetails.panNumber || '-'}</span>
                        </div>
                        <div className="review-item">
                            <span className="review-label">GST Number:</span>
                            <span className="review-value">{bankDetails.gstNumber || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="submit-notice">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        clipRule="evenodd"
                    />
                </svg>
                <div>
                    <strong>Ready to Submit?</strong>
                    <p>
                        Once submitted, your application will be reviewed by our team. You'll receive a
                        notification once the review is complete.
                    </p>
                </div>
            </div>
        </div>
    );
};
