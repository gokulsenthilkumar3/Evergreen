import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    LinearProgress,
    Alert
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

interface BulkImportDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entityName: string; // e.g. "Suppliers", "Raw Materials"
    endpoint: string; // e.g. "/suppliers/import"
    templateUrl?: string; // Authenticated API endpoint for a headers-only template
}

export default function BulkImportDialog({
    open,
    onClose,
    onSuccess,
    entityName,
    endpoint,
    templateUrl
}: BulkImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [columns, setColumns] = useState<Array<{ name: string; required: boolean }>>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open || !templateUrl) return;
        let active = true;
        http.get(`${templateUrl}?format=json`).then((response) => {
            if (active) setColumns(response.data.columns || []);
        }).catch(() => { if (active) setColumns([]); });
        return () => { active = false; };
    }, [open, templateUrl]);

    const downloadTemplate = async () => {
        if (!templateUrl) return;
        try {
            const response = await http.get(templateUrl, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${entityName.toLowerCase().replace(/\s+/g, '-')}-template.csv`;
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            setError('Could not download the blank template. Please sign in and try again.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.size > 2 * 1024 * 1024) {
                setFile(null);
                setError('File exceeds the 2 MB import limit.');
            } else {
                setFile(selected);
                setError(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await http.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            notify.showSuccess(`${entityName} imported successfully`);
            onSuccess();
            handleClose();
        } catch (err: any) {
            const rowErrors = err.response?.data?.errors as Array<{ row: number; message: string }> | undefined;
            const details = rowErrors?.slice(0, 8).map((item) => `Row ${item.row}: ${item.message}`).join('; ');
            setError([err.response?.data?.message || 'Import failed. Please check your file format.', details].filter(Boolean).join(' '));
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setUploading(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={!uploading ? handleClose : undefined} maxWidth="sm" fullWidth>
            <DialogTitle>Import {entityName}</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f0f0f0' },
                        mt: 1
                    }}
                    onClick={() => !uploading && inputRef.current?.click()}
                >
                    <input
                        type="file"
                        hidden
                        ref={inputRef}
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                        {file ? file.name : 'Click to select CSV or Excel file'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Supported formats: .csv, .xlsx, .xls · Maximum 2 MB
                    </Typography>
                </Box>

                {uploading && <LinearProgress sx={{ mt: 2 }} />}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {templateUrl && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button onClick={downloadTemplate} size="small">
                            Download blank template
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                            The template has column names only. It contains no sample or existing records.
                        </Typography>
                        {columns.length > 0 && <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Columns: {columns.map((column) => `${column.name}${column.required ? ' *' : ''}`).join(', ')}. * Required
                        </Typography>}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
                <Button
                    onClick={handleUpload}
                    variant="contained"
                    disabled={!file || uploading}
                >
                    {uploading ? 'Importing...' : 'Upload & Import'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
