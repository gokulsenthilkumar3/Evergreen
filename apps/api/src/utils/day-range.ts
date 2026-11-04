import { BadRequestException } from '@nestjs/common';

/**
 * Prisma date bounds for report filters given as calendar days (YYYY-MM-DD).
 * `from` starts at local 00:00 and `to` ends at local 23:59:59.999, so the last day is included in full.
 */
export function dayRange(
  from?: string,
  to?: string,
): { gte?: Date; lte?: Date } {
  const day = (value: string | undefined, end: boolean) => {
    if (!value) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match)
      throw new BadRequestException('Dates must be valid YYYY-MM-DD days');
    const [year, month, date] = [
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    ];
    const result = end
      ? new Date(year, month, date, 23, 59, 59, 999)
      : new Date(year, month, date);
    if (
      result.getFullYear() !== year ||
      result.getMonth() !== month ||
      result.getDate() !== date
    )
      throw new BadRequestException('Dates must be valid YYYY-MM-DD days');
    return result;
  };
  const gte = day(from, false);
  const lte = day(to, true);
  if (gte && lte && gte > lte)
    throw new BadRequestException(
      'The start date must not be after the end date',
    );
  return { ...(gte && { gte }), ...(lte && { lte }) };
}
