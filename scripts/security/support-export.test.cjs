const test=require('node:test'),assert=require('node:assert/strict'),{generateKeyPairSync}=require('node:crypto');
const {attestSupportExport,verifySupportExport}=require('./support-export.cjs');
test('owner export signatures bind the exact redacted export and do not verify resolution',()=>{
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');const document={format:'EVERGREEN_SUPPORT_JSON_V1',signature:null,ticket:{id:'ticket',proof:'requested',events:[]}};
 const signed=attestSupportExport(document,privateKey);assert.equal(verifySupportExport(signed,publicKey),true);assert.equal(signed.export.ticket.proof,'requested');signed.export.ticket.proof='verified';assert.equal(verifySupportExport(signed,publicKey),false);
});
test('a different owner key cannot verify the export',()=>{const first=generateKeyPairSync('ed25519'),second=generateKeyPairSync('ed25519');const signed=attestSupportExport({format:'EVERGREEN_SUPPORT_JSON_V1',signature:null,ticket:{id:'ticket'}},first.privateKey);assert.equal(verifySupportExport(signed,second.publicKey),false);});
