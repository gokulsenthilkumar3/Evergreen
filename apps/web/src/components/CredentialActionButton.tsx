import { useState, type ReactNode } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, type ButtonProps } from '@mui/material';
import api from '../utils/api';
import { uiText, useUiLanguage } from '../i18n';
import { formatApiError } from '../utils/messages';

/** Collect step-up credentials only for the current action; never persist them. */
export default function CredentialActionButton({ endpoint, method = 'post', label, onComplete, ...buttonProps }: Omit<ButtonProps, 'onClick' | 'children'> & {
  endpoint: string; method?: 'post' | 'delete'; label: ReactNode; onComplete?: (data: any) => Promise<void> | void;
}) {
  useUiLanguage();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => { setOpen(false); setPassword(''); setCode(''); setError(null); };
  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const body = { currentPassword: password, ...(code ? { code } : {}) };
      const response = method === 'delete' ? await api.delete(endpoint, { data: body }) : await api.post(endpoint, body);
      setPassword(''); setCode('');
      await onComplete?.(response.data);
      close();
    } catch (failure) { setError(formatApiError(failure)); }
    finally { setBusy(false); }
  };
  return <><Button {...buttonProps} onClick={() => setOpen(true)}>{label}</Button>
    <Dialog open={open} onClose={() => { if (!busy) close(); }} fullWidth maxWidth="xs">
      <DialogTitle>{label}</DialogTitle>
      <DialogContent><Stack component="form" id="credential-action" spacing={2} sx={{ pt: 1 }} onSubmit={event => { event.preventDefault(); void submit(); }}>
        <Alert severity="info">{uiText('Confirm with your current password and authenticator code if two-factor authentication is enabled. Other sessions may be signed out when authenticator settings change.')}</Alert>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoFocus required type="password" autoComplete="current-password" label={uiText('Current password', 'forms')} value={password} disabled={busy} onChange={event => setPassword(event.target.value)} />
        <TextField label={uiText('Authenticator code', 'forms')} autoComplete="one-time-code" value={code} disabled={busy} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6 } }} />
      </Stack></DialogContent>
      <DialogActions><Button disabled={busy} onClick={close}>{uiText('Cancel')}</Button><Button type="submit" form="credential-action" disabled={busy || !password || !!code && code.length !== 6}>{uiText('Confirm')}</Button></DialogActions>
    </Dialog>
  </>;
}
