import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const rpName = 'Ever Green Yarn Mills';
const rpID = 'localhost'; // Should be from env in production
const origin = `http://${rpID}:5173`; // Frontend URL

@Injectable()
export class WebAuthnService {
  constructor(private prisma: PrismaService) {}

  async getRegistrationOptions(userId: number, username: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { credentials: true },
    });

    if (!user) throw new BadRequestException('User not found');

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
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
        userVerification: 'preferred',
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { currentChallenge: options.challenge },
    });

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
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;

      await this.prisma.webAuthnCredential.create({
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

      await this.prisma.user.update({
        where: { id: userId },
        data: { currentChallenge: null }, // clear challenge
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
      rpID,
      allowCredentials: user.credentials.map((cred) => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports ? JSON.parse(cred.transports) : [],
      })),
      userVerification: 'preferred',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { currentChallenge: options.challenge },
    });

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
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
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
      throw new BadRequestException(error.message);
    }

    if (verification.verified) {
      const { authenticationInfo } = verification;

      await this.prisma.webAuthnCredential.update({
        where: { id: credential.id },
        data: { counter: BigInt(authenticationInfo.newCounter) },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: null }, // clear challenge
      });

      return { verified: true, user };
    }

    throw new BadRequestException('Passkey verification failed');
  }
}
