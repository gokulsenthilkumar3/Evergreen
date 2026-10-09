import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { notify } from '../context/NotificationContext';
import { useThemeContext } from '../context/ThemeContext';
import WebAuthnSetup from '../components/WebAuthnSetup';
import SessionManagement from '../components/SessionManagement';
import SessionLogsPage from './settings/SessionLogsPage';
import AppSettingsPage from './settings/AppSettingsPage';
import { useAppSettings } from '../context/AppSettingsContext';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// ============================================
// GSTIN VALIDATION
// ============================================

/**
 * Validates GSTIN format:
 * - 15 characters total
 * - First 2 digits: State code (01-37)
 * - Next 10 characters: PAN (5 letters + 4 digits + 1 letter)
 * - 13th digit: Entity number (1-9, A-Z)
 * - 14th digit: 'Z' (default)
 * - 15th digit: Checksum (alphanumeric)
 */
function validateGSTIN(gstin: string): { valid: boolean; error: string } {
  if (!gstin) {
    return { valid: true, error: '' }; // Allow empty (optional field)
  }

  const trimmed = gstin.toUpperCase().trim();

  // Length check
  if (trimmed.length !== 15) {
    return { valid: false, error: 'GSTIN must be exactly 15 characters' };
  }

  // Full GSTIN regex pattern
  // Format: 22AAAAA0000A1Z5
  const gstinRegex = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z]$/;

  if (!gstinRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid GSTIN format. Expected: 22AAAAA0000A1Z5' };
  }

  // State code validation (01-37, excluding 00)
  const stateCode = parseInt(trimmed.substring(0, 2), 10);
  if (stateCode < 1 || stateCode > 37) {
    return { valid: false, error: 'Invalid state code. Must be between 01 and 37' };
  }

  return { valid: true, error: '' };
}

/**
 * Validate email format and ensure not empty
 */
function validateEmail(email: string): { valid: boolean; error: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Admin email is required' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true, error: '' };
}

export default function SettingsPage() {
  const { mode, toggleTheme } = useThemeContext();
  const { generalSettings, updateGeneralSettings } = useAppSettings();
  const { user, refreshProfile } = useAuth();

  const [settings, setSettings] = useState({
    companyName: '',
    taxId: '',
    email: '',
    notifications: true,
    logoUrl: ''
  });

  const [errors, setErrors] = useState({
    taxId: '',
    email: ''
  });

  // Load initial settings
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      companyName: generalSettings.companyName,
      taxId: generalSettings.taxId,
      email: generalSettings.adminEmail || '',
      logoUrl: generalSettings.logoUrl || ''
    }));
  }, [generalSettings]);

  const [tab, setTab] = useState(0);

  // Validate on field change
  const handleTaxIdChange = (value: string) => {
    setSettings({ ...settings, taxId: value });
    const validation = validateGSTIN(value);
    setErrors(prev => ({ ...prev, taxId: validation.error }));
  };

  const handleEmailChange = (value: string) => {
    setSettings({ ...settings, email: value });
    const validation = validateEmail(value);
    setErrors(prev => ({ ...prev, email: validation.error }));
  };

  const handleSave = async () => {
    // Validate before save
    const gstinValidation = validateGSTIN(settings.taxId);
    const emailValidation = validateEmail(settings.email);

    setErrors({
      taxId: gstinValidation.error,
      email: emailValidation.error
    });

    if (!gstinValidation.valid) {
      notify.showError(`GSTIN Error: ${gstinValidation.error}`);
      return;
    }

    if (!emailValidation.valid) {
      notify.showError(`Email Error: ${emailValidation.error}`);
      return;
    }

    try {
      // Update General Settings (including adminEmail)
      await updateGeneralSettings({
        companyName: settings.companyName,
        taxId: settings.taxId.toUpperCase().trim(),
        adminEmail: settings.email.trim(),
        logoUrl: settings.logoUrl
      });

      notify.showSuccess('Settings saved successfully');
    } catch (e) {
      // Error handling already done in updateGeneralSettings
    }
  };

  return (
    <Box maxWidth="md">
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Settings</Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="General" />
          <Tab label="Security" />
          <Tab label="Session Logs" />
          <Tab label="App Settings" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <GeneralSettings
          settings={settings}
          errors={errors}
          onTaxIdChange={handleTaxIdChange}
          onEmailChange={handleEmailChange}
          setSettings={setSettings}
          handleSave={handleSave}
          mode={mode}
          toggleTheme={toggleTheme}
        />
      )}

      {tab === 1 && (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <WebAuthnSetup />
          <Divider sx={{ my: 4 }} />
          <SessionManagement />
        </Paper>
      )}

      {tab === 2 && (
        <SessionLogsPage />
      )}

      {tab === 3 && (
        <AppSettingsPage />
      )}
    </Box>
  );
}

// Extracted General Settings with validation
interface GeneralSettingsProps {
  settings: {
    companyName: string;
    taxId: string;
    email: string;
    notifications: boolean;
    logoUrl: string;
  };
  errors: {
    taxId: string;
    email: string;
  };
  onTaxIdChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  setSettings: (settings: any) => void;
  handleSave: () => void;
  mode: string;
  toggleTheme: () => void;
}

function GeneralSettings({
  settings,
  errors,
  onTaxIdChange,
  onEmailChange,
  setSettings,
  handleSave,
  mode,
  toggleTheme
}: GeneralSettingsProps) {
  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Company Profile</Typography>
      <Box sx={{ display: 'grid', gap: 2, mb: 4 }}>
        <TextField
          label="Company Name"
          value={settings.companyName}
          onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
          fullWidth
        />

        <Box>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>Organization Logo</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {settings.logoUrl && (
              <Box
                component="img"
                src={settings.logoUrl}
                alt="Logo"
                sx={{
                  height: 60,
                  width: 'auto',
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: '1px solid #ddd',
                  bgcolor: 'white', // Ensure white bg for preview
                  p: 1
                }}
              />
            )}
            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
              Upload Logo
              <input type="file" hidden accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('logo', file);

                try {
                  // We need to access http here. Since this is a sub-component, we can import it or pass it.
                  // Importing http direct is fine as it's a singleton.
                  const { http } = await import('../lib/http');
                  const { data } = await http.post('/app-settings/logo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  setSettings({ ...settings, logoUrl: data.url });
                  notify.showSuccess('Logo uploaded successfully');
                } catch (err) {
                  console.error(err);
                  notify.showError('Failed to upload logo');
                }
              }} />
            </Button>
          </Box>
        </Box>

        <TextField
          label="Tax ID / GSTIN"
          value={settings.taxId}
          onChange={(e) => onTaxIdChange(e.target.value)}
          error={!!errors.taxId}
          helperText={errors.taxId || 'Format: 22AAAAA0000A1Z5 (15 characters)'}
          fullWidth
          inputProps={{
            maxLength: 15,
            style: { textTransform: 'uppercase' }
          }}
          placeholder="e.g., 27AAPFU0939F1ZV"
        />
        <TextField
          label="Admin Email"
          value={settings.email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={!!errors.email}
          helperText={errors.email || 'Required for system notifications'}
          fullWidth
          required
          type="email"
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>Application Preferences</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControlLabel
          control={<Switch checked={settings.notifications} onChange={e => setSettings({ ...settings, notifications: e.target.checked })} />}
          label="Enable Email Notifications"
        />
        <FormControlLabel
          control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
          label="Dark Mode"
        />
      </Box>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Paper>
  );
}
