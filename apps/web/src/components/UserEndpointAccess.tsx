import { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uiText, useUiLanguage } from '../i18n';
import { formatApiError } from '../utils/messages';
import { useConfirm } from '../context/ConfirmContext';
import api from '../utils/api';
interface Rule {method:string;path:string;effect:string;expiresAt?:string|null}
interface Policy {role:string;scopedAccess:boolean;updatedAt:string;accessRules:Rule[];catalogue:{method:string;path:string;requiredRoles:string[];allowed:boolean}[]}
export default function UserEndpointAccess({userId}:{userId:number}) {
  useUiLanguage();const[open,setOpen]=useState(false);const[draft,setDraft]=useState<{scopedAccess:boolean;rules:Rule[];expectedUpdatedAt:string}|null>(null);const[reason,setReason]=useState('');
  const{confirm}=useConfirm();const client=useQueryClient();
  const policy=useQuery<Policy>({queryKey:['user-access',userId],enabled:open,queryFn:async()=>(await api.get(`/users/${userId}/access`)).data});
  useEffect(()=>{if(open&&!policy.isFetching&&!policy.isError&&policy.data&&!draft)setDraft({scopedAccess:policy.data.scopedAccess,rules:policy.data.accessRules.map(rule=>({method:rule.method,path:rule.path,effect:rule.effect,expiresAt:rule.expiresAt?new Date(rule.expiresAt).toISOString().slice(0,16):''})),expectedUpdatedAt:policy.data.updatedAt});},[open,policy.isFetching,policy.isError,policy.data,draft]);
  const save=useMutation({mutationFn:()=>api.put(`/users/${userId}/access`,{...draft,reason:reason.trim(),rules:draft!.rules.map(rule=>({...rule,expiresAt:rule.expiresAt?new Date(rule.expiresAt+'Z').toISOString():undefined}))}),onSuccess:async()=>{setReason('');await policy.refetch();setDraft(null);await client.invalidateQueries({queryKey:['users']});}});
  const update=(index:number,change:Partial<Rule>)=>setDraft(current=>current?{...current,rules:current.rules.map((rule,i)=>i===index?{...rule,...change}:rule)}:current);
  const close=()=>{if(!save.isPending){setOpen(false);setDraft(null);setReason('');save.reset();}};
  return <Box sx={{mt:2}}><Button variant="outlined" onClick={()=>setOpen(true)}>{uiText('Staff endpoint access')}</Button><Dialog open={open} onClose={close} fullWidth maxWidth="md" aria-labelledby="staff-access-title"><DialogTitle id="staff-access-title">{uiText('Staff endpoint access')}</DialogTitle><DialogContent><Stack spacing={2}>
    <Alert severity="info">{uiText('Allow-list mode blocks business endpoints unless explicitly allowed. Deny overrides allow. Rules never elevate the built-in role or licence. Own security and session controls remain available.')}</Alert>
    {policy.isError&&<Alert severity="error" action={<Button onClick={()=>{setDraft(null);void policy.refetch();}}>{uiText('Retry')}</Button>}>{uiText('Could not load staff access policy.')}</Alert>}
    {policy.data?.role==='ADMIN'&&<Alert severity="warning">{uiText('Administrator accounts cannot be scoped. Assign a staff role before configuring restrictions.')}</Alert>}
    {draft&&policy.data&&<>
      <FormControlLabel control={<Checkbox checked={draft.scopedAccess} disabled={save.isPending||policy.data.role==='ADMIN'} onChange={(_,checked)=>setDraft({...draft,scopedAccess:checked})}/>} label={uiText('Use explicit endpoint allow-list')}/>
      {draft.rules.map((rule,index)=><Stack key={index} spacing={1} sx={{p:1.5,border:'1px solid',borderColor:'divider',borderRadius:1}}>
        <TextField select label={uiText('Endpoint','forms')} value={rule.method+' '+rule.path} onChange={event=>{const[method,...path]=event.target.value.split(' ');update(index,{method,path:path.join(' ')});}} disabled={save.isPending||policy.data!.role==='ADMIN'}>
          {policy.data!.catalogue.map(endpoint=><MenuItem key={endpoint.method+' '+endpoint.path} value={endpoint.method+' '+endpoint.path}>{endpoint.method} {endpoint.path} ({endpoint.requiredRoles.join(', ')})</MenuItem>)}
          {!policy.data!.catalogue.some(endpoint=>endpoint.method===rule.method&&endpoint.path===rule.path)&&<MenuItem value={rule.method+' '+rule.path}>{rule.method} {rule.path}</MenuItem>}
        </TextField>
        <TextField select label={uiText('Rule effect','forms')} value={rule.effect} onChange={event=>update(index,{effect:event.target.value})} disabled={save.isPending||policy.data!.role==='ADMIN'}><MenuItem value="ALLOW">{uiText('Allow within role')}</MenuItem><MenuItem value="DENY">{uiText('Deny')}</MenuItem></TextField>
        <TextField label={uiText('Expiry (UTC)','forms')} type="datetime-local" value={rule.expiresAt||''} onChange={event=>update(index,{expiresAt:event.target.value})} slotProps={{inputLabel:{shrink:true}}} disabled={save.isPending||policy.data!.role==='ADMIN'}/>
        <Button color="error" disabled={save.isPending||policy.data!.role==='ADMIN'} onClick={()=>setDraft({...draft,rules:draft.rules.filter((_,i)=>i!==index)})}>{uiText('Remove rule')}</Button>
      </Stack>)}
      <Button disabled={save.isPending||draft.rules.length>=100||policy.data.role==='ADMIN'||!policy.data.catalogue.length} onClick={()=>{const first=policy.data!.catalogue.find(endpoint=>endpoint.allowed)||policy.data!.catalogue[0];setDraft({...draft,rules:[...draft.rules,{method:first.method,path:first.path,effect:'ALLOW'}]});}}>{uiText('Add endpoint rule')}</Button>
      <TextField label={uiText('Policy change reason','forms')} value={reason} onChange={event=>setReason(event.target.value)} slotProps={{htmlInput:{maxLength:500}}} disabled={save.isPending||policy.data.role==='ADMIN'}/>
      <Typography variant="subtitle2">{uiText('Saved policy calculation')}</Typography><Typography variant="caption">{uiText('This preview uses saved configuration. It does not execute endpoints or certify successful requests. It is not row-level or branch-level data isolation.')}</Typography>
      <Box sx={{maxHeight:240,overflow:'auto'}}>{policy.data.catalogue.map(endpoint=><Typography variant="caption" display="block" key={endpoint.method+' '+endpoint.path} sx={{color:endpoint.allowed?'success.main':'text.secondary',overflowWrap:'anywhere'}}>{uiText(endpoint.allowed?'Allowed':'Blocked')} · {endpoint.method} {endpoint.path}</Typography>)}</Box>
    </>}
    {save.isError&&<Alert severity="error">{formatApiError(save.error)}</Alert>}{save.isSuccess&&<Alert severity="success">{uiText('Access policy recorded. New requests use the saved policy.')}</Alert>}
  </Stack></DialogContent><DialogActions><Button onClick={close} disabled={save.isPending}>{uiText('Close')}</Button><Button disabled={!draft||reason.trim().length<5||save.isPending||policy.isError||policy.data?.role==='ADMIN'} onClick={async()=>{if(await confirm({title:uiText('Apply staff access policy'),message:uiText('Replace this staff access policy? Changes apply to the next request. An empty allow-list blocks all business endpoints.'),severity:'warning'}))save.mutate();}}>{uiText('Save Changes')}</Button></DialogActions></Dialog></Box>;
}
