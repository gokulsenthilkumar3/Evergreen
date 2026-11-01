const fs=require('node:fs'),path=require('node:path');
const {createHash,createPrivateKey,sign,verify}=require('node:crypto');
function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).filter(key=>value[key]!==undefined).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';return JSON.stringify(value);}
function exportDigest(document){return createHash('sha256').update(canonical(document)).digest('hex');}
function attestSupportExport(document,privateKey){
 if(document?.format!=='EVERGREEN_SUPPORT_JSON_V1'||typeof document.ticket?.id!=='string'||document.signature!==null)throw Error('Expected an unsigned EverGreen support export');
 const payload={scope:'HELPDESK_EXPORT',ticketId:document.ticket.id,exportDigest:exportDigest(document),issuedAt:new Date().toISOString()};
 return {format:'EVERGREEN_SIGNED_SUPPORT_EXPORT_V1',export:document,attestation:{payload,signature:sign(null,Buffer.from(canonical(payload)),privateKey).toString('base64url')}};
}
function verifySupportExport(envelope,publicKey){
 if(envelope?.format!=='EVERGREEN_SIGNED_SUPPORT_EXPORT_V1'||envelope.attestation?.payload?.scope!=='HELPDESK_EXPORT'||envelope.attestation.payload.ticketId!==envelope.export?.ticket?.id||envelope.attestation.payload.exportDigest!==exportDigest(envelope.export))return false;
 try{return verify(null,Buffer.from(canonical(envelope.attestation.payload)),publicKey,Buffer.from(envelope.attestation.signature,'base64url'));}catch{return false;}
}
if(require.main===module){
 try{
  const args=Object.fromEntries(process.argv.slice(2).reduce((out,value,index,all)=>index%2?out:[...out,[value,all[index+1]]],[]));const input=args['--input'];if(!input||!['sign','verify'].includes(args['--mode']))throw Error('Usage: node scripts/security/support-export.cjs --mode sign|verify --input export.json [--output signed-export.json]');
  const filename=path.resolve(input);if(fs.statSync(filename).size>10*1024*1024)throw Error('Export exceeds 10 MB');const document=JSON.parse(fs.readFileSync(filename,'utf8'));
  const {OWNER_PUBLIC_KEY}=require('../../packages/types/dist/owner-public-key');
  if(args['--mode']==='verify'){const valid=verifySupportExport(document,OWNER_PUBLIC_KEY);console.log(JSON.stringify({signatureValid:valid,scope:'EXPORT_INTEGRITY_ONLY',resolutionVerifiedBySignature:false}));if(!valid)process.exitCode=1;}
  else{
   if(!args['--output'])throw Error('Choose an explicit output filename');const output=path.resolve(args['--output']);if(fs.existsSync(output))throw Error('Output already exists; choose a new filename');
   const {requireInstallationLicence,unprotectOwnerData}=require('../../packages/types/dist/licensing');requireInstallationLicence('tenant');
   const keyFile=path.join(process.env.LOCALAPPDATA,'EverGreen/owner-keys/owner-signing-key.dpapi');const secret=unprotectOwnerData(fs.readFileSync(keyFile).toString('base64'));
   try{const envelope=attestSupportExport(document,createPrivateKey(secret));if(!verifySupportExport(envelope,OWNER_PUBLIC_KEY))throw Error('Local signing key does not match the pinned owner public key');fs.writeFileSync(output,JSON.stringify(envelope,null,2),{flag:'wx'});console.log(JSON.stringify({signedFile:output,scope:'EXPORT_INTEGRITY_ONLY',resolutionVerifiedBySignature:false}));}finally{secret.fill(0);}
  }
 }catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={canonical,exportDigest,attestSupportExport,verifySupportExport};
