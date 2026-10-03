import React from 'react';
import './BasicInfoStep.css';

interface BankDetailsData {
    bankName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankAccountHolderName?: string;
    bankBranchName?: string;
    bankUpiId?: string;
    panNumber?: string;
    gstNumber?: string;
}

interface BankDetailsStepProps {
    data: BankDetailsData;
    onChange: (data: BankDetailsData) => void;
}

export const BankDetailsStep: React.FC<BankDetailsStepProps> = ({ data, onChange }) => {
    const handleChange = (field: keyof BankDetailsData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="basic-info-step">
            <h3 className="step-heading">Bank & Tax Details</h3>
            <p className="step-description">
                Please provide your banking and tax information for payments
            </p>

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="bankAccountHolderName">Account Holder Name</label>
                    <input
                        type="text"
                        id="bankAccountHolderName"
                        value={data.bankAccountHolderName || ''}
                        onChange={(e) => handleChange('bankAccountHolderName', e.target.value)}
                        placeholder="Enter account holder name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bankName">Bank Name</label>
                    <input
                        type="text"
                        id="bankName"
                        value={data.bankName || ''}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                        placeholder="Enter bank name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bankAccountNumber">Account Number</label>
                    <input
                        type="text"
                        id="bankAccountNumber"
                        value={data.bankAccountNumber || ''}
                        onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                        placeholder="Enter account number"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bankIfscCode">IFSC Code</label>
                    <input
                        type="text"
                        id="bankIfscCode"
                        value={data.bankIfscCode || ''}
                        onChange={(e) => handleChange('bankIfscCode', e.target.value.toUpperCase())}
                        placeholder="ABCD0123456"
                        maxLength={11}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bankBranchName">Branch Name</label>
                    <input
                        type="text"
                        id="bankBranchName"
                        value={data.bankBranchName || ''}
                        onChange={(e) => handleChange('bankBranchName', e.target.value)}
                        placeholder="Enter branch name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bankUpiId">UPI ID (Optional)</label>
                    <input
                        type="text"
                        id="bankUpiId"
                        value={data.bankUpiId || ''}
                        onChange={(e) => handleChange('bankUpiId', e.target.value)}
                        placeholder="example@upi"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="panNumber">PAN Number</label>
                    <input
                        type="text"
                        id="panNumber"
                        value={data.panNumber || ''}
                        onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gstNumber">GST Number</label>
                    <input
                        type="text"
                        id="gstNumber"
                        value={data.gstNumber || ''}
                        onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                    />
                </div>
            </div>

            <div className="info-box">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                    />
                </svg>
                <span>
                    All banking information will be encrypted and stored securely. This information is
                    required for processing payments.
                </span>
            </div>
        </div>
    );
};
