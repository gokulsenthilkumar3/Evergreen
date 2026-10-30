import 'reflect-metadata';
import {
  DailySummaryService,
  summarizeProduction,
} from './daily-summary.service';

describe('daily summary', () => {
  it('runs at 23:59 on the server clock, the clock that defines the business day', () => {
    const options = Reflect.getMetadata(
      'SCHEDULE_CRON_OPTIONS',
      DailySummaryService.prototype.sendDailySummary,
    );
    expect(options.cronTime).toBe('59 23 * * *');
    expect(options.timeZone).toBeUndefined();
  });

  it('totals every run of the day and combines yarn by count', () => {
    const yarn = (count: string, bags: number, weight: number) => ({
      count,
      bags,
      weight,
      remainingLog: 0,
    });
    expect(
      summarizeProduction([
        {
          totalProduced: 600,
          producedYarn: [yarn('40', 5, 300), yarn('30', 5, 300)],
        },
        { totalProduced: 120, producedYarn: [yarn('40', 2, 120)] },
      ]),
    ).toEqual({
      totalProduced: 720,
      yarn: [
        { count: '40', bags: 7, weight: 420, remainingLog: 0 },
        { count: '30', bags: 5, weight: 300, remainingLog: 0 },
      ],
    });
  });

  it('reports nothing for a day without production', () => {
    expect(summarizeProduction([])).toEqual({ totalProduced: 0, yarn: [] });
  });
});
