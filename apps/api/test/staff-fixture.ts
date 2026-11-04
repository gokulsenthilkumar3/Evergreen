import { authenticator } from '../src/modules/auth/totp';
import type { PrismaService } from '../src/services/prisma.service';

const secret = authenticator.generateSecret();

// Represent completed email/MFA onboarding without contacting an SMTP provider.
// HTTP tests still exercise the real activation guard and real TOTP login.
export async function provisionOnboardedStaff(prisma: PrismaService, id: number) {
  await prisma.user.update({ where: { id }, data: {
    emailVerifiedAt: new Date(), isTotpEnabled: true, totpSecret: secret,
  } });
}
export const staffCode = () => authenticator.generate({ secret });
