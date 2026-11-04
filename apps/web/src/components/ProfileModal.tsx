import { uiText, useUiLanguage } from "../i18n";
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
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Translate as LanguageIcon,
  Visibility,
  VisibilityOff,
  Devices as DeviceIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';
import TamilOptions from './TamilOptions';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
  onUserUpdate?: (user: any) => void;
  language: 'en' | 'ta';
  onToggleLanguage: () => void;
  onNavigate?: (page: string) => void;
}


const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  currentUser,
  onUserUpdate,
  language,
  onToggleLanguage,
  onNavigate,
}) => {
  useUiLanguage();
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
      toast.success(uiText('Profile details updated successfully', 'feedback'));
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to update profile', 'feedback'));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.put('/auth/change-password', data),
    onSuccess: () => {
      toast.success(uiText('Password changed successfully', 'feedback'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      toast.error(uiText(err?.response?.data?.message || 'Failed to change password', 'feedback'));
    },
  });

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error(uiText('Name cannot be empty', 'feedback'));
      return;
    }
    updateProfileMutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error(uiText('Current password is required', 'feedback'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(uiText('New password must be at least 8 characters long', 'feedback'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(uiText('New password and confirmation do not match', 'feedback'));
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
        <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label={uiText("Profile", 'tabs')} />
        <Tab icon={<LockIcon fontSize="small" />} iconPosition="start" label={uiText("Security", 'tabs')} />
        <Tab icon={<LanguageIcon fontSize="small" />} iconPosition="start" label={uiText("Preferences", 'tabs')} />
      </Tabs>

      <DialogContent sx={{ p: 3 }}>
        {/* Tab 0: Profile */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label={uiText("Display Name", 'forms')}
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={uiText("e.g. Gokul Senthilkumar", 'forms')}
            />
            <TextField
              label={uiText("Email Address", 'forms')}
              fullWidth
              type="email"
              size="small"
              value={email}
              disabled
              helperText={uiText('Email changes require mailbox verification in Security Settings', 'forms')}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={uiText("user@evergreen.com", 'forms')}
            />
            {onNavigate && <Button size="small" onClick={() => { onClose(); onNavigate('security'); }}>{uiText('Change verified email')}</Button>}
            <TextField
              label={uiText("Username", 'forms')}
              fullWidth
              size="small"
              value={activeUser?.username || ''}
              disabled
              helperText={uiText("Usernames cannot be changed after account creation.", 'forms')}
            />

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                {uiText("ACCOUNT ROLE & PERMISSIONS ")}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {activeUser?.role === 'ADMIN'
                  ? uiText("Administrator: Full access to all business desks, financial costing, settings, and user management.")
                  : activeUser?.role === 'MODIFIER'
                  ? uiText("Modifier: Can create and update transactions, records, and operations logs.")
                  : uiText("Viewer: Read-only access to records and reports.")}
              </Typography>
            </Paper>

            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              sx={{ alignSelf: 'flex-start' }}
            >
              {updateProfileMutation.isPending ? uiText("Saving...") : uiText("Save Profile Changes")}
            </Button>
          </Box>
        )}

        {/* Tab 1: Security */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {uiText("Change Account Password ")}</Typography>
            <TextField
              label={uiText("Current Password", 'forms')}
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
              label={uiText("New Password (min 8 characters)", 'forms')}
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
              label={uiText("Confirm New Password", 'forms')}
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
              {changePasswordMutation.isPending ? uiText("Updating...") : uiText("Update Password")}
            </Button>

            <Divider sx={{ my: 1 }} />

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SecurityIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {uiText("Two-Factor Authentication (TOTP) ")}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activeUser?.isTotpEnabled ? uiText("Active & Protecting Account") : uiText("Not configured")}
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
                  {uiText("Configure ")}</Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Tab 2: Preferences */}
        {tab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {uiText("Language Preference ")}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant={language === 'en' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  if (language !== 'en') onToggleLanguage();
                }}
              >
                {uiText("English ")}</Button>
              <Button
                variant={language === 'ta' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  if (language !== 'ta') onToggleLanguage();
                }}
              >
                {uiText("தமிழ் (Tamil) ")}</Button>
            </Box>
            {language === 'ta' && <TamilOptions />}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          {uiText("Close ")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;
