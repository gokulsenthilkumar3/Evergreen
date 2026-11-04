// Runs under the owner account. Never logs the protected access key.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { unprotectOwnerData } = require('../../packages/types/dist/licensing.js');
async function main() {
  const request=(route,init)=>fetch('http://127.0.0.1:4300'+route,{...init,signal:AbortSignal.timeout(8000)});
  const key=unprotectOwnerData(fs.readFileSync(path.join(process.env.LOCALAPPDATA,'EverGreen/owner-keys/provider-access-key.dpapi')).toString('base64')).toString('utf8');
  const response=await request('/public/marketing-settings');assert.equal(response.status,200);const current=await response.json();
  const keys=['salesEmail','marketingEmail','licensingEmail','supportEmail','opensAt','closesAt','timeZone','version'];assert.deepEqual(Object.keys(current).sort(),keys.sort());
  assert.equal((await request('/control/marketing-settings')).status,401);
  const {timeZone,...body}=current;
  const init={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
  assert.equal((await request('/control/marketing-settings',init)).status,401);
  const published=await request('/control/marketing-settings',{...init,headers:{...init.headers,Authorization:`Bearer ${key}`}});assert.equal(published.status,201);const saved=await published.json();
  assert.equal(saved.version,current.version+1);
  assert.deepEqual(await (await request('/public/marketing-settings')).json(),saved);
  assert.equal((await request('/control/marketing-settings',{...init,headers:{...init.headers,Authorization:`Bearer ${key}`}})).status,409);
  console.log('Marketing contacts verified: public whitelist, authenticated publication, persistence and stale-edit rejection. Existing contact values retained.');
}
main().catch(()=>{console.error('Marketing settings verification failed. No credentials logged.');process.exitCode=1;});
