import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uiText, useUiLanguage } from '../i18n';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { formatApiError } from '../utils/messages';

export default function UserLifecycleControls({ userId, status = 'ACTIVE', ownAccount, reason: previousReason }: { userId: number; status?: string; ownAccount: boolean; reason?: string }) {
  useUiLanguage();
  const [next, setNext] = useState('');
  const [reason, setReason] = useState('');
  const client = useQueryClient();
  const { confirm } = useConfirm();
  const options: Record<string, string[]> = { ACTIVE: ['SUSPENDED','DISABLED','DELETED'], PENDING: ['ACTIVE','DISABLED','DELETED'], SUSPENDED: ['ACTIVE','DISABLED','DELETED'], DISABLED: ['ACTIVE','DELETED'], DELETED: ['ACTIVE'] };
  const mutation = useMutation({ mutationFn: () => api.post(`/users/${userId}/status`, { status: next, reason: reason.trim() }), onSuccess: async () => { setReason(''); setNext(''); await client.invalidateQueries({ queryKey: ['users'] }); await client.invalidateQueries({ queryKey: ['user-security', userId] }); } });
  return <Box sx={{ mt: 3 }}>
    <Typography component="h3" variant="subtitle1" fontWeight={700}>{uiText('Account lifecycle')}</Typography>
    <Typography variant="body2">{uiText('Status')}: {uiText(status)}</Typography>
    {previousReason && <Typography variant="body2">{previousReason}</Typography>}
    <Alert severity="info" sx={{ my: 1 }}>{uiText('Deactivation revokes sessions. Deletion retains the account and history; restoration requires a free licence seat.')}</Alert>
    {ownAccount ? <Typography variant="body2">{uiText('Another administrator must change your account status.')}</Typography> : <Stack spacing={1.5}>
      <TextField select size="small" label={uiText('New account status', 'forms')} value={next} onChange={event => setNext(event.target.value)} disabled={mutation.isPending}>
        {(options[status] || []).map(value => <MenuItem key={value} value={value}>{uiText(value)}</MenuItem>)}
      </TextField>
      <TextField size="small" label={uiText('Status change reason', 'forms')} value={reason} onChange={event => setReason(event.target.value)} slotProps={{ htmlInput: { maxLength: 500 } }} disabled={mutation.isPending} />
      <Button disabled={!next || reason.trim().length < 5 || mutation.isPending} color={next === 'ACTIVE' ? 'primary' : 'error'} onClick={async () => { if (await confirm({ title: uiText('Change account status'), message: uiText('Apply this account status? Deactivation immediately revokes access. Records will be retained.'), severity: 'warning', confirmText: uiText('Confirm'), cancelText: uiText('Cancel') })) mutation.mutate(); }}>{uiText('Apply account status')}</Button>
    </Stack>}
    {mutation.isError && <Alert severity="error">{formatApiError(mutation.error,uiText('Could not change account status.'))}</Alert>}
    {mutation.isSuccess && <Alert severity="success">{uiText('Account status updated.')}</Alert>}
  </Box>;
}
