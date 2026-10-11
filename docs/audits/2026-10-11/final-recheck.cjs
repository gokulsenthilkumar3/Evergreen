const fs=require('fs'),ts=require('typescript'),path=require('path'),crypto=require('crypto');
const out=path.resolve('docs/audits/2026-10-11');
require.extensions['.ts']=(module,filename)=>{const source=fs.readFileSync(filename,'utf8');module._compile(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true,esModuleInterop:true}}).outputText,filename);};
const {IndicatorProtocolParser:P}=require(path.resolve('apps/weighbridge-agent/src/indicator-parsers.ts'));
const {AntiTamperEngine:A}=require(path.resolve('apps/weighbridge-agent/src/anti-tamper.ts'));
const {ProviderAccessGuard:G}=require(path.resolve('apps/admin-api/src/guards/provider-access.guard.ts'));
const old={NODE_ENV:process.env.NODE_ENV,ADMIN_API_KEY:process.env.ADMIN_API_KEY};process.env.NODE_ENV='production';process.env.ADMIN_API_KEY=crypto.randomBytes(32).toString('hex');
const req={method:'GET',path:'/companies',headers:{origin:'https://localhost.attacker.invalid'}};
let guard;try{guard={allowed:new G().canActivate({switchToHttp:()=>({getRequest:()=>req})})};}catch(e){guard={denied:e.getStatus?.()||e.message};}
Object.assign(process.env,old);
const key=crypto.randomBytes(32).toString('hex');const payload={deviceSerial:'AUDIT-NONPRODUCTION',comPort:'NONE',grossWeightKg:1000,tareWeightKg:100,moisturePercent:10,standardMoistureBase:8,timestamp:'2026-01-01T00:00:00Z'};
const slip=A.signSlip(payload,key);const changedTotal=structuredClone(slip);changedTotal.calculations.finalBillableKg=999;
const changedExcess=structuredClone(slip);changedExcess.calculations.excessMoisturePercent=49;changedExcess.antiFraudSeal='ALTERED';
const data={checkedAt:new Date().toISOString(),providerForgedOrigin:guard,priorWeightCases:['ST,GS,+100lb','S S 1000 g','ST,GS,-100kg','ERR42'].map(raw=>({raw,result:P.parseWeightFrame(raw)})),remainingWeightCases:['ST,GS,+100oz','S S 1000 xyz','ST,GS,+100kg GARBAGE'].map(raw=>({raw,result:P.parseWeightFrame(raw)})),moistureMalformed:P.parseMoistureFrame('12garbage'),tamperedTotalAccepted:A.verifySlip(changedTotal,key),tamperedExcessAndSealAccepted:A.verifySlip(changedExcess,key),expiredSlipAccepted:A.verifySlip(slip,key)};
fs.writeFileSync(path.join(out,'final-reproductions.json'),JSON.stringify(data,null,2));
const first=JSON.parse(fs.readFileSync(path.join(out,'source-inventory.json'))),final=first.map(x=>({...x,finalSha256:fs.existsSync(x.file)?crypto.createHash('sha256').update(fs.readFileSync(x.file)).digest('hex'):null}));
fs.writeFileSync(path.join(out,'source-final-manifest.json'),JSON.stringify(final,null,2));
console.log(JSON.stringify(data,null,2));
