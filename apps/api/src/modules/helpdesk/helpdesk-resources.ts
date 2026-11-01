import { BadRequestException } from '@nestjs/common';
const reject = (message: string): never => {
  throw new BadRequestException(message);
};
const text = (value: unknown, max = 4000) =>
  typeof value === 'string' && value.length <= max
    ? value
    : reject('Invalid support configuration text');
const integer = (value: unknown, min: number, max: number) =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= min &&
  value <= max
    ? value
    : reject('Invalid support configuration number');
const list = (value: unknown, max = 50) =>
  Array.isArray(value) && value.length <= max
    ? value
    : reject('Invalid support configuration list');
export function validateSupportResource(
  kind: string,
  data: Record<string, unknown>,
) {
  if (JSON.stringify(data).length > 30000)
    reject('Support configuration is too large');
  switch (kind) {
    case 'KB':
      return {
        body: text(data.body, 20000),
        category: text(data.category || 'GENERAL', 60),
        language: ['en', 'ta'].includes(String(data.language))
          ? String(data.language)
          : 'en',
      };
    case 'MACRO':
    case 'TEMPLATE':
      return {
        body: text(data.body, 4000),
        language: ['en', 'ta'].includes(String(data.language))
          ? String(data.language)
          : 'en',
      };
    case 'QUEUE':
      return {
        members: list(data.members).map((id) => integer(id, 1, 2147483647)),
        capacity: integer(data.capacity ?? 20, 1, 500),
        routing: ['MANUAL', 'ROUND_ROBIN', 'LEAST_LOADED'].includes(
          String(data.routing),
        )
          ? String(data.routing)
          : reject('Unknown routing method'),
      };
    case 'CALENDAR': {
      const timezone = text(data.timezone || 'Asia/Kolkata', 80);
      try {
        new Intl.DateTimeFormat('en', { timeZone: timezone }).format();
      } catch {
        reject('Unknown calendar timezone');
      }
      if(!Array.isArray(data.weekdays)||data.weekdays.length===0)reject('Choose at least one working day');
      return {
        timezone,
        weekdays: list(data.weekdays, 7).map((day) => integer(day, 0, 6)),
        startMinute: integer(data.startMinute, 0, 1439),
        endMinute: integer(data.endMinute, 1, 1440),
        holidays: list(data.holidays || [], 366).map((day) => {
          const value = text(day, 10);
          if (
            !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
            !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value
          )
            reject('Invalid holiday date');
          return value;
        }),
      };
    }
    case 'SLA':
      return {
        priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(
          String(data.priority),
        )
          ? String(data.priority)
          : reject('Unknown SLA priority'),
        queue: text(data.queue || '*', 60),
        responseMinutes: integer(data.responseMinutes, 1, 525600),
        resolutionMinutes: integer(data.resolutionMinutes, 1, 525600),
        pausePending: !!data.pausePending,
        calendarKey: text(data.calendarKey || '', 60),
      };
    case 'CATEGORY':
      return {
        parent: text(data.parent || '', 60),
        fields: list(data.fields || [], 20).map((field) => {
          if (!field || typeof field !== 'object')
            reject('Invalid custom field');
          const f = field as Record<string, unknown>;
          const key = text(f.key, 40);
          if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key))
            reject('Invalid custom field key');
          return {
            key,
            label: text(f.label, 80),
            required: !!f.required,
            type: ['TEXT', 'NUMBER', 'BOOLEAN'].includes(String(f.type))
              ? String(f.type)
              : reject('Unknown custom field type'),
          };
        }),
      };
    case 'VIEW':
      return {
        q: text(data.q || '', 160),
        status: text(data.status || 'ALL', 30),
        queue: text(data.queue || '', 60),
        priority: text(data.priority || 'ALL', 20),
        assignment: text(data.assignment || 'ALL', 20),
      };
    case 'PREFERENCE':
      return {
        portalUpdates: data.portalUpdates !== false,
        emailUpdates: !!data.emailUpdates,
        language: data.language === 'ta' ? 'ta' : 'en',
      };
    case 'RETENTION':
      return {
        closedDays: integer(data.closedDays, 1, 36500),
        autoCloseResolvedDays:integer(data.autoCloseResolvedDays??0,0,3650),
        preserveAudit: true,
        mode: 'REVIEW_REQUIRED',
      };
    case 'RULE':
      return {
        category: text(data.category || '*', 60),
        priority: text(data.priority || '*', 20),
        queue: text(data.queue, 60),
        enabled: !!data.enabled,
      };
    default:
      return reject('Unknown support configuration kind');
  }
}
export interface SupportCalendar {
  timezone: string;
  weekdays: number[];
  startMinute: number;
  endMinute: number;
  holidays: string[];
}
const parts = (date: Date, zone: string) => {
  const values = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (key: string) =>
    Number(values.find((p) => p.type === key)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
};
function wallTime(
  year: number,
  month: number,
  day: number,
  minute: number,
  zone: string,
) {
  const desired = Date.UTC(year, month - 1, day, 0, minute);
  let timestamp = desired;
  for (let i = 0; i < 4; i++) {
    const p = parts(new Date(timestamp), zone);
    const represented = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second,
    );
    const delta = desired - represented;
    timestamp += delta;
    if (delta === 0) break;
  }
  return timestamp;
}
/** Sum configured business windows, retaining UTC duration through DST changes. */
export function businessMilliseconds(
  start: Date,
  end: Date,
  calendar?: SupportCalendar | null,
) {
  if (end <= start) return 0;
  if (!calendar) return end.getTime() - start.getTime();
  const first = parts(start, calendar.timezone),
    last = parts(end, calendar.timezone);
  let day = Date.UTC(first.year, first.month - 1, first.day),
    lastDay = Date.UTC(last.year, last.month - 1, last.day),
    total = 0,
    count = 0;
  if (lastDay - day > 3660 * 86400000)
    throw new BadRequestException(
      'SLA interval exceeds the supported ten-year calendar range',
    );
  while (day <= lastDay && count++ < 3662) {
    const d = new Date(day),
      key = d.toISOString().slice(0, 10);
    if (
      calendar.weekdays.includes(d.getUTCDay()) &&
      !calendar.holidays.includes(key)
    ) {
      const from = wallTime(
          d.getUTCFullYear(),
          d.getUTCMonth() + 1,
          d.getUTCDate(),
          calendar.startMinute,
          calendar.timezone,
        ),
        to = wallTime(
          d.getUTCFullYear(),
          d.getUTCMonth() + 1,
          d.getUTCDate(),
          calendar.endMinute,
          calendar.timezone,
        );
      total += Math.max(
        0,
        Math.min(to, end.getTime()) - Math.max(from, start.getTime()),
      );
    }
    day += 86400000;
  }
  return total;
}
export function supportSla(
  ticket: {
    createdAt: Date;
    resolvedAt: Date | null;
    status: string;
    slaPolicyJson: string | null;
  },
  events: { kind: string; actorId: number; payload: string; createdAt: Date }[],
  requesterId: number | null,
  now = new Date(),
) {
  if (!ticket.slaPolicyJson) return null;
  let policy: any;
  try {
    policy = JSON.parse(ticket.slaPolicyJson);
  } catch {
    return { configured: false, reason: 'Invalid SLA snapshot' };
  }
  const first = events.find(
    (e) => e.kind === 'PUBLIC_REPLY' && e.actorId !== requesterId,
  );
  let paused = 0,
    pauseStart: Date | null = null;
  if (policy.pausePending)
    for (const event of events) {
      let status: string | undefined;
      try {
        status = JSON.parse(event.payload).status;
      } catch {}
      if (status === 'PENDING' && !pauseStart) pauseStart = event.createdAt;
      else if (status && status !== 'PENDING' && pauseStart) {
        paused += businessMilliseconds(
          pauseStart,
          event.createdAt,
          policy.calendar,
        );
        pauseStart = null;
      }
    }
  const end = ticket.resolvedAt || now;
  if (pauseStart && pauseStart < end)
    paused += businessMilliseconds(pauseStart, end, policy.calendar);
  const responseElapsed =
    businessMilliseconds(
      ticket.createdAt,
      first?.createdAt || now,
      policy.calendar,
    ) / 60000;
  const resolutionElapsed =
    Math.max(
      0,
      businessMilliseconds(ticket.createdAt, end, policy.calendar) - paused,
    ) / 60000;
  const acknowledged = first
    ? events.find(
        (e) =>
          e.kind === 'REPLY_ACKNOWLEDGED' &&
          e.actorId === requesterId &&
          JSON.parse(e.payload).replyEventId === (first as any).id,
      )
    : null;
  return {
    configured: true,
    policyTitle: policy.title,
    responseTargetMinutes: policy.responseMinutes,
    resolutionTargetMinutes: policy.resolutionMinutes,
    responseRecordedAt: first?.createdAt || null,
    responseElapsedMinutes: Math.round(responseElapsed),
    resolutionElapsedMinutes: Math.round(resolutionElapsed),
    responseBreach: responseElapsed > policy.responseMinutes,
    resolutionBreach: resolutionElapsed > policy.resolutionMinutes,
    responseClaim: first
      ? responseElapsed <= policy.responseMinutes
        ? 'RECORDED_WITHIN_TARGET'
        : 'RECORDED_LATE'
      : 'NO_RECORDED_RESPONSE',
    deliveryProof: acknowledged ? 'PORTAL_ACKNOWLEDGED' : 'UNAVAILABLE',
    acknowledgedAt: acknowledged?.createdAt || null,
    paused: ticket.status === 'PENDING' && !!policy.pausePending,
  };
}
export function renderSupportMacro(
  body: string,
  values: { requester: string; ticketId: string; subject: string },
) {
  return body.replace(
    /\{\{\s*(requester\.name|ticket\.id|ticket\.subject)\s*\}\}/g,
    (_, key: string) =>
      ({
        'requester.name': values.requester,
        'ticket.id': values.ticketId,
        'ticket.subject': values.subject,
      })[key as 'requester.name'],
  );
}
export function supportEmailText(template:string|undefined,reply:string,values:{requester:string;ticketId:string;subject:string}){
 if(!template)return reply;const bindings:Record<string,string>={'requester.name':values.requester,'ticket.id':values.ticketId,'ticket.subject':values.subject,'reply.body':reply};const rendered=template.replace(/\{\{\s*(requester\.name|ticket\.id|ticket\.subject|reply\.body)\s*\}\}/g,(_,key:string)=>bindings[key]);return /\{\{\s*reply\.body\s*\}\}/.test(template)?rendered:rendered+'\n\n'+reply;
}
