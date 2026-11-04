import { uiText, useUiLanguage } from "../../i18n";
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    severity?: 'error' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    severity = 'warning'
}) => {
  useUiLanguage();
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    width: 'min(400px, calc(100vw - 32px))',
                    maxWidth: 'calc(100vw - 32px)',
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {severity === 'error' && <WarningIcon color="error" />}
                {severity === 'warning' && <WarningIcon color="warning" />}
                <Typography component="span" variant="h6" fontWeight="bold">
                    {uiText(title, 'feedback')}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: 'text.primary', fontSize: '1rem' }}>
                    {uiText(message, 'feedback')}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    color="inherit"
                    sx={{ borderRadius: 2 }}
                >
                    {uiText(cancelText, 'feedback')}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={severity === 'error' ? 'error' : 'primary'}
                    autoFocus
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    {uiText(confirmText, 'feedback')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
