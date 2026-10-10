import { BadRequestException } from '@nestjs/common';

/** Actual stock events use a timestamp. Older date-only callers get the current
 * local clock on their selected day, instead of an artificial midnight event. */
export function stockEventDate(value?: string): Date {
  const now = new Date();
  let event: Date;
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    event = new Date(`${value}T00:00:00`);
    if (Number.isNaN(event.getTime()) || [event.getFullYear(), String(event.getMonth() + 1).padStart(2, '0'), String(event.getDate()).padStart(2, '0')].join('-') !== value) throw new BadRequestException('Enter a valid stock event date');
    event.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  } else event = value ? new Date(value) : now;
  if (!Number.isFinite(event.getTime())) throw new BadRequestException('Enter a valid stock event time');
  if (event.getTime() > now.getTime() + 60_000) throw new BadRequestException('Stock cannot be received, produced or dispatched in the future. Use an order for planned transactions.');
  return event;
}
