const sendMail=jest.fn(),verify=jest.fn(),createTransport=jest.fn((..._args:unknown[])=>({sendMail,verify}));
jest.mock('nodemailer',()=>({createTransport:(...args:unknown[])=>createTransport(...args)}));
import { EmailService } from './email.service';
describe('Independent SMTP senders',()=>{
  const original={...process.env};
  beforeEach(()=>{jest.clearAllMocks();for(const key of Object.keys(process.env))if(key.startsWith('SMTP_'))delete process.env[key];sendMail.mockResolvedValue({accepted:['recipient@example.com'],messageId:'receipt'});verify.mockResolvedValue(true);});
  afterEach(()=>{for(const key of Object.keys(process.env))if(key.startsWith('SMTP_'))delete process.env[key];for(const[key,value]of Object.entries(original))if(key.startsWith('SMTP_'))process.env[key]=value;});
  it('does not claim mail is configured when app credentials are absent',()=>{process.env.SMTP_PRIMARY_HOST='smtp.gmail.com';process.env.SMTP_PRIMARY_USER='sender@example.com';const service=new EmailService();expect(service.readiness().every(sender=>!sender.configured)).toBe(true);expect(createTransport).not.toHaveBeenCalled();});
  it('never mixes a primary-specific username with unrelated legacy credentials',()=>{process.env.SMTP_PRIMARY_HOST='smtp.gmail.com';process.env.SMTP_PRIMARY_USER='new@example.com';process.env.SMTP_PASSWORD='legacy-secret';expect(new EmailService().readiness()[0].configured).toBe(false);});
  it('uses the selected sender without automatic delivery failover',async()=>{
    Object.assign(process.env,{SMTP_PRIMARY_HOST:'smtp.gmail.com',SMTP_PRIMARY_USER:'first@example.com',SMTP_PRIMARY_PASSWORD:'first-app-password',SMTP_SECONDARY_HOST:'smtp.zoho.in',SMTP_SECONDARY_USER:'second@example.com',SMTP_SECONDARY_PASSWORD:'second-app-password'});
    const service=new EmailService();expect(service.readiness().every(sender=>sender.configured)).toBe(true);
    await service.sendAccountMessage('recipient@example.com','subject','plain text','secondary');
    expect(sendMail).toHaveBeenCalledWith({from:'second@example.com',to:'recipient@example.com',subject:'subject',text:'plain text'});
    sendMail.mockRejectedValueOnce(new Error('Connection failed'));
    await expect(service.sendAccountMessage('recipient@example.com','subject','plain text','primary')).rejects.toThrow();
    expect(sendMail).toHaveBeenCalledTimes(2);
  });
  it('verifies SMTP authentication without sending a message',async()=>{
    Object.assign(process.env,{SMTP_PRIMARY_HOST:'smtp.gmail.com',SMTP_PRIMARY_USER:'first@example.com',SMTP_PRIMARY_PASSWORD:'app-password'});
    await expect(new EmailService().verifyAccount('primary')).resolves.toEqual({connected:true,checkedAt:expect.any(String)});
    expect(verify).toHaveBeenCalled();expect(sendMail).not.toHaveBeenCalled();
  });
});
