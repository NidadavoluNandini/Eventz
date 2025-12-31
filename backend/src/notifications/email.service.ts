import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // ✅ BACKWARD COMPATIBLE + HTML SUPPORT
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachments?: { filename: string; path: string }[],
    html?: string,
  ) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,          // ⭐ HTML APPLIED
        attachments,
      });
    } catch (e) {
      console.error('Email failed:', e);
      throw new InternalServerErrorException('Email failed');
    }
  }

  // ✅ USED BY TicketsService
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
