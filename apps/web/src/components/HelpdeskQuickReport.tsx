import { useRef, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { SupportAgent } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { uiText, useUiLanguage } from '../i18n';
import { formatApiError } from '../utils/messages';
export default function HelpdeskQuickReport({page}:{page:string}){
 useUiLanguage();const client=useQueryClient();const [open,setOpen]=useState(false),[subject,setSubject]=useState(''),[description,setDescription]=useState(''),[category,setCategory]=useState('QUESTION');const request=useRef<{json:string;key:string}|null>(null);
 const suggestions=useQuery<any[]>({queryKey:['quick-help-suggestions',subject],enabled:open&&subject.length>=3,queryFn:async()=>(await api.get('/helpdesk/resources/KB',{params:{q:subject}})).data,gcTime:0});
 const submit=useMutation({mutationFn:()=>{const body={subject:subject.trim(),description:description.trim(),category,priority:'NORMAL'};const json=JSON.stringify(body);if(request.current?.json!==json)request.current={json,key:crypto.randomUUID()};return api.post('/helpdesk/tickets',{...body,requestKey:request.current.key});},onSuccess:async()=>{setSubject('');setDescription('');request.current=null;await client.invalidateQueries({queryKey:['helpdesk-tickets']});}});
 return <><Button size="small" startIcon={<SupportAgent/>} onClick={()=>{setOpen(true);if(!description)setDescription(`${uiText('Reported page')}: ${uiText(page)}\n\n${uiText('Steps, expected result and actual result')}: `);submit.reset();}}>{uiText('Get help')}</Button><Dialog open={open} onClose={()=>{if(!submit.isPending)setOpen(false);}} fullWidth maxWidth="sm"><DialogTitle>{uiText('Get help with this page')}</DialogTitle><DialogContent><Stack component="form" id="quick-help" gap={2} sx={{pt:1}} onSubmit={event=>{event.preventDefault();submit.mutate();}}>
 <Alert severity="info">{uiText('This creates an installation support ticket. External provider delivery is separate. Never include passwords, owner keys or recovery codes.')}</Alert>
 <TextField required label={uiText('Subject')} value={subject} disabled={submit.isPending} onChange={event=>setSubject(event.target.value)} slotProps={{htmlInput:{minLength:3,maxLength:160}}}/><TextField select label={uiText('Category')} value={category} disabled={submit.isPending} onChange={event=>setCategory(event.target.value)}>{['QUESTION','BUG','ACCESS','INTEGRATION','BILLING','DATA'].map(value=><MenuItem value={value} key={value}>{uiText(value)}</MenuItem>)}</TextField>
 <TextField required label={uiText('Issue details')} value={description} multiline minRows={5} disabled={submit.isPending} onChange={event=>setDescription(event.target.value)} slotProps={{htmlInput:{minLength:10,maxLength:4000}}}/>
 {suggestions.data?.filter(row=>row.kind==='KB'&&row.status==='PUBLISHED'&&row.visibility==='PUBLIC').slice(0,3).map(row=><Alert key={row.id} severity="info"><Typography fontWeight={700}>{row.title}</Typography><Typography sx={{whiteSpace:'pre-wrap'}}>{String(row.data.body).slice(0,500)}</Typography></Alert>)}
 {submit.isError&&<Alert severity="error">{formatApiError(submit.error)}</Alert>}{submit.isSuccess&&<Alert severity="success">{uiText('Ticket saved. Follow the conversation in Helpdesk.')}</Alert>}
 </Stack></DialogContent><DialogActions><Button disabled={submit.isPending} onClick={()=>setOpen(false)}>{uiText('Close')}</Button><Button type="submit" form="quick-help" disabled={submit.isPending||subject.trim().length<3||description.trim().length<10}>{uiText('Create support ticket')}</Button></DialogActions></Dialog></>;
}
