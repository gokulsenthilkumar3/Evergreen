import { useEffect,useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useMutation,useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { uiText,useUiLanguage } from '../i18n';
import { formatApiError } from '../utils/messages';
interface Policy {role:string;absoluteMinutes:number;idleMinutes:number;maxConcurrent:number;limitAction:string}
export default function SessionPolicySettings(){
  useUiLanguage();const[open,setOpen]=useState(false),[role,setRole]=useState('VIEWER'),[draft,setDraft]=useState<Policy|null>(null),[password,setPassword]=useState(''),[code,setCode]=useState(''),[reason,setReason]=useState('');const{confirm}=useConfirm();
  const query=useQuery<Policy[]>({queryKey:['session-policies'],enabled:open,queryFn:async()=>(await api.get('/users/session-policies')).data});
  useEffect(()=>{if(open&&!query.isFetching&&!draft&&query.data)setDraft(query.data.find(policy=>policy.role===role)||null);},[open,query.data,query.isFetching,draft,role]);
  const save=useMutation({mutationFn:()=>api.put(`/users/session-policies/${role}`,{absoluteMinutes:draft!.absoluteMinutes,idleMinutes:draft!.idleMinutes,maxConcurrent:draft!.maxConcurrent,limitAction:draft!.limitAction,currentPassword:password,...(code?{code}:{}),reason:reason.trim()}),onSuccess:async()=>{setPassword('');setCode('');setReason('');await query.refetch();setDraft(null);}});
  const close=()=>{if(!save.isPending){setOpen(false);setDraft(null);setPassword('');setCode('');setReason('');save.reset();}};
  return <><Button onClick={()=>setOpen(true)}>{uiText('Session policies')}</Button><Dialog open={open} onClose={close} fullWidth maxWidth="sm" aria-labelledby="session-policy-title"><DialogTitle id="session-policy-title">{uiText('Session policies')}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
    <Alert severity="warning">{uiText('Shorter expiry or idle limits apply to existing sessions on their next request, including your own. Increasing limits does not extend already-issued tokens.')}</Alert>
    {query.isError&&<Alert severity="error" action={<Button onClick={()=>void query.refetch()}>{uiText('Retry')}</Button>}>{uiText('Could not load session policies.')}</Alert>}
    <TextField select label={uiText('Role','forms')} value={role} onChange={event=>{setRole(event.target.value);setDraft(null);save.reset();}} disabled={save.isPending}>{['ADMIN','MODIFIER','VIEWER'].map(value=><MenuItem key={value} value={value}>{uiText(value==='ADMIN'?'Admin':value==='MODIFIER'?'Modifier':'Viewer')}</MenuItem>)}</TextField>
    {draft&&<>
      <TextField type="number" label={uiText('Absolute session lifetime (minutes)','forms')} value={draft.absoluteMinutes} onChange={event=>setDraft({...draft,absoluteMinutes:Number(event.target.value)})} slotProps={{htmlInput:{min:5,max:10080}}} disabled={save.isPending}/>
      <TextField type="number" label={uiText('Idle timeout (minutes, 0 disables)','forms')} value={draft.idleMinutes} onChange={event=>setDraft({...draft,idleMinutes:Number(event.target.value)})} slotProps={{htmlInput:{min:0,max:Math.min(1440,draft.absoluteMinutes)}}} disabled={save.isPending}/>
      <TextField type="number" label={uiText('Maximum concurrent sessions','forms')} value={draft.maxConcurrent} onChange={event=>setDraft({...draft,maxConcurrent:Number(event.target.value)})} slotProps={{htmlInput:{min:1,max:50}}} disabled={save.isPending}/>
      <TextField select label={uiText('When the session limit is reached','forms')} value={draft.limitAction} onChange={event=>setDraft({...draft,limitAction:event.target.value})} disabled={save.isPending}><MenuItem value="REVOKE_OLDEST">{uiText('Revoke oldest sessions')}</MenuItem><MenuItem value="REJECT">{uiText('Reject new sign-in')}</MenuItem></TextField>
      <TextField required type="password" autoComplete="current-password" label={uiText('Current Password','forms')} value={password} onChange={event=>setPassword(event.target.value)} disabled={save.isPending}/>
      <TextField label={uiText('Authenticator code','forms')} value={code} onChange={event=>setCode(event.target.value)} helperText={uiText('Required when TOTP is enabled.','forms')} disabled={save.isPending}/>
      <TextField required label={uiText('Policy change reason','forms')} value={reason} onChange={event=>setReason(event.target.value)} slotProps={{htmlInput:{minLength:5,maxLength:500}}} disabled={save.isPending}/>
    </>}
    {save.isError&&<Alert severity="error">{formatApiError(save.error)}</Alert>}{save.isSuccess&&<Alert severity="success">{uiText('Session policy saved.')}</Alert>}
  </Stack></DialogContent><DialogActions><Button onClick={close} disabled={save.isPending}>{uiText('Close')}</Button><Button disabled={!draft||!password||reason.trim().length<5||save.isPending||query.isError||draft.absoluteMinutes<5||draft.absoluteMinutes>10080||draft.idleMinutes<0||draft.idleMinutes>Math.min(1440,draft.absoluteMinutes)||draft.maxConcurrent<1||draft.maxConcurrent>50||![draft.absoluteMinutes,draft.idleMinutes,draft.maxConcurrent].every(Number.isInteger)} onClick={async()=>{if(await confirm({title:uiText('Apply session policy'),message:uiText('Apply this role-wide policy? Existing sessions may expire immediately. Your password and enabled MFA are required.'),severity:'warning'}))save.mutate();}}>{uiText('Save Changes')}</Button></DialogActions></Dialog></>;
}
