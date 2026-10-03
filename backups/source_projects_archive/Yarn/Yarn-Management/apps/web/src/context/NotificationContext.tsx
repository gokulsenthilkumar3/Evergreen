import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle, AlertColor } from '@mui/material';

type NotificationContextType = {
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Global function to be called from non-react files
export let notify: NotificationContextType = {
    showError: () => { },
    showSuccess: () => { },
    showWarning: () => { },
    showInfo: () => { },
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');

    const show = useCallback((msg: string, sev: AlertColor) => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    }, []);

    const showError = useCallback((msg: string) => show(msg, 'error'), [show]);
    const showSuccess = useCallback((msg: string) => show(msg, 'success'), [show]);
    const showWarning = useCallback((msg: string) => show(msg, 'warning'), [show]);
    const showInfo = useCallback((msg: string) => show(msg, 'info'), [show]);

    // Set the global notify object
    notify = { showError, showSuccess, showWarning, showInfo };

    const handleClose = () => setOpen(false);

    const getTitle = () => {
        switch (severity) {
            case 'error': return 'System Error';
            case 'success': return 'Action Successful';
            case 'warning': return 'Attention Required';
            default: return 'Information';
        }
    };

    return (
        <NotificationContext.Provider value={{ showError, showSuccess, showWarning, showInfo }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 7 }} // Shift down slightly to not cover header if needed
            >
                <Alert onClose={handleClose} severity={severity} sx={{ width: '400px', boxShadow: 3 }} variant="filled">
                    <AlertTitle sx={{ fontWeight: 'bold' }}>{getTitle()}</AlertTitle>
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
