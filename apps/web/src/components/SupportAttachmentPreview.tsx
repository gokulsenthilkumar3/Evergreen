import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import api from '../utils/api';
import { uiText } from '../i18n';
import { formatApiError } from '../utils/messages';
export function boundedPng(bytes:Uint8Array){
 const signature=[137,80,78,71,13,10,26,10];if(bytes.length<24||signature.some((value,index)=>bytes[index]!==value)||String.fromCharCode(...bytes.subarray(12,16))!=='IHDR')return false;
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),width=view.getUint32(16),height=view.getUint32(20);return width>0&&height>0&&width<=4096&&height<=4096&&width*height<=4194304;
}
export default function SupportAttachmentPreview({ticketId,attachmentId,filename}:{ticketId:string;attachmentId:string;filename:string}){
 const [url,setUrl]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
 return <><Button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const response=await api.get(`/helpdesk/tickets/${ticketId}/attachments/${attachmentId}`,{responseType:'blob'});const bytes=new Uint8Array(await response.data.arrayBuffer());if(!boundedPng(bytes)){setError(uiText('Only PNG images up to four megapixels can be previewed. Other files can be downloaded after antivirus checks.'));return;}setUrl(URL.createObjectURL(new Blob([bytes],{type:'image/png'})));}catch(failure){setError(formatApiError(failure));}finally{setBusy(false);}}}>{uiText('Preview PNG')}</Button>{error&&<Alert severity="warning">{error}</Alert>}<Dialog open={!!url} onClose={()=>setUrl('')} fullWidth maxWidth="md"><DialogTitle>{filename}</DialogTitle><DialogContent><Box component="img" alt={filename} src={url} sx={{display:'block',maxWidth:'100%',maxHeight:'70vh',mx:'auto'}} onError={()=>{setError(uiText('The image could not be decoded.'));setUrl('');}}/></DialogContent><DialogActions><Button onClick={()=>setUrl('')}>{uiText('Close')}</Button></DialogActions></Dialog></>;
}
