import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { uiText, useUiLanguage } from '../i18n';
import { saveSession } from '../utils/authStorage';
import { formatApiError } from '../utils/messages';

function useProvider() { return useQuery<{configured:boolean;label:string}>({queryKey:['oidc-provider'],queryFn:async()=>(await api.get('/auth/oidc/status')).data,retry:false,staleTime:60000}); }
export function OidcSignIn() {
  useUiLanguage(); const provider = useProvider();
  const start = useMutation({mutationFn:async()=>(await api.post('/auth/oidc/start')).data,onSuccess:data=>window.location.assign(data.authorizationUrl)});
  if (!provider.data?.configured) return null;
  return <Box sx={{mt:2,textAlign:'center'}}><Button disabled={start.isPending} onClick={()=>start.mutate()}>{uiText('Sign in with identity provider')} · {provider.data.label}</Button>{start.isError&&<Alert severity="error">{formatApiError(start.error)}</Alert>}</Box>;
}
export function OidcIdentitySettings() {
  useUiLanguage(); const provider = useProvider(); const client = useQueryClient();
  const [open,setOpen] = useState(false),[password,setPassword]=useState(''),[code,setCode]=useState('');
  const identities=useQuery<{id:string;issuer:string;subject:string}[]>({queryKey:['own-identities'],queryFn:async()=>(await api.get('/auth/oidc/identities')).data});
  const link=useMutation({mutationFn:async()=>(await api.post('/auth/oidc/link',{currentPassword:password,...(code?{code}:{})})).data,onSuccess:data=>{setPassword('');setCode('');window.location.assign(data.authorizationUrl);}});
  const unlink=useMutation({mutationFn:(id:string)=>api.post(`/auth/oidc/identities/${encodeURIComponent(id)}/unlink`,{currentPassword:password,...(code?{code}:{})}),onSuccess:async()=>{setPassword('');setCode('');await client.invalidateQueries({queryKey:['own-identities']});}});
  const close=()=>{if(!link.isPending&&!unlink.isPending){setOpen(false);setPassword('');setCode('');link.reset();unlink.reset();}};
  return <Box sx={{my:2}}><Button variant="outlined" onClick={()=>setOpen(true)}>{uiText('Linked sign-in identities')}</Button>
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" aria-labelledby="identity-title"><DialogTitle id="identity-title">{uiText('Linked sign-in identities')}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
      <Alert severity="info">{uiText('Link only an identity you control. Matching email addresses never automatically grant EverGreen access. Local MFA remains required at sign-in.')}</Alert>
      {!provider.data?.configured&&<Alert severity="warning">{uiText('OIDC requires a registered client ID, secret and callback URL before linking is available.')}</Alert>}
      {identities.isError&&<Alert severity="error" action={<Button onClick={()=>void identities.refetch()}>{uiText('Retry')}</Button>}>{uiText('Could not load linked identities.')}</Alert>}
      <TextField required type="password" autoComplete="current-password" label={uiText('Current Password','forms')} value={password} onChange={event=>setPassword(event.target.value)} disabled={link.isPending||unlink.isPending}/>
      <TextField label={uiText('Authenticator code','forms')} helperText={uiText('Required when TOTP is enabled.','forms')} value={code} onChange={event=>setCode(event.target.value)} slotProps={{htmlInput:{inputMode:'numeric',maxLength:6}}}/>
      <Button disabled={!password||link.isPending||unlink.isPending||!provider.data?.configured} onClick={()=>link.mutate()}>{uiText('Link identity provider')} · {provider.data?.label||'—'}</Button>
      {identities.data?.length===0&&<Typography>{uiText('No external identities linked.')}</Typography>}
      {identities.data?.map(identity=><Box key={identity.id} sx={{overflowWrap:'anywhere'}}><Typography variant="body2">{identity.issuer}</Typography><Typography variant="caption">{identity.subject}</Typography><Button color="error" disabled={!password||unlink.isPending||link.isPending} onClick={()=>unlink.mutate(identity.id)}>{uiText('Unlink identity')}</Button></Box>)}
      {(link.isError||unlink.isError)&&<Alert severity="error">{formatApiError(link.error||unlink.error)}</Alert>}
    </Stack></DialogContent><DialogActions><Button onClick={close} disabled={link.isPending||unlink.isPending}>{uiText('Close')}</Button></DialogActions></Dialog>
  </Box>;
}
export default function OidcCompletion() {
  useUiLanguage();
  const [state,setState]=useState(()=>{const values=new URLSearchParams(window.location.hash.slice(1));return {ticket:values.get('oidc-ticket'),linked:values.get('oidc-linked')==='1'};});
  const [code,setCode]=useState(''),[recoveryCode,setRecoveryCode]=useState('');
  useEffect(()=>{if(state.ticket||state.linked)window.history.replaceState(null,'',window.location.pathname+window.location.search);},[state]);
  const complete=useMutation({mutationFn:async()=>(await api.post('/auth/oidc/complete',{ticket:state.ticket,...(code?{code}:{}),...(recoveryCode?{recoveryCode}:{})})).data,onSuccess:data=>{saveSession(data.access_token,data.user,false);setCode('');setRecoveryCode('');window.location.replace('/');}});
  if(!state.ticket&&!state.linked)return null;
  return <Dialog open fullWidth maxWidth="sm" aria-labelledby="oidc-finish-title"><Box component="form" onSubmit={event=>{event.preventDefault();complete.mutate();}}><DialogTitle id="oidc-finish-title">{uiText(state.linked?'Identity linked':'Finish provider sign-in')}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
    {state.linked?<Alert severity="success">{uiText('The verified provider identity is now explicitly linked to your account.')}</Alert>:<><Typography>{uiText('Confirm sign-in. Supply an authenticator or recovery code if your EverGreen account uses MFA.')}</Typography><TextField label={uiText('Authenticator code','forms')} value={code} onChange={event=>setCode(event.target.value)} slotProps={{htmlInput:{inputMode:'numeric',pattern:'[0-9]{6}',maxLength:6}}}/><TextField label={uiText('Recovery code','forms')} value={recoveryCode} onChange={event=>setRecoveryCode(event.target.value)}/>{complete.isError&&<Alert severity="error">{formatApiError(complete.error)}</Alert>}</>}
  </Stack></DialogContent><DialogActions><Button disabled={complete.isPending} onClick={()=>setState({ticket:null,linked:false})}>{uiText('Close')}</Button>{!state.linked&&<Button type="submit" disabled={complete.isPending}>{uiText('Confirm')}</Button>}</DialogActions></Box></Dialog>;
}
