import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../services/prisma.service';

/**
 * DailySummaryService — Phase 4 gate
 * Fires at 23:59 IST (18:29 UTC) every day and sends a formatted
 * production + cost summary email to the configured recipient(s).
 */
@Injectable()
export class DailySummaryService {
  private readonly logger = new Logger(DailySummaryService.name);
  private transporter?: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    const host = process.env.SMTP_HOST;
    if (!host) {
      this.logger.warn('SMTP_HOST not set — daily summary emails disabled');
      return;
    }
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  /**
   * Cron: 23:29 UTC = 23:59 IST (UTC+5:30).
   * Re-verify this offset when IST daylight-saving rules change (currently none).
   */
  @Cron('29 23 * * *', { timeZone: 'UTC' })
  async sendDailySummary() {
    const recipient = process.env.DAILY_SUMMARY_EMAIL;
    if (!this.transporter || !recipient) {
      this.logger.log('Daily summary skipped (no SMTP or recipient configured)');
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [production, costs, settings] = await Promise.all([
        this.prisma.production.findFirst({
          where: { date: { gte: today, lt: tomorrow } },
          include: { producedYarn: true },
        }),
        this.prisma.costingEntry.findMany({
          where: { date: { gte: today, lt: tomorrow } },
        }),
        this.prisma.systemSettings.findFirst(),
      ]);

      const totalCost = costs.reduce((s: number, c: { totalCost: number | null }) => s + (c.totalCost || 0), 0);
      const totalProduced = production?.totalProduced || 0;
      const costPerKg = totalProduced > 0 ? totalCost / totalProduced : 0;
      const companyName = settings?.companyName || 'EverGreen Yarn Mills';
      const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      const yarnTable = production?.producedYarn?.length
        ? production.producedYarn
            .map((p: { count: string; bags: number; weight: number | string; remainingLog: number | string }) => `<tr><td>Count ${p.count}</td><td>${p.bags}</td><td>${Number(p.weight).toFixed(2)} kg</td><td>${Number(p.remainingLog).toFixed(2)} kg</td></tr>`)
            .join('')
        : '<tr><td colspan="4" style="text-align:center;color:#999">No production data</td></tr>';

      const costTable = costs.length
        ? costs
            .map((c: { category: string; totalCost: number | null }) => `<tr><td>${c.category}</td><td style="text-align:right">₹${Number(c.totalCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`)
            .join('')
        : '<tr><td colspan="2" style="text-align:center;color:#999">No cost entries</td></tr>';

      const html = `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; color: #222; background: #f9f9f9; }
  .card { background: white; border-radius: 8px; padding: 24px; margin: 16px auto; max-width: 600px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  h1 { color: #059669; margin: 0 0 4px; }
  h2 { color: #374151; font-size: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #f3f4f6; text-align: left; padding: 8px; font-size: 0.85rem; color: #6b7280; }
  td { padding: 8px; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
  .kpi { display: inline-block; background: #ecfdf5; border-radius: 6px; padding: 12px 20px; margin: 8px 8px 8px 0; }
  .kpi .val { font-size: 1.5rem; font-weight: bold; color: #059669; }
  .kpi .lbl { font-size: 0.75rem; color: #6b7280; }
  .footer { font-size: 0.75rem; color: #9ca3af; margin-top: 16px; }
</style></head>
<body>
<div class="card">
  <h1>🌿 ${companyName}</h1>
  <p style="color:#6b7280;margin:0 0 20px">Daily Summary — ${dateStr}</p>
  
  <div>
    <div class="kpi"><div class="val">${totalProduced.toLocaleString()} kg</div><div class="lbl">Total Yarn Produced</div></div>
    <div class="kpi"><div class="val">₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div><div class="lbl">Total Cost</div></div>
    <div class="kpi"><div class="val">₹${costPerKg.toFixed(2)}</div><div class="lbl">Cost per KG</div></div>
  </div>

  <h2>🧶 Yarn Production by Count</h2>
  <table>
    <tr><th>Count</th><th>Bags (60 kg)</th><th>Weight</th><th>Remaining Log</th></tr>
    ${yarnTable}
  </table>

  <h2>💰 Cost Breakdown</h2>
  <table>
    <tr><th>Category</th><th style="text-align:right">Amount</th></tr>
    ${costTable}
    <tr style="font-weight:bold;background:#f9fafb">
      <td>Total</td>
      <td style="text-align:right">₹${totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    </tr>
  </table>

  <div class="footer">
    Sent automatically at 23:59 IST by EverGreen. Do not reply to this email.
  </div>
</div>
</body>
</html>`;

      await this.transporter.sendMail({
        from: `"${companyName}" <noreply@evergreenyarn.com>`,
        to: recipient,
        subject: `📊 Daily Summary — ${dateStr}`,
        html,
      });

      this.logger.log(`✅ Daily summary sent to ${recipient}`);
    } catch (err) {
      this.logger.error('Failed to send daily summary', err);
    }
  }
}
