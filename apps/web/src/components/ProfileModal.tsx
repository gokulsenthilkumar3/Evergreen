import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckIcon,
  Devices as DeviceIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';
import type { ThemeName } from '../theme';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
  onUserUpdate?: (user: any) => void;
  mode: 'light' | 'dark';
  onToggleTheme: () => void;
  themeName: ThemeName;
  onThemeChange?: (name: ThemeName) => void;
  language: 'en' | 'ta';
  onToggleLanguage: () => void;
  floatingNav: boolean;
  onFloatingNavChange?: (val: boolean) => void;
  onNavigate?: (page: string) => void;
}

const THEME_OPTIONS: { name: ThemeName; label: string; color: string }[] = [
  { name: 'emerald', label: 'Emerald', color: '#059669' },
  { name: 'forest', label: 'Forest', color: '#2d6a4f' },
  { name: 'mint', label: 'Mint', color: '#00897b' },
  { name: 'sage', label: 'Sage', color: '#558b6e' },
  { name: 'olive', label: 'Olive', color: '#6a7c59' },
];

const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  currentUser,
  onUserUpdate,
  mode,
  onToggleTheme,
  themeName,
  onThemeChange,
  language,
  onToggleLanguage,
  floatingNav,
  onFloatingNavChange,
  onNavigate,
}) => {
  const [tab, setTab] = useState(0);
  const queryClient = useQueryClient();

  // Profile Form
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Fetch full user details from /auth/me
  const { data: meData } = useQuery({
    queryKey: ['authMeDetails'],
    queryFn: async () => (await api.get('/auth/me')).data,
    enabled: open,
  });

  const activeUser = meData || currentUser;

  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name || '');
      setEmail(activeUser.email || '');
    }
  }, [activeUser]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; email?: string }) =>
      api.put('/auth/profile', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['authMeDetails'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      const updated = res.data;
      if (onUserUpdate) onUserUpdate(updated);
      toast.success('Profile details updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.put('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    },
  });

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfileMutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const getRoleColor = (role?: string) => {
    if (role === 'ADMIN') return 'error';
    if (role === 'MODIFIER') return 'primary';
    return 'default';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          overflow: 'hidden',
        },
      }}
    >
      {/* Modal Header */}
      <Box
        sx={{
          p: 3,
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 58,
              height: 58,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 800,
              boxShadow: (t) => t.shadows[4],
            }}
          >
            {(activeUser?.name || activeUser?.username || 'U')?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" fontWeight={800}>
                {activeUser?.name || activeUser?.username}
              </Typography>
              <Chip
                label={activeUser?.role || 'VIEWER'}
                size="small"
                color={getRoleColor(activeUser?.role)}
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.65rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              @{activeUser?.username}
            </Typography>
            {activeUser?.email && (
              <Typography variant="caption" color="text.secondary">
                {activeUser.email}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
          bgcolor: 'action.hover',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
        }}
      >
        <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Profile" />
        <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label="Security" />
        <Tab icon={<PaletteIcon fontSize="small" />} iconPosition="start" label="Preferences" />
      </Tabs>

      <DialogContent sx={{ p: 3 }}>
        {/* Tab 0: Profile */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Display Name"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gokul Senthilkumar"
            />
            <TextField
              label="Email Address"
              fullWidth
              type="email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@evergreen.com"
            />
            <TextField
              label="Username"
              fullWidth
              size="small"
              value={activeUser?.username || ''}
              disabled
              helperText="Usernames cannot be changed after account creation."
            />

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                ACCOUNT ROLE & PERMISSIONS
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {activeUser?.role === 'ADMIN'
                  ? 'Administrator: Full access to all business desks, financial costing, settings, and user management.'
                  : activeUser?.role === 'MODIFIER'
                  ? 'Modifier: Can create and update transactions, records, and operations logs.'
                  : 'Viewer: Read-only access to records and reports.'}
              </Typography>
            </Paper>

            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              sx={{ alignSelf: 'flex-start' }}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </Box>
        )}

        {/* Tab 1: Security */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Change Account Password
            </Typography>
            <TextField
              label="Current Password"
              type={showCurrentPass ? 'text' : 'password'}
              fullWidth
              size="small"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
            <TextField
              label="New Password (min 8 characters)"
              type={showNewPass ? 'text' : 'password'}
              fullWidth
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={
                !currentPassword ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword ||
                changePasswordMutation.isPending
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>

            <Divider sx={{ my: 1 }} />

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SecurityIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      Two-Factor Authentication (TOTP)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activeUser?.isTotpEnabled ? 'Active & Protecting Account' : 'Not configured'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    onClose();
                    onNavigate?.('security');
                  }}
                >
                  Configure
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Tab 2: Preferences */}
        {tab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Theme Palette
            </Typography>
            <Grid container spacing={1.5}>
              {THEME_OPTIONS.map((th) => {
                const selected = themeName === th.name;
                return (
                  <Grid key={th.name} size={{ xs: 6, sm: 4 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => onThemeChange?.(th.name)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: selected ? `2px solid ${th.color}` : '1px solid',
                        borderColor: selected ? th.color : 'divider',
                        bgcolor: selected ? `${th.color}10` : 'transparent',
                        '&:hover': { bgcolor: `${th.color}15` },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: th.color }} />
                        <Typography variant="body2" fontWeight={selected ? 700 : 500}>
                          {th.label}
                        </Typography>
                      </Box>
                      {selected && <CheckIcon sx={{ color: th.color, fontSize: 18 }} />}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="subtitle2" fontWeight={700}>
              Interface & Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={mode === 'dark'}
                    onChange={onToggleTheme}
                    color="primary"
                  />
                }
                label={`Dark Mode (${mode === 'dark' ? 'Enabled' : 'Disabled'})`}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={floatingNav}
                    onChange={(e) => onFloatingNavChange?.(e.target.checked)}
                    color="primary"
                  />
                }
                label="Floating Bottom Navigation Bar (Mobile / Quick access)"
              />
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="subtitle2" fontWeight={700}>
              Language Preference
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant={language === 'en' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  if (language !== 'en') onToggleLanguage();
                }}
              >
                English
              </Button>
              <Button
                variant={language === 'ta' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  if (language !== 'ta') onToggleLanguage();
                }}
              >
                தமிழ் (Tamil)
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;
