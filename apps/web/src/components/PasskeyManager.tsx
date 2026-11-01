import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { uiText, uiDateLocale, useUiLanguage } from '../i18n';
import CredentialActionButton from './CredentialActionButton';

export default function PasskeyManager() {
  useUiLanguage();
  const client = useQueryClient();
  const query = useQuery<{ id: string; deviceType: string; backedUp: boolean; lastUsed: string }[]>({ queryKey: ['own-passkeys'], queryFn: async () => (await api.get('/auth/passkeys')).data });
  return <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2">{uiText('Your registered passkeys')}</Typography>
    {query.isPending && <CircularProgress size={20} />}
    {query.isError && <Alert severity="error" action={<Button onClick={() => void query.refetch()}>{uiText('Retry')}</Button>}>{uiText('Could not load passkeys.')}</Alert>}
    {query.data?.length === 0 && <Typography variant="body2">{uiText('No passkeys registered.')}</Typography>}
    {query.data?.map(key => <Box key={key.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
      <Typography variant="body2">{key.deviceType} · {uiText(key.backedUp ? 'Backed up' : 'Not backed up')}</Typography>
      <Typography variant="caption">{uiText('Last used')}: {new Date(key.lastUsed).toLocaleString(uiDateLocale())}</Typography>
      <CredentialActionButton size="small" color="error" label={uiText('Remove passkey')} endpoint={`/auth/passkeys/${encodeURIComponent(key.id)}`} method="delete" onComplete={async () => { await client.invalidateQueries({ queryKey: ['own-passkeys'] }); }} />
      <Typography variant="caption" display="block">{uiText('Existing sessions remain signed in after removing a passkey.')}</Typography>
    </Box>)}
  </Box>;
}
