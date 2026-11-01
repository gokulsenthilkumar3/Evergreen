import {
  businessMilliseconds,
  renderSupportMacro,
  supportSla,
  validateSupportResource,
} from './helpdesk-resources';
describe('Support calendars and SLA honesty', () => {
  const calendar = {
    timezone: 'Asia/Kolkata',
    weekdays: [1, 2, 3, 4, 5],
    startMinute: 540,
    endMinute: 1020,
    holidays: ['2026-11-02'],
  };
  it('excludes weekends, holidays and off-hours', () => {
    expect(
      businessMilliseconds(
        new Date('2026-10-30T10:30:00Z'),
        new Date('2026-11-03T04:30:00Z'),
        calendar,
      ) / 60000,
    ).toBe(120);
  });
  it('keeps working hours correct across a daylight-saving boundary', () => {
    const us = { ...calendar, timezone: 'America/New_York', holidays: [] };
    expect(
      businessMilliseconds(
        new Date('2026-10-30T13:00:00Z'),
        new Date('2026-11-02T22:00:00Z'),
        us,
      ) / 3600000,
    ).toBe(16);
  });
  it('separates a recorded reply from delivery evidence and pauses pending resolution time', () => {
    const start = new Date('2026-11-01T00:00:00Z');
    const ticket = {
      createdAt: start,
      resolvedAt: null,
      status: 'PENDING',
      slaPolicyJson: JSON.stringify({
        title: 'Normal',
        responseMinutes: 60,
        resolutionMinutes: 60,
        pausePending: true,
      }),
    };
    const value = supportSla(
      ticket,
      [
        {
          kind: 'PUBLIC_REPLY',
          actorId: 3,
          payload: '{}',
          createdAt: new Date('2026-11-01T00:30:00Z'),
        },
        {
          kind: 'PENDING',
          actorId: 3,
          payload: JSON.stringify({ status: 'PENDING' }),
          createdAt: new Date('2026-11-01T00:45:00Z'),
        },
      ],
      1,
      new Date('2026-11-01T02:00:00Z'),
    );
    expect(value).toMatchObject({
      responseClaim: 'RECORDED_WITHIN_TARGET',
      deliveryProof: 'UNAVAILABLE',
      resolutionElapsedMinutes: 45,
      resolutionBreach: false,
      paused: true,
    });
  });
  it('validates resource data instead of accepting arbitrary executable rules', () => {
    expect(() =>
      validateSupportResource('QUEUE', {
        members: [1],
        capacity: 0,
        routing: 'MANUAL',
      }),
    ).toThrow();
    expect(() =>
      validateSupportResource('CALENDAR', { timezone: 'Invalid/Zone' }),
    ).toThrow();
    expect(() =>
      validateSupportResource('RULE', {
        queue: 'TECHNICAL',
        script: 'execute()',
      }),
    ).not.toThrow();
    expect(
      validateSupportResource('RULE', {
        queue: 'TECHNICAL',
        script: 'execute()',
      }),
    ).not.toHaveProperty('script');
  });
  it('expands only the documented safe macro variables', () => {
    expect(
      renderSupportMacro(
        'Hello {{requester.name}}: {{ticket.id}} / {{ticket.subject}} {{process.env.SECRET}}',
        { requester: 'Alice', ticketId: 'T1', subject: 'Invoice' },
      ),
    ).toBe('Hello Alice: T1 / Invoice {{process.env.SECRET}}');
  });
});
