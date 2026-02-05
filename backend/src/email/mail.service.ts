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
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP - Eventz</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header with Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Security Code</h1>
                  <p style="margin: 10px 0 0 0; color: #E0E7FF; font-size: 14px;">One-Time Password Verification</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hello,
                  </p>
                  <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Use the following One-Time Password (OTP) to complete your authentication. This code is valid for <strong>5 minutes</strong>.
                  </p>

                  <!-- OTP Box -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); border: 3px dashed #4F46E5; border-radius: 12px; padding: 30px 50px;">
                              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-align: center;">Your OTP Code</p>
                              <h2 style="margin: 0; color: #1F2937; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace; text-align: center;">${otp}</h2>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Security Warning -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                          <strong>Security Notice:</strong> Never share this code with anyone. Eventz team will never ask for your OTP.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                    If you didn't request this code, please ignore this email or contact our support team.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 10px 0; color: #9CA3AF; font-size: 12px;">
                    This is an automated message from <strong>Eventz</strong>
                  </p>
                  <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                    Need help? <a href="mailto:${process.env.EMAIL_FROM}" style="color: #4F46E5; text-decoration: none;">Contact Support</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await this.transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your OTP - Eventz',
    html,
  });
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
