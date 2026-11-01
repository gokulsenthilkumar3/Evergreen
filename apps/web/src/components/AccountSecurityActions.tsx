import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { uiText, useUiLanguage } from '../i18n';
import { formatApiError } from '../utils/messages';
export default function AccountSecurityActions() {
  useUiLanguage();
  const [mode,setMode] = useState<'email'|'codes'|null>(null);
  const [password,setPassword] = useState(''), [code,setCode] = useState(''), [email,setEmail] = useState(''), [sender,setSender] = useState('primary');
  const mutation = useMutation<{ codes?: string[] }, unknown>({ gcTime: 0, mutationFn: async () => (await api.post(mode === 'codes' ? '/auth/account/recovery-codes' : '/auth/account/email-change', { currentPassword: password, ...(mode === 'codes' ? (code ? { code } : {}) : { email, sender }) })).data, onSuccess: () => { setPassword(''); setCode(''); } });
  const close = () => { if (!mutation.isPending) { setMode(null); setPassword(''); setCode(''); mutation.reset(); } };
  return <Box sx={{ my: 2 }}>
    <Stack direction="row" gap={1} flexWrap="wrap"><Button variant="outlined" onClick={() => { mutation.reset(); setMode('codes'); }}>{uiText('Generate recovery codes')}</Button><Button variant="outlined" onClick={() => { mutation.reset(); setMode('email'); }}>{uiText('Change verified email')}</Button></Stack>
    <Dialog open={Boolean(mode)} onClose={close} fullWidth maxWidth="sm" aria-labelledby="account-security-action-title">
      <Box component="form" onSubmit={event => { event.preventDefault(); mutation.mutate(); }}>
        <DialogTitle id="account-security-action-title">{uiText(mode === 'codes' ? 'Generate recovery codes' : 'Change verified email')}</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">{uiText(mode === 'codes' ? 'Generating 10 new single-use codes retires all previous codes. Save the new codes offline; they are shown only once.' : 'Your current email remains unchanged until you redeem the confirmation link sent to the new address.')}</Alert>
          {mutation.isSuccess ? mutation.data.codes ? <><Typography variant="body2">{uiText('Store these codes securely before closing.')}</Typography><TextField multiline fullWidth label={uiText('Recovery codes', 'forms')} value={mutation.data.codes.join('\n')} slotProps={{ input: { readOnly: true }, htmlInput: { style: { fontFamily: 'monospace' } } }} /></> : <Alert severity="success">{uiText('Verification email accepted by the mail server. Check your new mailbox.')}</Alert> : <>
            <TextField required type="password" autoComplete="current-password" label={uiText('Current Password', 'forms')} value={password} onChange={event => setPassword(event.target.value)} disabled={mutation.isPending} />
            {mode === 'codes' ? <TextField label={uiText('Authenticator code', 'forms')} value={code} onChange={event => setCode(event.target.value)} helperText={uiText('Required when TOTP is enabled.', 'forms')} slotProps={{ htmlInput: { pattern: '[0-9]{6}', maxLength: 6, inputMode: 'numeric' } }} disabled={mutation.isPending} /> : <>
              <TextField required type="email" label={uiText('New email address', 'forms')} value={email} onChange={event => setEmail(event.target.value)} disabled={mutation.isPending} />
              <TextField select label={uiText('Mail sender', 'forms')} value={sender} onChange={event => setSender(event.target.value)} disabled={mutation.isPending}><MenuItem value="primary">{uiText('Primary sender')}</MenuItem><MenuItem value="secondary">{uiText('Secondary sender')}</MenuItem></TextField>
            </>}
          </>}
          {mutation.isError && <Alert severity="error">{formatApiError(mutation.error,uiText('Account operation failed. Please retry.'))}</Alert>}
        </Stack></DialogContent><DialogActions><Button onClick={close} disabled={mutation.isPending}>{uiText('Close')}</Button>{!mutation.isSuccess && <Button type="submit" disabled={mutation.isPending}>{uiText('Confirm')}</Button>}</DialogActions>
      </Box>
    </Dialog>
  </Box>;
}
