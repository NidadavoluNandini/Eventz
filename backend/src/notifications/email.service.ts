import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    return this.transporter;
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachments?: { filename: string; path: string }[],
    html?: string,
  ) {
    try {
      const transporter = this.getTransporter();

      await transporter.verify(); // ✅ confirms SMTP connection

      await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          `"Eventz" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
        attachments,
      });

      console.log('✅ Email sent successfully to', to);
    } catch (e) {
      console.error('❌ Email failed:', e);
      throw new InternalServerErrorException(
        'Unable to send email. Please try again later.',
      );
    }
  }

  async sendTicketEmail(data: {
    to: string;
    subject: string;
    text: string;
    html: string;
    pdfPath: string;
  }) {
    await this.sendEmail(
      data.to,
      data.subject,
      data.text,
      [{ filename: 'ticket.pdf', path: data.pdfPath }],
      data.html,
    );
  }
}
