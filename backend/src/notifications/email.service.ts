import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(
    to: string,
    subject: string,
    text?: string,
    html?: string,
  ) {
    try {
      await this.resend.emails.send({
        from: 'Eventz <noreply@eventstg.online>',
        to,
        subject,
        html: html || `<p>${text}</p>`,
      });
    } catch (error) {
      console.error('Resend email error:', error);
      throw new InternalServerErrorException('Unable to send email');
    }
  }

  async sendOtpEmail(email: string, otp: string) {
    return this.sendEmail(
      email,
      'Your OTP - Eventz',
      '',
      `
        <h2>Your OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    );
  }
async sendTicketEmail(data: {
  to: string;
  subject: string;
  html: string;
  pdfBuffer: Buffer;
}) {
  await this.resend.emails.send({
    from: 'Eventz <tickets@eventstg.online>',
    to: data.to,
    subject: data.subject,
    html: data.html,
    attachments: [
      {
        filename: 'ticket.pdf',
        content: data.pdfBuffer,
      },
    ],
  });
}

}
