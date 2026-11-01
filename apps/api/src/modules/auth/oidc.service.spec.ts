jest.mock('../../utils/user-audit',()=>({appendUserAudit:(tx:any,args:any)=>tx.activityLog.create(args)}));
jest.mock('./auth.service',()=>({AuthService:class{}}));
jest.mock('./passwords',()=>({verifyPassword:async()=>true}));
jest.mock('otplib',()=>({TOTP:class{verify=async()=>({valid:true})}}));
import { OidcService } from './oidc.service';
describe('OIDC browser binding and explicit linking',()=>{
  const user={id:7,username:'staff',status:'ACTIVE',updatedAt:new Date('2026-11-01'),isTotpEnabled:false};
  const tx={user:{findUnique:jest.fn(),create:jest.fn()},session:{findUnique:jest.fn()},userExternalIdentity:{findUnique:jest.fn(),create:jest.fn()},activityLog:{create:jest.fn()}};
  const db={...tx,$transaction:async(callback:any)=>callback(tx)};
  const auth={login:jest.fn()};
  const values:Record<string,string>={PUBLIC_APP_URL:'http://localhost:4000',OIDC_ISSUER:'https://issuer.example',OIDC_CLIENT_ID:'client',OIDC_CLIENT_SECRET:'secret'};
  let service:OidcService;
  const grant=jest.fn();
  beforeEach(()=>{
    jest.clearAllMocks();
    service=new OidcService({get:(name:string)=>values[name]} as any,db as any,auth as any);
    tx.user.findUnique.mockResolvedValue(user);tx.session.findUnique.mockResolvedValue({userId:7,isValid:true});tx.userExternalIdentity.findUnique.mockResolvedValue(null);
    grant.mockResolvedValue({claims:()=>({iss:'https://issuer.example',sub:'external-7',email:'staff@example.com',email_verified:true})});
    jest.spyOn(service as any,'provider').mockResolvedValue({configuration:{serverMetadata:()=>({issuer:'https://issuer.example'})},oidc:{randomPKCECodeVerifier:()=> 'verifier',randomState:()=> 'state',randomNonce:()=> 'nonce',calculatePKCECodeChallenge:async()=> 'challenge',buildAuthorizationUrl:()=>new URL('https://issuer.example/auth?state=state'),authorizationCodeGrant:grant}});
  });
  it('rejects a callback from a different browser before exchanging the code',async()=>{
    await service.start();
    await expect(service.callback('state=state&code=secret','wrong-cookie')).rejects.toThrow('browser state');
    expect(grant).not.toHaveBeenCalled();
  });
  it('does not auto-provision or auto-link matching verified email addresses',async()=>{
    const flow=await service.start();
    await expect(service.callback('state=state&code=secret',flow.cookie)).rejects.toThrow('Link this identity');
    expect(tx.user.create).not.toHaveBeenCalled();expect(tx.userExternalIdentity.create).not.toHaveBeenCalled();
    expect(grant).toHaveBeenCalledWith(expect.anything(),expect.any(URL),{pkceCodeVerifier:'verifier',expectedState:'state',expectedNonce:'nonce',idTokenExpected:true});
  });
  it('requires a still-valid local session and links only its authenticated owner',async()=>{
    const flow=await service.start({userId:7,sessionId:'local-session',password:'password'});
    expect(await service.callback('state=state&code=secret',flow.cookie)).toContain('oidc-linked=1');
    expect(tx.userExternalIdentity.create).toHaveBeenCalledWith({data:{userId:7,issuer:'https://issuer.example',subject:'external-7'}});
    expect(tx.activityLog.create).toHaveBeenCalled();
    await expect(service.callback('state=state&code=secret',flow.cookie)).rejects.toThrow('browser state');
  });
  it('rejects a link if the local session was revoked during the external redirect',async()=>{
    const flow=await service.start({userId:7,sessionId:'local-session',password:'password'});tx.session.findUnique.mockResolvedValue({userId:7,isValid:false});
    await expect(service.callback('state=state&code=secret',flow.cookie)).rejects.toThrow('authorization expired');
    expect(tx.userExternalIdentity.create).not.toHaveBeenCalled();
  });
  it('issues a browser-bound handoff, consumes it once and preserves local MFA checks',async()=>{
    tx.userExternalIdentity.findUnique.mockResolvedValue({userId:7,user});auth.login.mockResolvedValue({access_token:'local-token',user:{id:7}});
    const flow=await service.start();const destination=await service.callback('state=state&code=secret',flow.cookie);const ticket=new URLSearchParams(new URL(destination).hash.slice(1)).get('oidc-ticket')!;
    await expect(service.complete(ticket,'wrong-cookie')).rejects.toThrow('ticket');
    await service.complete(ticket,flow.cookie,'123456');
    expect(auth.login).toHaveBeenCalledWith(user,expect.anything(),'123456',undefined);
    await expect(service.complete(ticket,flow.cookie)).rejects.toThrow('ticket');
  });
});
