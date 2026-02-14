import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface ConfirmOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'error' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<ConfirmOptions>({});
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const checkConfirm = useCallback((opts: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setOptions(opts);
            setResolveRef(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolveRef) {
            resolveRef(true);
        }
        setResolveRef(null);
    }, [resolveRef]);

    const handleCancel = useCallback(() => {
        if (resolveRef) {
            resolveRef(false);
        }
        setResolveRef(null);
    }, [resolveRef]);

    return (
        <ConfirmContext.Provider value={{ confirm: checkConfirm }}>
            {children}
            <ConfirmDialog
                open={resolveRef !== null}
                title={options.title || 'Are you sure?'}
                message={options.message || 'This action cannot be undone.'}
                confirmText={options.confirmText || 'Yes, Proceed'}
                cancelText={options.cancelText || 'Cancel'}
                severity={options.severity || 'warning'}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};
