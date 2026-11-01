import CredentialActionButton from '../components/CredentialActionButton';
import { uiText, useUiLanguage } from "../i18n";
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Fingerprint as PasskeyIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  LockReset as PasswordIcon,
  PhonelinkLock as Phone2faIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import PasskeyManager from '../components/PasskeyManager';
import AccountSecurityActions from '../components/AccountSecurityActions';
import { OidcIdentitySettings } from '../components/OidcAccess';

const SecuritySettings: React.FC = () => {
  useUiLanguage();
  const queryClient = useQueryClient();

  // TOTP States
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [busy, setBusy] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  // Alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: currentUser, isLoading, isError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => (await api.get('/auth/me')).data,
  });

  const handleVerifyTotp = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post('/auth/totp/verify', { code: totpCode });
      setSuccess('Two-Factor Authentication successfully enabled!');
      toast.success(uiText('Two-Factor Authentication enabled', 'feedback'));
      setQrCodeUrl(null);
      setTotpCode('');
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Invalid code');
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      return setError('Please enter your current password.');
    }
    if (!newPassword || newPassword.length < 12 || new TextEncoder().encode(newPassword).length > 72) {
      return setError('Password must contain at least 12 characters and at most 72 UTF-8 bytes');
    }
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }

    setPasswordBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully.');
      toast.success(uiText('Password updated successfully', 'feedback'));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      <AccountSecurityActions />
      <OidcIdentitySettings />
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>
          {uiText("Security & Credentials ")}</Typography>
        <Typography color="text.secondary">
          {uiText("Manage your account password, two-factor authentication (TOTP), and hardware passkeys. ")}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uiText("Could not load your security status. Refresh before making changes. ")}</Alert>
      )}

      {/* Security Status Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {uiText("AUTHENTICATION ROLE ")}</Typography>
                <ShieldIcon color="primary" />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                {currentUser?.role || 'VIEWER'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {uiText("User: @")}{currentUser?.username || '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {uiText("TWO-FACTOR (TOTP) ")}</Typography>
                <Phone2faIcon color={currentUser?.isTotpEnabled ? 'success' : 'action'} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  size="small"
                  label={currentUser?.isTotpEnabled ? uiText("ENABLED") : uiText("DISABLED")}
                  color={currentUser?.isTotpEnabled ? 'success' : 'default'}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {currentUser?.isTotpEnabled
                  ? uiText("Authenticator app active")
                  : uiText("Extra security recommended")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {uiText("PASSKEY CREDENTIALS ")}</Typography>
                <PasskeyIcon color="info" />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                {uiText("FIDO2 / WebAuthn ")}</Typography>
              <Typography variant="caption" color="text.secondary">
                {uiText("Biometric & security keys ")}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack spacing={3}>
        {/* Change Password Card */}
        <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', display: 'flex' }}>
              <PasswordIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {uiText("Change Account Password ")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {uiText("Ensure your account uses a strong password with at least 8 characters. ")}</Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label={uiText("Current Password", 'forms')}
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          edge="end"
                        >
                          {showCurrentPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label={uiText("New Password", 'forms')}
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  helperText={uiText("Minimum 8 characters", 'forms')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowNewPass(!showNewPass)}
                          edge="end"
                        >
                          {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label={uiText("Confirm New Password", 'forms')}
                  type={showNewPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  error={Boolean(confirmPassword && newPassword !== confirmPassword)}
                  helperText={
                    confirmPassword && newPassword !== confirmPassword
                      ? uiText("Passwords do not match", 'forms')
                      : ''
                  }
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              disabled={passwordBusy || !currentPassword || !newPassword}
              sx={{ mt: 2.5 }}
            >
              {passwordBusy ? uiText("Updating Password...") : uiText("Update Password")}
            </Button>
          </Box>
        </Paper>

        {/* Two-Factor Authentication Card */}
        <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark', display: 'flex' }}>
              <Phone2faIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {uiText("Two-Factor Authentication (TOTP) ")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {uiText("Use an authenticator app (Google Authenticator, Authy, 1Password) to generate secure one-time verification codes. ")}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            {currentUser?.isTotpEnabled ? (
              <Stack spacing={2} sx={{ maxWidth: 450 }}>
                <Alert severity="success" icon={<ShieldIcon />}>
                  {uiText("Two-Factor Authentication is currently active on your account. ")}</Alert>
                <Typography variant="body2" color="text.secondary">
                  {uiText('Confirm your password and current authenticator code to disable two-factor authentication.')}</Typography>
                <Stack direction="row" spacing={1.5}>
                  <CredentialActionButton color="error" variant="outlined" label={uiText('Disable 2FA')} endpoint="/auth/totp/disable" onComplete={async()=>{setTotpCode('');setSuccess('Two-factor authentication disabled.');await queryClient.invalidateQueries({queryKey:['currentUser']});}} />
                </Stack>
              </Stack>
            ) : !qrCodeUrl ? (
              <CredentialActionButton variant="contained" startIcon={<Phone2faIcon />} disabled={busy || isLoading || isError} label={uiText('Set Up Authenticator App')} endpoint="/auth/totp/generate" onComplete={data=>{setQrCodeUrl(data.otpauth);setError(null);setSuccess(null);}} />
            ) : (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 500, bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  {uiText("1. Scan QR Code ")}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: '#ffffff', borderRadius: 2, width: 'fit-content', mx: 'auto', mb: 2 }}>
                  <QRCodeSVG value={qrCodeUrl} size={180} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  {uiText("Scan this barcode using Google Authenticator, then enter the 6-digit verification code below: ")}</Typography>

                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
                  <TextField
                    label={uiText("6-digit code", 'forms')}
                    value={totpCode}
                    onChange={(e) =>
                      setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                    sx={{ width: 180 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleVerifyTotp}
                    disabled={busy || !/^\d{6}$/.test(totpCode)}
                  >
                    {uiText("Verify & Enable ")}</Button>
                </Stack>
              </Paper>
            )}
          </Box>
        </Paper>

        {/* Passkeys (WebAuthn) Card */}
        <Paper variant="outlined" sx={{ p: 3.5, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'info.light', color: 'info.dark', display: 'flex' }}>
              <PasskeyIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {uiText("Passkeys & Biometric Security (WebAuthn) ")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {uiText("Log in securely using your device's biometric sensors (Windows Hello, Touch ID, Face ID) or hardware security key (YubiKey). ")}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <CredentialActionButton variant="outlined" startIcon={<PasskeyIcon />} disabled={isLoading || isError} label={uiText('Register New Passkey on this Device')} endpoint="/auth/passkey/register-options" onComplete={async options=>{const response=await startRegistration({optionsJSON:options});await api.post('/auth/passkey/register-verify',response);await queryClient.invalidateQueries({queryKey:['own-passkeys']});setSuccess('Passkey registered successfully!');}} />
            <PasskeyManager />
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
};

export default SecuritySettings;
