import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

type Props = {
    open: boolean;
    title: string;
    name: string;
    onConfirm: () => void;
    onClose: () => void;
    loading?: boolean;
    description?: React.ReactNode;
};

export default function ConfirmDeleteDialog({ open, title, name, onConfirm, onClose, loading, description }: Props) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText component="div">
                    {description ? description : (
                        <>
                            Can i delete the {title.toLowerCase()} "<strong>{name}</strong>"?
                            <br />
                            This action cannot be undone.
                        </>
                    )}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    No
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    autoFocus
                    disabled={loading}
                    sx={{ px: 3 }}
                >
                    {loading ? 'Deleting...' : 'Yes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
