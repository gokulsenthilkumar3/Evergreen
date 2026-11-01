import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter?: nodemailer.Transporter;
  private secondary?: nodemailer.Transporter;
  private primaryFrom = process.env.SMTP_PRIMARY_FROM || process.env.SMTP_PRIMARY_USER || process.env.SMTP_USER || 'gokulkangeyan@gmail.com';
  private secondaryFrom = process.env.SMTP_SECONDARY_FROM || process.env.SMTP_SECONDARY_USER || 'gokulsenthilkumar3@zohomail.in';

  constructor() {
    const secondaryHost = process.env.SMTP_SECONDARY_HOST;
    const secondaryUser = process.env.SMTP_SECONDARY_USER;
    const secondaryPass = process.env.SMTP_SECONDARY_PASSWORD;
    if (secondaryHost && secondaryUser && secondaryPass) this.secondary = nodemailer.createTransport({ host: secondaryHost, port: Number(process.env.SMTP_SECONDARY_PORT || 465), secure: process.env.SMTP_SECONDARY_SECURE !== 'false', requireTLS: process.env.SMTP_SECONDARY_SECURE === 'false', auth: { user: secondaryUser, pass: secondaryPass }, connectionTimeout: 10000, socketTimeout: 20000 });
    const primarySpecific = Boolean(process.env.SMTP_PRIMARY_HOST || process.env.SMTP_PRIMARY_USER || process.env.SMTP_PRIMARY_FROM);
    const host = primarySpecific ? process.env.SMTP_PRIMARY_HOST : process.env.SMTP_HOST;
    const user = primarySpecific ? process.env.SMTP_PRIMARY_USER : process.env.SMTP_USER;
    const pass = primarySpecific ? process.env.SMTP_PRIMARY_PASSWORD : process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) return;
    this.transporter = nodemailer.createTransport({
      host,
      port: Number((primarySpecific ? process.env.SMTP_PRIMARY_PORT : process.env.SMTP_PORT) || 587),
      secure: (primarySpecific ? process.env.SMTP_PRIMARY_SECURE : process.env.SMTP_SECURE) === 'true',
      requireTLS: (primarySpecific ? process.env.SMTP_PRIMARY_SECURE : process.env.SMTP_SECURE) !== 'true',
      connectionTimeout: 10000, socketTimeout: 20000,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  readiness() {
    return [{ name: 'primary', configured: Boolean(this.transporter), sender: this.primaryFrom }, { name: 'secondary', configured: Boolean(this.secondary), sender: this.secondaryFrom }];
  }

  async verifyAccount(account: 'primary' | 'secondary') {
    const transport = account === 'primary' ? this.transporter : this.secondary;
    if (!transport) throw new ServiceUnavailableException('SMTP sender is not configured');
    try { await transport.verify(); return { connected: true, checkedAt: new Date().toISOString() }; }
    catch { throw new ServiceUnavailableException('SMTP authentication or connection failed; check the local app credentials and server settings'); }
  }

  async sendAccountMessage(to: string, subject: string, text: string, account: 'primary' | 'secondary' = 'primary') {
    const transport = account === 'primary' ? this.transporter : this.secondary;
    if (!transport) throw new ServiceUnavailableException('SMTP sender is not configured');
    const sender = account === 'primary' ? this.primaryFrom : this.secondaryFrom;
    const info = await transport.sendMail({ from: sender, to, subject, text });
    if (!info.accepted?.length) throw new ServiceUnavailableException('SMTP server did not accept the message');
    return { messageId: String(info.messageId), accepted: true, sender };
  }

  async sendLoginNotification(
    email: string,
    ip: string,
    userAgent: string,
    location: string,
  ) {
    if (!this.transporter && !this.secondary) {
      return;
    }

    return this.sendAccountMessage(email, 'New login detected — EverGreen', `Sign-in recorded.\nLocation: ${location}\nIP: ${ip}\nDevice: ${userAgent}\nTime: ${new Date().toISOString()}\nContact your administrator if you do not recognize this sign-in.`, this.transporter ? 'primary' : 'secondary');
  }
}
