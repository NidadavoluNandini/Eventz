import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

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

  async sendOtpEmail(email: string, otp: number) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Eventz OTP',
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `,
    });

    console.log('📨 OTP EMAIL SENT TO:', email);
  }
async sendEmail(
  to: string,
  subject: string,
  text: string,
  attachments?: { filename: string; path: string }[],
) {
  const mailOptions: any = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  };

  if (attachments?.length) {
    mailOptions.attachments = attachments;
  }

  await this.transporter.sendMail(mailOptions);
}

}
