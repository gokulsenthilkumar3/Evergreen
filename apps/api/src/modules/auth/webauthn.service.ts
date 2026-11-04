import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { appendUserAudit } from '../../utils/user-audit';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';


@Injectable()
export class WebAuthnService {
  private readonly origin: string;
  private readonly rpID: string;
  private readChallenge(value:string,kind:string) {
    const parts=value.split(':');const issued=Number(parts[1]);
    if(parts.length!==3||parts[0]!==kind||!Number.isFinite(issued)||Date.now()-issued>300000||issued>Date.now()+5000)throw new BadRequestException('Passkey challenge is invalid or expired');
    return parts[2];
  }
  private async saveChallenge(userId:number,username:string,kind:string,challenge:string) {
    await this.prisma.$transaction(async tx=>{
      const changed=await tx.user.updateMany({where:{id:userId,status:'ACTIVE'},data:{currentChallenge:kind+':'+Date.now()+':'+challenge}});
      if(changed.count!==1)throw new BadRequestException('Account is not active');
      await appendUserAudit(tx,{data:{username,action:'PASSKEY_CHALLENGE',module:'AUTH',details:'Updated user '+userId+': started '+kind+' passkey challenge'}},userId);
    });
  }
  constructor(private prisma: PrismaService, config: ConfigService) {
    const configured = config.get<string>('PUBLIC_APP_URL');
    if (!configured && process.env.NODE_ENV === 'production') throw new Error('PUBLIC_APP_URL is required for passkeys');
    const url = new URL(configured || 'http://localhost:4000');
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) throw new Error('Passkeys require HTTPS or localhost');
    this.origin = url.origin;
    this.rpID = config.get<string>('WEBAUTHN_RP_ID') || url.hostname;
    if (url.hostname !== this.rpID && !url.hostname.endsWith('.'+this.rpID)) throw new Error('Passkey RP ID must match the application domain');
  }

  async getRegistrationOptions(userId: number, username: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { credentials: true },
    });

    if (!user) throw new BadRequestException('User not found');

    const options = await generateRegistrationOptions({
      rpName: 'EverGreen',
      rpID: this.rpID,
      userID: new Uint8Array(Buffer.from(user.id.toString())),
      userName: username,
      attestationType: 'none',
      excludeCredentials: user.credentials.map((cred) => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports ? JSON.parse(cred.transports) : [],
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    });

    await this.saveChallenge(userId,user.username,'REGISTER',options.challenge);

    return options;
  }

  async verifyRegistration(userId: number, body: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.currentChallenge)
      throw new BadRequestException('Invalid challenge state');

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: this.readChallenge(user.currentChallenge,'REGISTER'),
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        requireUserVerification: true,
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'WebAuthn registration verification failed',
      );
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;

      await this.prisma.$transaction(async tx=>{
      const claimed=await tx.user.updateMany({where:{id:userId,status:'ACTIVE',currentChallenge:user.currentChallenge},data:{currentChallenge:null}});
      if(claimed.count!==1)throw new BadRequestException('Passkey challenge was already used');
      await tx.webAuthnCredential.create({
        data: {
          id: credential.id,
          userId: user.id,
          publicKey: Buffer.from(credential.publicKey),
          counter: BigInt(credential.counter),
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: JSON.stringify(body.response.transports || []),
        },
      });

      await appendUserAudit(tx,{data:{username:user.username,action:'PASSKEY_REGISTERED',module:'AUTH',details:'Updated user '+userId+': registered a user-verified passkey'}},userId);
      });

      return { verified: true };
    }

    throw new BadRequestException('Failed to verify passkey');
  }

  async getAuthenticationOptions(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { credentials: true },
    });

    if (!user) throw new BadRequestException('User not found');

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials: user.credentials.map((cred) => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports ? JSON.parse(cred.transports) : [],
      })),
      userVerification: 'required',
    });

    await this.saveChallenge(user.id,user.username,'AUTHENTICATE',options.challenge);

    return options;
  }

  async verifyAuthentication(username: string, body: any) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { credentials: true },
    });

    if (!user || !user.currentChallenge)
      throw new BadRequestException('Invalid state');

    const credentialIdBase64 = body.id;
    const credential = user.credentials.find(
      (c) => c.id === credentialIdBase64,
    );

    if (!credential) {
      throw new BadRequestException('Credential not found');
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: this.readChallenge(user.currentChallenge,'AUTHENTICATE'),
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        requireUserVerification: true,
        credential: {
          id: credential.id,
          publicKey: new Uint8Array(credential.publicKey),
          counter: Number(credential.counter),
          transports: credential.transports
            ? JSON.parse(credential.transports)
            : [],
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'WebAuthn authentication verification failed',
      );
    }

    if (verification.verified) {
      const { authenticationInfo } = verification;

      const currentUser=await this.prisma.$transaction(async tx=>{
      const claimed=await tx.user.updateMany({where:{id:user.id,status:'ACTIVE',currentChallenge:user.currentChallenge},data:{currentChallenge:null}});
      if(claimed.count!==1)throw new BadRequestException('Passkey challenge was already used');
      await tx.webAuthnCredential.update({
        where: { id: credential.id },
        data: { counter: BigInt(authenticationInfo.newCounter) },
      });

      await appendUserAudit(tx,{data:{username:user.username,action:'PASSKEY_AUTHENTICATED',module:'AUTH',details:'User '+user.id+' completed passkey authentication'}},user.id);
      return tx.user.findUniqueOrThrow({where:{id:user.id}});
      });

      return { verified: true, user: currentUser };
    }

    throw new BadRequestException('Passkey verification failed');
  }
}
