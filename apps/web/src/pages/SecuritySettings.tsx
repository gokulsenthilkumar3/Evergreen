import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Alert, Divider } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { startRegistration } from '@simplewebauthn/browser';
import api from '../utils/api';

const SecuritySettings: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerateTotp = async () => {
    try {
      const res = await api.get('/auth/totp/generate');
      setQrCodeUrl(res.data.otpauth);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to generate TOTP');
    }
  };

  const handleVerifyTotp = async () => {
    try {
      await api.post('/auth/totp/verify', { code: totpCode });
      setSuccess('Two-Factor Authentication successfully enabled!');
      setQrCodeUrl(null);
      setTotpCode('');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Invalid code');
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      const res = await api.get('/auth/passkey/register-options');
      const options = res.data;

      const attResp = await startRegistration({ optionsJSON: options });

      await api.post('/auth/passkey/register-verify', attResp);
      setSuccess('Passkey registered successfully!');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to register passkey');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Security Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Two-Factor Authentication (TOTP)</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          Use an authenticator app (like Google Authenticator or Authy) to generate one-time passwords for extra security.
        </Typography>

        {!qrCodeUrl ? (
          <Button variant="contained" onClick={handleGenerateTotp}>
            Setup Authenticator App
          </Button>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <QRCodeSVG value={qrCodeUrl} size={200} />
            <Typography>Scan this QR code with your authenticator app, then enter the 6-digit code below to verify.</Typography>
            <TextField
              label="6-digit code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              sx={{ width: 200 }}
            />
            <Button variant="contained" onClick={handleVerifyTotp} disabled={totpCode.length !== 6}>
              Verify & Enable
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Passkeys (WebAuthn)</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          Log in securely using your device's biometric authentication (Face ID, Touch ID) or a hardware security key.
        </Typography>
        <Button variant="outlined" onClick={handleRegisterPasskey}>
          Register New Passkey
        </Button>
      </Paper>
    </Box>
  );
};

export default SecuritySettings;
