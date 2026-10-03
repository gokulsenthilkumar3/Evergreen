import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wizard, WizardNavigation } from '../../../components/common/Wizard';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { DocumentUploadStep } from './steps/DocumentUploadStep';
import { BankDetailsStep } from './steps/BankDetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { useNotification } from '../../../context/NotificationContext';
import './SupplierOnboardingPage.css';

interface OnboardingData {
    basicInfo: any;
    documents: any[];
    bankDetails: any;
}

export const SupplierOnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [onboardingData, setOnboardingData] = useState<OnboardingData>({
        basicInfo: {
            name: '',
            email: '',
            phone: '',
            businessType: '',
            supplierType: '',
            gstin: '',
            address: '',
            city: '',
            state: '',
            pinCode: '',
        },
        documents: [],
        bankDetails: {
            bankName: '',
            bankAccountNumber: '',
            bankIfscCode: '',
            bankAccountHolderName: '',
            bankBranchName: '',
            bankUpiId: '',
            panNumber: '',
            gstNumber: '',
        },
    });

    const steps = [
        { number: 1, title: 'Basic Info', completed: currentStep > 1 },
        { number: 2, title: 'Documents', completed: currentStep > 2 },
        { number: 3, title: 'Bank Details', completed: currentStep > 3 },
        { number: 4, title: 'Review', completed: false },
    ];

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                const { name, email, phone, businessType, supplierType } = onboardingData.basicInfo;
                if (!name || !email || !phone || !businessType || !supplierType) {
                    showError('Please fill in all required fields');
                    return false;
                }
                return true;
            case 2:
                const requiredDocs = ['GST_CERTIFICATE', 'PAN_CARD', 'BANK_PROOF'];
                const uploadedTypes = onboardingData.documents.map((d) => d.type);
                const missing = requiredDocs.filter((type) => !uploadedTypes.includes(type));
                if (missing.length > 0) {
                    showError('Please upload all required documents');
                    return false;
                }
                return true;
            case 3:
                // Bank details are optional
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);
        try {
            // Step 1: Create supplier with basic info
            const supplierResponse = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ...onboardingData.basicInfo,
                    registeredAddressLine1: onboardingData.basicInfo.address,
                    registeredCity: onboardingData.basicInfo.city,
                    registeredState: onboardingData.basicInfo.state,
                    registeredPinCode: onboardingData.basicInfo.pinCode,
                }),
            });

            if (!supplierResponse.ok) throw new Error('Failed to create supplier');
            const { supplier } = await supplierResponse.json();

            // Step 2: Upload documents
            for (const doc of onboardingData.documents) {
                if (doc.file) {
                    const formData = new FormData();
                    formData.append('file', doc.file);
                    formData.append('type', doc.type);
                    if (doc.expiryDate) formData.append('expiryDate', doc.expiryDate);

                    await fetch(`/api/suppliers/onboarding/${supplier.id}/documents`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: formData,
                    });
                }
            }

            // Step 3: Save bank details
            if (onboardingData.bankDetails.bankAccountNumber) {
                await fetch(`/api/suppliers/${supplier.id}/account`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(onboardingData.bankDetails),
                });
            }

            // Step 4: Submit for approval
            await fetch(`/api/suppliers/onboarding/${supplier.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            showSuccess('Supplier onboarding submitted successfully! Awaiting approval.');
            navigate('/suppliers');
        } catch (error: any) {
            console.error('Onboarding error:', error);
            showError(error.message || 'Failed to submit onboarding. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInfoStep
                        data={onboardingData.basicInfo}
                        onChange={(data) => setOnboardingData({ ...onboardingData, basicInfo: data })}
                    />
                );
            case 2:
                return (
                    <DocumentUploadStep
                        documents={onboardingData.documents}
                        onChange={(docs) => setOnboardingData({ ...onboardingData, documents: docs })}
                    />
                );
            case 3:
                return (
                    <BankDetailsStep
                        data={onboardingData.bankDetails}
                        onChange={(data) => setOnboardingData({ ...onboardingData, bankDetails: data })}
                    />
                );
            case 4:
                return (
                    <ReviewStep
                        basicInfo={onboardingData.basicInfo}
                        documents={onboardingData.documents}
                        bankDetails={onboardingData.bankDetails}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="supplier-onboarding-page">
            <div className="page-header">
                <h1>Supplier Onboarding</h1>
                <p>Complete the following steps to register as a supplier</p>
            </div>

            <Wizard steps={steps} currentStep={currentStep}>
                {renderStep()}
                <WizardNavigation
                    onBack={handleBack}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    isFirstStep={currentStep === 1}
                    isLastStep={currentStep === 4}
                    submitDisabled={isSubmitting}
                    submitLabel={isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                />
            </Wizard>
        </div>
    );
};
