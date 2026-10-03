import { ValidationPipe } from '@nestjs/common';
import { CreateMachineDto } from './machines/machine.dto';
import { CreateMovementDto } from './warehouse/warehouse.dto';
import { CreateShiftDto } from './hr/hr.dto';
import { CreateQualityInspectionDto } from './quality/quality.dto';
import { requireJwtSecret } from './auth/jwt-secret';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './auth/auth.dto';

describe('mutation validation', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  it('rejects unknown machine fields instead of forwarding them to Prisma', async () => {
    await expect(
      pipe.transform(
        { name: 'Frame', type: 'RING_FRAME', active: false },
        { type: 'body', metatype: CreateMachineDto },
      ),
    ).rejects.toThrow();
  });
  it('rejects negative stock movements', async () => {
    await expect(
      pipe.transform(
        { locationId: 1, itemId: 1, quantity: -10, movementType: 'IN' },
        { type: 'body', metatype: CreateMovementDto },
      ),
    ).rejects.toThrow();
  });
  it('requires a valid shift end time', async () => {
    await expect(
      pipe.transform(
        { name: 'Morning', startTime: '06:00', endTime: '25:00' },
        { type: 'body', metatype: CreateShiftDto },
      ),
    ).rejects.toThrow();
    await expect(
      pipe.transform(
        { name: 'Morning', startTime: '06:00', endTime: '14:00' },
        { type: 'body', metatype: CreateShiftDto },
      ),
    ).resolves.toMatchObject({ endTime: '14:00' });
  });
  it('rejects unsupported QC results', async () => {
    await expect(
      pipe.transform(
        { status: 'invented' },
        { type: 'body', metatype: CreateQualityInspectionDto },
      ),
    ).rejects.toThrow();
  });
  it('accepts only exactly six numeric TOTP digits at login', async () => {
    await expect(
      pipe.transform(
        { username: 'operator', password: 'password', totpCode: '123456' },
        { type: 'body', metatype: LoginDto },
      ),
    ).resolves.toMatchObject({ totpCode: '123456' });
    for (const totpCode of ['12345', '1234567', '12a456', ' 12345']) {
      await expect(
        pipe.transform(
          { username: 'operator', password: 'password', totpCode },
          { type: 'body', metatype: LoginDto },
        ),
      ).rejects.toThrow();
    }
  });
  it('rejects the original JWT placeholder despite its length', () => {
    expect(() =>
      requireJwtSecret(
        new ConfigService({
          JWT_SECRET: 'super-secret-key-change-this-in-production',
        }),
      ),
    ).toThrow();
  });
});
