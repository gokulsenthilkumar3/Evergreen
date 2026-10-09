import { useState } from 'react';
import { Button, Box, Typography, Alert, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Fingerprint, VerifiedUser } from '@mui/icons-material';
import { startRegistration } from '@simplewebauthn/browser';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';

export default function WebAuthnSetup() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const registerPasskey = async () => {
        try {
            setLoading(true);
            setSuccess(false);

            // 1. Get options from server
            const { data: options } = await http.post('/auth/webauthn/register/start');

            // 2. Browser interaction
            const attResp = await startRegistration(options);

            // 3. Send response to server
            await http.post('/auth/webauthn/register/finish', attResp);

            setSuccess(true);
            notify.showSuccess('Passkey registered successfully!');
        } catch (error: any) {
            if (error.name === 'InvalidStateError') {
                notify.showError('This device is already registered.');
            } else {
                notify.showError(error.message || 'Failed to register passkey');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Passkeys & Biometrics</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Log in faster and more securely using your device's fingerprint, face recognition, or security key.
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Passkey added successfully!</Alert>}

            <List dense sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                <ListItem>
                    <ListItemIcon><VerifiedUser color="success" /></ListItemIcon>
                    <ListItemText primary="Secure, passwordless login" />
                </ListItem>
                <ListItem>
                    <ListItemIcon><Fingerprint /></ListItemIcon>
                    <ListItemText primary="Supports TouchID, FaceID, Windows Hello" />
                </ListItem>
            </List>

            <Button
                variant="contained"
                startIcon={<Fingerprint />}
                onClick={registerPasskey}
                disabled={loading}
            >
                {loading ? 'Registering...' : 'Add New Passkey'}
            </Button>
        </Box>
    );
}
