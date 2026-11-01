import { useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { uiDateLocale, uiText, useUiLanguage } from '../i18n';
import { useConfirm } from '../context/ConfirmContext';
import { formatApiError } from '../utils/messages';
interface Invitation { id: string; email: string; status: string; expiresAt: string; user: { username: string; role: string; status: string } }
export default function UserInvitations() {
  useUiLanguage();
  const [open,setOpen] = useState(false);
  const [form,setForm] = useState({ username: '', email: '', name: '', role: 'VIEWER', sender: 'primary' });
  const client = useQueryClient(); const { confirm } = useConfirm();
  const senders = useQuery<{name:string;configured:boolean;sender:string}[]>({ queryKey: ['mail-senders'], enabled: open, queryFn: async () => (await api.get('/auth/account/senders')).data });
  const invitations = useQuery<Invitation[]>({ queryKey: ['user-invitations'], enabled: open, queryFn: async () => (await api.get('/auth/account/invitations')).data });
  const send = useMutation({ mutationFn: () => api.post('/auth/account/invitations', form), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['user-invitations'] }); await client.invalidateQueries({ queryKey: ['users'] }); } });
  const revoke = useMutation({ mutationFn: (id: string) => api.delete(`/auth/account/invitations/${encodeURIComponent(id)}`), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['user-invitations'] }); } });
  const testSender = useMutation({ mutationFn: (sender: string) => api.post(`/auth/account/senders/${sender}/verify`) });
  const error = (send.error || revoke.error) as { response?: { data?: { message?: string } } } | null;
  return <><Button onClick={() => setOpen(true)}>{uiText('Invitations')}</Button><Dialog open={open} fullWidth maxWidth="md" onClose={() => { if (!send.isPending && !revoke.isPending) setOpen(false); }} aria-labelledby="invitation-title">
    <DialogTitle id="invitation-title">{uiText('Staff invitations')}</DialogTitle>
    <DialogContent><Stack spacing={2}>
      <Alert severity="info">{uiText('Invited accounts stay pending until the recipient sets a password and enrolls MFA. Delivery acceptance is not invitation completion.')}</Alert>
      {(senders.isError || invitations.isError) && <Alert severity="error" action={<Button onClick={() => { void senders.refetch(); void invitations.refetch(); }}>{uiText('Retry')}</Button>}>{uiText('Could not load invitation settings.')}</Alert>}
      <Box component="form" onSubmit={event => { event.preventDefault(); send.mutate(); }}>
        <Stack spacing={2} sx={{ py: 1 }}>
          <TextField required label={uiText('Username', 'forms')} value={form.username} onChange={event => setForm({...form,username:event.target.value})} slotProps={{ htmlInput: { pattern: '[A-Za-z0-9._@\\-]+', maxLength: 100 } }} disabled={send.isPending} />
          <TextField required type="email" label={uiText('Email', 'forms')} value={form.email} onChange={event => setForm({...form,email:event.target.value})} disabled={send.isPending} />
          <TextField label={uiText('Full Name', 'forms')} value={form.name} onChange={event => setForm({...form,name:event.target.value})} slotProps={{ htmlInput: { maxLength: 200 } }} disabled={send.isPending} />
          <TextField select label={uiText('Role', 'forms')} value={form.role} onChange={event => setForm({...form,role:event.target.value})} disabled={send.isPending}>{['VIEWER','MODIFIER','ADMIN'].map(role => <MenuItem key={role} value={role}>{uiText(role === 'ADMIN' ? 'Admin' : role === 'MODIFIER' ? 'Modifier' : 'Viewer')}</MenuItem>)}</TextField>
          <TextField select label={uiText('Mail sender', 'forms')} value={form.sender} onChange={event => setForm({...form,sender:event.target.value})} disabled={send.isPending}>{['primary','secondary'].map(name => <MenuItem key={name} value={name}>{senders.data?.find(sender => sender.name === name)?.sender || uiText(name === 'primary' ? 'Primary sender' : 'Secondary sender')}</MenuItem>)}</TextField>
          {!senders.data?.some(sender => sender.name === form.sender && sender.configured) && <Alert severity="warning">{uiText('Configure this SMTP sender locally before sending invitations.')}</Alert>}
          <Button disabled={testSender.isPending || !senders.data?.some(sender => sender.name === form.sender && sender.configured)} onClick={() => testSender.mutate(form.sender)}>{uiText('Test SMTP connection')}</Button>
          {testSender.isSuccess && testSender.variables === form.sender && <Alert severity="success">{uiText('SMTP connection authenticated. This does not confirm inbox delivery.')}</Alert>}
          {testSender.isError && testSender.variables === form.sender && <Alert severity="error">{formatApiError(testSender.error)}</Alert>}
          <Button type="submit" variant="contained" disabled={send.isPending || !senders.data?.some(sender => sender.name === form.sender && sender.configured)}>{uiText('Send invitation')}</Button>
          {send.isSuccess && <Alert severity="success">{uiText('Invitation accepted by the mail server. Awaiting recipient onboarding.')}</Alert>}
          {error && <Alert severity="error">{formatApiError(error, uiText('Invitation operation failed.'))}</Alert>}
        </Stack>
      </Box>
      <Typography variant="subtitle1">{uiText('Latest 100 invitations')}</Typography>
      {invitations.data?.length === 0 && <Typography>{uiText('No invitations yet.')}</Typography>}
      {invitations.data?.map(invitation => <Box key={invitation.id} sx={{ p: 1.5, border: '1px solid', borderColor:'divider', borderRadius:1, overflowWrap:'anywhere' }}><Typography fontWeight={700}>{invitation.user.username} · {invitation.email}</Typography><Chip size="small" label={uiText(invitation.status)} /><Typography variant="caption" display="block">{uiText('Expires')}: {new Date(invitation.expiresAt).toLocaleString(uiDateLocale())}</Typography>
        {invitation.user.status === 'PENDING' && <Button disabled={send.isPending} onClick={() => { setForm({username: invitation.user.username,email:invitation.email,name:'',role:invitation.user.role,sender:form.sender}); send.reset(); }}>{uiText('Prepare resend')}</Button>}
        {!['COMPLETED','REVOKED','DELIVERY_FAILED'].includes(invitation.status) && <Button color="error" disabled={revoke.isPending} onClick={async () => { if (await confirm({title:uiText('Revoke invitation'),message:uiText('Revoke this link? The pending account will remain and can be reinvited or deactivated.'),severity:'warning'})) revoke.mutate(invitation.id); }}>{uiText('Revoke invitation')}</Button>}
      </Box>)}
    </Stack></DialogContent><DialogActions><Button disabled={send.isPending || revoke.isPending} onClick={() => setOpen(false)}>{uiText('Close')}</Button></DialogActions>
  </Dialog></>;
}
