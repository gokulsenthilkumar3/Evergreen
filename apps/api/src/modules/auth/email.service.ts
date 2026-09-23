import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter?: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (!host) return;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  async sendLoginNotification(
    email: string,
    ip: string,
    userAgent: string,
    location: string,
  ) {
    if (!this.transporter) {
      return;
    }

    const info = await this.transporter.sendMail({
      from: '"Ever Green Security" <security@evergreenyarn.com>',
      to: email,
      subject: 'New Login Detected - Ever Green Yarn Mills',
      html: `
                <h2>New Login Detected</h2>
                <p>We noticed a new login to your Ever Green account.</p>
                <ul>
                    <li><strong>Location:</strong> ${location}</li>
                    <li><strong>IP Address:</strong> ${ip}</li>
                    <li><strong>Device:</strong> ${userAgent}</li>
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
                <p>If this was you, you can safely ignore this email.</p>
                <p>If you don't recognize this activity, please contact your administrator immediately.</p>
            `,
    });

    console.log('📧 Login notification sent!');
    return info.messageId;
  }
}
