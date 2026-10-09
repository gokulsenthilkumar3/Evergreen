import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip
} from '@mui/material';
import { useState } from 'react';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Hardcoded initial roles (policies)
const INITIAL_ROLES = [
    { id: '1', name: 'ADMIN', description: 'Full access to all modules and settings.', isSystem: true },
    { id: '2', name: 'MANAGER', description: 'Can manage most modules but cannot access critical settings.', isSystem: false },
    { id: '3', name: 'USER', description: 'Standard access for day-to-day operations.', isSystem: false },
    { id: '4', name: 'VIEWER', description: 'Read-only access to specific dashboards.', isSystem: false },
];

export default function RoleManagement() {
    const [roles, setRoles] = useState(INITIAL_ROLES);
    const [open, setOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleOpen = (role?: any) => {
        if (role) {
            setCurrentRole(role);
            setFormData({ name: role.name, description: role.description });
        } else {
            setCurrentRole(null);
            setFormData({ name: '', description: '' });
        }
        setOpen(true);
    };

    const handleSave = () => {
        if (currentRole) {
            // Edit
            setRoles(roles.map(r => r.id === currentRole.id ? { ...r, ...formData } : r));
        } else {
            // Add
            setRoles([...roles, { id: Date.now().toString(), ...formData, isSystem: false }]);
        }
        setOpen(false);
    };

    const handleDelete = (id: string) => {
        setRoles(roles.filter(r => r.id !== id));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" color="primary">Access Policies & Roles</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" onClick={() => handleOpen()}>
                    Create Policy
                </Button>
            </Box>

            <Grid container spacing={3}>
                {roles.map((role) => (
                    <Grid item xs={12} md={6} key={role.id}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <VerifiedUserIcon color="primary" />
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {role.name}
                                    </Typography>
                                    {role.isSystem && <Chip label="SYSTEM" size="small" color="info" sx={{ fontSize: '0.6rem', height: 20 }} />}
                                </Box>
                                {!role.isSystem && (
                                    <Box>
                                        <IconButton size="small" onClick={() => handleOpen(role)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(role.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {role.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Role Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{currentRole ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        margin="dense"
                        label="Role Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                        helperText="e.g. AUDITOR, SUPERVISOR"
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save Policy</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
