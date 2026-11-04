import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { formatUiNumber, uiDateLocale, uiScopedTemplate, uiText, useUiLanguage } from '../i18n';

interface SecurityDetails {
  isTotpEnabled: boolean;
  credentials: { id: string; deviceType: string; backedUp: boolean; createdAt: string; lastUsed: string }[];
  sessions: { id: string; device: string | null; userAgent: string | null; ipAddress: string | null; isValid: boolean; createdAt: string; lastActive: string }[];
  _count: { sessions: number };
  activity: { id: number; action: string; module: string; username: string; details: string; createdAt: string }[];
}

export default function UserSecurityInspector({ userId, username }: { userId: number; username: string }) {
  useUiLanguage();
  const [reason, setReason] = useState('');
  const client = useQueryClient();
  const { confirm } = useConfirm();
  const query = useQuery<SecurityDetails>({ queryKey: ['user-security', userId], queryFn: async () => (await api.get(`/users/${userId}/security`)).data, staleTime: 0 });
  const revoke = useMutation({
    mutationFn: async (sessionId?: string) => sessionId ? api.delete(`/sessions/${sessionId}/revoke`) : api.post(`/users/${userId}/revoke-sessions`, { reason: reason.trim() }),
    onSuccess: () => { setReason(''); void client.invalidateQueries({ queryKey: ['user-security', userId] }); void client.invalidateQueries({ queryKey: ['sessions'] }); },
  });
  const requestRevoke = async (sessionId?: string) => {
    if (await confirm({ title: uiText('Revoke sessions'), message: uiScopedTemplate('feedback')`Sign out ${username}? Revoked sessions cannot be reused. This may include your current session.`, severity: 'warning', confirmText: uiText('Revoke'), cancelText: uiText('Cancel') })) revoke.mutate(sessionId);
  };
  const stamp = (value: string) => new Date(value).toLocaleString(uiDateLocale());
  return <Box sx={{ mt: 3 }}>
    <Divider sx={{ mb: 2 }} />
    <Stack direction="row" alignItems="center" justifyContent="space-between"><Typography component="h3" variant="subtitle1" fontWeight={700}>{uiText('Security and sessions')}</Typography><Button disabled={query.isFetching || revoke.isPending} onClick={() => void query.refetch()}>{uiText('Refresh')}</Button></Stack>
    {query.isPending && <CircularProgress size={24} aria-label={uiText('Loading security details')} />}
    {query.isError && <Alert severity="error">{uiText('Could not load security details. Use Refresh to retry.')}</Alert>}
    {revoke.isError && <Alert severity="error">{uiText('Session revocation failed. Please retry.')}</Alert>}
    {revoke.isSuccess && <Alert severity="success">{uiText('Session revocation recorded.')}</Alert>}
    {query.data && <>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ my: 1 }}><Chip label={uiText(query.data.isTotpEnabled ? 'TOTP enabled' : 'TOTP not enabled')} /><Chip label={uiScopedTemplate('tables')`${formatUiNumber(query.data.credentials.length)} passkeys`} /></Stack>
      {query.data.credentials.map(key => <Typography key={key.id} variant="body2" sx={{ my: 1 }}>{uiText('Passkey')} · {key.deviceType} · {uiText(key.backedUp ? 'Backed up' : 'Not backed up')} · {uiText('Last used')}: {stamp(key.lastUsed)}</Typography>)}
      <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{uiText('Latest 100 sessions. Not revoked does not guarantee an unexpired login token.')}</Typography>
      {query.data.sessions.length === 0 && <Typography variant="body2">{uiText('No sessions recorded.')}</Typography>}
      <Stack spacing={1}>
        {query.data.sessions.map(session => <Box key={session.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflowWrap: 'anywhere' }}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap"><Typography variant="body2" fontWeight={700}>{session.device || uiText('Unknown device')}</Typography><Chip size="small" label={uiText(session.isValid ? 'Not revoked' : 'Revoked')} />{session.isValid && <Button size="small" disabled={revoke.isPending} onClick={() => void requestRevoke(session.id)}>{uiText('Revoke')}</Button>}</Stack>
          <Typography variant="caption" display="block">{session.ipAddress || '—'} · {session.userAgent || '—'}</Typography>
          <Typography variant="caption" display="block">{uiText('Last active')}: {stamp(session.lastActive)}</Typography>
        </Box>)}
      </Stack>
      <TextField fullWidth size="small" sx={{ mt: 2 }} label={uiText('Revocation reason', 'forms')} value={reason} onChange={event => setReason(event.target.value)} slotProps={{ htmlInput: { maxLength: 500 } }} helperText={uiText('Enter 5–500 characters to revoke all sessions.', 'forms')} />
      <Button color="error" disabled={revoke.isPending || query.isFetching || query.isError || reason.trim().length < 5 || query.data._count.sessions === 0} onClick={() => void requestRevoke()} sx={{ mt: 1 }}>{uiText('Revoke all user sessions')}</Button>
      <Divider sx={{ my: 2 }} />
      <Typography component="h3" variant="subtitle1" fontWeight={700}>{uiText('Recent activity')}</Typography>
      <Typography variant="caption" color="text.secondary">{uiText('Latest 50 recorded events. These are activity records, not cryptographic verification.')}</Typography>
      {query.data.activity.length === 0 && <Typography variant="body2">{uiText('No activity recorded.')}</Typography>}
      {query.data.activity.map(event => <Box key={event.id} sx={{ my: 1.5, overflowWrap: 'anywhere' }}><Typography variant="body2" fontWeight={700}>{event.action} · {event.module}</Typography><Typography variant="body2">{event.details}</Typography><Typography variant="caption" color="text.secondary">{event.username} · {stamp(event.createdAt)}</Typography></Box>)}
    </>}
  </Box>;
}
