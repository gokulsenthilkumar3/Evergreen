import React from 'react';
import './Wizard.css';

interface WizardStep {
    number: number;
    title: string;
    completed: boolean;
}

interface WizardProps {
    steps: WizardStep[];
    currentStep: number;
    onStepClick?: (step: number) => void;
    children: React.ReactNode;
}

export const Wizard: React.FC<WizardProps> = ({ steps, currentStep, onStepClick, children }) => {
    return (
        <div className="wizard-container">
            <div className="wizard-steps">
                {steps.map((step, index) => (
                    <div
                        key={step.number}
                        className={`wizard-step ${currentStep === step.number ? 'active' : ''} ${step.completed ? 'completed' : ''
                            } ${currentStep > step.number ? 'past' : ''}`}
                        onClick={() => onStepClick && onStepClick(step.number)}
                    >
                        <div className="step-number">
                            {step.completed ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M16.6667 5L7.50004 14.1667L3.33337 10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                step.number
                            )}
                        </div>
                        <div className="step-title">{step.title}</div>
                        {index < steps.length - 1 && <div className="step-connector" />}
                    </div>
                ))}
            </div>
            <div className="wizard-content">{children}</div>
        </div>
    );
};

interface WizardNavigationProps {
    onBack?: () => void;
    onNext?: () => void;
    onSubmit?: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    nextDisabled?: boolean;
    submitDisabled?: boolean;
    nextLabel?: string;
    submitLabel?: string;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
    onBack,
    onNext,
    onSubmit,
    isFirstStep,
    isLastStep,
    nextDisabled = false,
    submitDisabled = false,
    nextLabel = 'Next',
    submitLabel = 'Submit',
}) => {
    return (
        <div className="wizard-navigation">
            {!isFirstStep && (
                <button type="button" onClick={onBack} className="btn btn-secondary">
                    Back
                </button>
            )}
            <div className="wizard-nav-right">
                {!isLastStep ? (
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={nextDisabled}
                        className="btn btn-primary"
                    >
                        {nextLabel}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitDisabled}
                        className="btn btn-success"
                    >
                        {submitLabel}
                    </button>
                )}
            </div>
        </div>
    );
};
