import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.init();
    }

    private async init() {
        // Create an Ethereal test account automatically
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    async sendLoginNotification(email: string, ip: string, userAgent: string, location: string) {
        if (!this.transporter) {
            console.warn('Email service not initialized yet');
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
        console.log('📧 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
}
