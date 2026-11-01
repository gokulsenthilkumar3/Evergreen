import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';
import { clearAuth } from '../utils/authStorage';
import { uiText, useUiLanguage } from '../i18n';
import { formatApiError } from '../utils/messages';

const errorText = (error: unknown) => formatApiError(error, uiText('Account operation failed. Please retry.', 'feedback'));
export function RequestPasswordReset() {
  useUiLanguage();
  const [open, setOpen] = useState(false), [email,setEmail] = useState(''), [sender,setSender] = useState('primary');
  const mutation = useMutation({ mutationFn: () => api.post('/auth/account/request-reset', { email, sender }) });
  return <><Button size="small" onClick={() => { mutation.reset(); setOpen(true); }}>{uiText('Forgot password?')}</Button>
    <Dialog open={open} onClose={() => { if (!mutation.isPending) setOpen(false); }} fullWidth maxWidth="sm" aria-labelledby="reset-request-title">
      <Box component="form" onSubmit={event => { event.preventDefault(); mutation.mutate(); }}>
        <DialogTitle id="reset-request-title">{uiText('Request password recovery')}</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">{uiText('If an eligible account exists, a single-use link valid for 15 minutes will be emailed. Your MFA remains required.')}</Typography>
          <TextField required type="email" label={uiText('Email', 'forms')} value={email} onChange={event => setEmail(event.target.value)} disabled={mutation.isPending} />
          <TextField select label={uiText('Mail sender', 'forms')} value={sender} onChange={event => setSender(event.target.value)}><MenuItem value="primary">{uiText('Primary sender')}</MenuItem><MenuItem value="secondary">{uiText('Secondary sender')}</MenuItem></TextField>
          {mutation.isSuccess && <Alert severity="info">{uiText('If an eligible account exists, a recovery email will be sent.')}</Alert>}
          {mutation.isError && <Alert severity="error">{errorText(mutation.error)}</Alert>}
        </Stack></DialogContent><DialogActions><Button disabled={mutation.isPending} onClick={() => setOpen(false)}>{uiText('Close')}</Button><Button type="submit" disabled={mutation.isPending || mutation.isSuccess}>{uiText('Send recovery link')}</Button></DialogActions>
      </Box>
    </Dialog></>;
}

export default function AccountLinkDialog() {
  useUiLanguage();
  const [link,setLink] = useState(() => { const values = new URLSearchParams(window.location.hash.slice(1)); const purpose = values.get('account-action'); const token = values.get('token'); return purpose && ['INVITE','RESET_PASSWORD','VERIFY_EMAIL'].includes(purpose) && token && /^[a-f0-9]{64}$/.test(token) ? { purpose, token } : null; });
  const [password,setPassword] = useState(''), [confirmation,setConfirmation] = useState(''), [code,setCode] = useState(''), [recoveryCode,setRecoveryCode] = useState('');
  useEffect(() => { if (link) window.history.replaceState(null, '', window.location.pathname + window.location.search); }, [link]);
  const onboarding = useMutation({ mutationFn: async () => (await api.post('/auth/account/onboarding', { token: link?.token })).data as { otpauth: string; username: string } });
  const redeem = useMutation({ mutationFn: () => api.post('/auth/account/redeem', { token: link?.token, ...(link?.purpose !== 'VERIFY_EMAIL' ? { password } : {}), ...(code ? { code } : {}), ...(recoveryCode ? { recoveryCode } : {}) }), onSuccess: () => { setPassword(''); setConfirmation(''); setCode(''); setRecoveryCode(''); onboarding.reset(); } });
  if (!link) return null;
  const needsPassword = link.purpose !== 'VERIFY_EMAIL', busy = redeem.isPending || onboarding.isPending;
  return <Dialog open fullWidth maxWidth="sm" aria-labelledby="account-link-title" onClose={() => { if (!busy) setLink(null); }}>
    <Box component="form" onSubmit={event => { event.preventDefault(); if (!needsPassword || password === confirmation) redeem.mutate(); }}>
      <DialogTitle id="account-link-title">{uiText(link.purpose === 'INVITE' ? 'Accept invitation' : link.purpose === 'VERIFY_EMAIL' ? 'Verify email change' : 'Reset password')}</DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        {redeem.isSuccess ? <Alert severity="success">{uiText('Account action completed. Sign in again to continue.')}</Alert> : <>
          {link.purpose === 'INVITE' && <><Alert severity="info">{uiText('Set your password and enroll an authenticator before activating this account.')}</Alert><Button disabled={busy} onClick={() => onboarding.mutate()}>{uiText('Set up authenticator')}</Button>
            {onboarding.data && <><Typography>{onboarding.data.username}</Typography><Box sx={{ alignSelf: 'center', p: 2, bgcolor: 'white' }}><QRCodeSVG value={onboarding.data.otpauth} size={180} /></Box><Typography variant="caption">{uiText('Scan this code with your authenticator app. Never share it.')}</Typography></>}
          </>}
          {needsPassword && <><TextField required type="password" autoComplete="new-password" label={uiText('New Password', 'forms')} value={password} onChange={event => setPassword(event.target.value)} slotProps={{ htmlInput: { minLength: 12, maxLength: 72 } }} disabled={busy} /><TextField required type="password" autoComplete="new-password" label={uiText('Confirm Password', 'forms')} value={confirmation} onChange={event => setConfirmation(event.target.value)} error={Boolean(confirmation && confirmation !== password)} disabled={busy} /></>}
          <TextField label={uiText('Authenticator code', 'forms')} value={code} onChange={event => setCode(event.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]{6}', maxLength: 6 } }} required={link.purpose === 'INVITE'} disabled={busy} />
          {link.purpose !== 'INVITE' && <TextField label={uiText('Recovery code instead of authenticator', 'forms')} value={recoveryCode} onChange={event => setRecoveryCode(event.target.value)} disabled={busy} />}
          <Typography variant="caption">{uiText('Completing this action revokes existing sessions. Authentication codes are required when MFA is enabled.')}</Typography>
          {(redeem.isError || onboarding.isError) && <Alert severity="error">{errorText(redeem.error || onboarding.error)}</Alert>}
        </>}
      </Stack></DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setLink(null)}>{uiText('Close')}</Button>{redeem.isSuccess ? <Button onClick={() => { clearAuth(); window.location.assign('/'); }}>{uiText('Sign In')}</Button> : <Button type="submit" disabled={busy || needsPassword && (!password || password !== confirmation) || link.purpose === 'INVITE' && !onboarding.data}>{uiText('Confirm')}</Button>}</DialogActions>
    </Box>
  </Dialog>;
}
