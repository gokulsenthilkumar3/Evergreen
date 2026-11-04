import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { uiText, useUiLanguage } from '../i18n';
import { formatApiError } from '../utils/messages';
export default function HelpdeskAiAdvisory({ticket,username,onChanged,onInsert}:{ticket:any;username:string;onChanged:()=>Promise<void>;onInsert:(text:string,id:string)=>void}){
 const language=useUiLanguage();const [open,setOpen]=useState(false),[includeInternal,setIncludeInternal]=useState(false),[context,setContext]=useState(''),[consent,setConsent]=useState(false),[operation,setOperation]=useState('DRAFT');const version=useRef(ticket.version);
 const preview=useQuery<any>({queryKey:['helpdesk-ai-preview',ticket.id,username,includeInternal],enabled:open,refetchOnWindowFocus:false,queryFn:async()=>(await api.get(`/helpdesk/tickets/${ticket.id}/ai-preview`,{params:{includeInternal}})).data,gcTime:0});
 useEffect(()=>{if(preview.data){setContext(preview.data.context);setConsent(false);}},[preview.data]);
 const generate=useMutation({mutationFn:()=>api.post(`/helpdesk/tickets/${ticket.id}/ai`,{version:version.current,operation,context,consent,language}),onSuccess:async()=>{await onChanged();}});
 const draft=generate.data?.data;
 return <><Button onClick={()=>{version.current=ticket.version;setConsent(false);setIncludeInternal(false);generate.reset();setOpen(true);}}>{uiText('AI advisory tools')}</Button><Dialog open={open} onClose={()=>{if(!generate.isPending)setOpen(false);}} fullWidth maxWidth="md"><DialogTitle>{uiText('Review context before AI assistance')}</DialogTitle><DialogContent><Stack gap={2} sx={{pt:1}}>
 <Alert severity="warning">{uiText('Only the reviewed text below will be sent to Groq after your explicit consent. Remove sensitive information. AI output is advisory, may be wrong, and never sends replies or verifies a fix.')}</Alert>
 {preview.isError&&<Alert severity="error">{formatApiError(preview.error)}</Alert>}
 <FormControlLabel control={<Checkbox disabled={generate.isPending||generate.isSuccess} checked={includeInternal} onChange={event=>setIncludeInternal(event.target.checked)}/>} label={uiText('Include private administrator notes in the preview')}/>
 <TextField select label={uiText('AI operation')} value={operation} disabled={generate.isPending||generate.isSuccess} onChange={event=>setOperation(event.target.value)}>{['DRAFT','SUMMARY','CLASSIFY','SUGGEST'].map(value=><MenuItem key={value} value={value}>{uiText(value==='DRAFT'?'Draft reply':value==='SUMMARY'?'Summarize context':value==='CLASSIFY'?'Suggest classification':'Suggest next steps')}</MenuItem>)}</TextField>
 <TextField label={uiText('Reviewed text to send to Groq')} multiline minRows={8} value={context} disabled={generate.isPending||generate.isSuccess} onChange={event=>{setContext(event.target.value);setConsent(false);}} slotProps={{htmlInput:{maxLength:6000}}}/>
 {preview.data?.truncated&&<Alert severity="info">{uiText('The preview was limited to 6,000 characters. Review and edit it before sending.')}</Alert>}{preview.data&&!preview.data.configured&&<Alert severity="info">{uiText('The AI provider is not configured.')}</Alert>}
 <FormControlLabel control={<Checkbox checked={consent} disabled={generate.isPending||generate.isSuccess} onChange={event=>setConsent(event.target.checked)}/>} label={uiText('I consent to send this reviewed text to Groq for the selected advisory operation.')}/>
 {generate.isError&&<Alert severity="error">{formatApiError(generate.error)}</Alert>}
 {draft&&<><Alert severity="warning">{uiText('AI-generated draft — human review required')}</Alert><Typography sx={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{draft.data.text}</Typography></>}
 </Stack></DialogContent><DialogActions><Button disabled={generate.isPending} onClick={()=>setOpen(false)}>{uiText('Close')}</Button>{draft?.data.operation==='DRAFT'&&<Button onClick={()=>{onInsert(draft.data.text,draft.id);setOpen(false);}}>{uiText('Insert as AI-assisted reply draft')}</Button>}<Button disabled={generate.isPending||generate.isSuccess||!preview.data?.configured||!consent||!context.trim()} onClick={()=>generate.mutate()}>{uiText('Send reviewed context to Groq')}</Button></DialogActions></Dialog></>;
}
