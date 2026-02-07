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
    console.log('Sending OTP Email:', { email, otp, type: typeof otp });

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
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Security Code</h1>
                    <p style="margin: 10px 0 0 0; color: #E0E7FF; font-size: 14px;">One-Time Password Verification</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hello,
                    </p>
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Use the following One-Time Password (OTP) to complete your authentication. This code is valid for <strong>5 minutes</strong>.
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); border: 3px dashed #4F46E5; border-radius: 12px;">
                            <tr>
                              <td style="padding: 30px 50px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                                <h2 style="margin: 0; color: #1F2937; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h2>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

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
                      If you did not request this code, please ignore this email or contact our support team.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px 0; color: #9CA3AF; font-size: 12px;">
                      This is an automated message from <strong>Eventz</strong>
                    </p>
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                      Need help? <a href="mailto:support@eventstg.online" style="color: #4F46E5; text-decoration: none;">Contact Support</a>
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

    return this.sendEmail(email, 'Your OTP - Eventz', '', html);
  }

  async sendTicketEmail(data: {
    to: string;
    eventName: string;
    userName: string;
    ticketType: string;
    registrationNumber: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
      quantity: number,  
    
    pdfBuffer: Buffer;
  }) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Ticket - ${data.eventName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Success Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Payment Successful</h1>
                    <p style="margin: 10px 0 0 0; color: #D1FAE5; font-size: 14px;">Your ticket is confirmed</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hello <strong>${data.userName}</strong>,
                    </p>
                    <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Your registration for <strong>${data.eventName}</strong> has been confirmed. Your ticket is attached to this email.
                    </p>

                    <!-- Event Details Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-radius: 12px; overflow: hidden; border: 2px solid #4F46E5;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="margin: 0 0 20px 0; color: #1F2937; font-size: 18px; font-weight: bold;">
                            Event Details
                          </h3>
                          
                          <!-- Event Name -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 12px;">
                            <tr>
                              <td style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; padding-bottom: 4px;">Event</td>
                            </tr>
                            <tr>
                              <td style="color: #1F2937; font-size: 16px; font-weight: bold;">${data.eventName}</td>
                            </tr>
                          </table>

                          <!-- Date & Time -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 12px;">
                            <tr>
                              <td width="50%" style="padding-right: 10px; vertical-align: top;">
                                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Date</p>
                                <p style="margin: 0; color: #1F2937; font-size: 14px; font-weight: bold;">${data.eventDate}</p>
                              </td>
                              <td width="50%" style="padding-left: 10px; vertical-align: top;">
                                <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Time</p>
                                <p style="margin: 0; color: #1F2937; font-size: 14px; font-weight: bold;">${data.eventTime}</p>
                              </td>
                            </tr>
                          </table>

                          <!-- Location -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 12px;">
                            <tr>
                              <td style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; padding-bottom: 4px;">Location</td>
                            </tr>
                            <tr>
                              <td style="color: #1F2937; font-size: 14px; font-weight: bold;">${data.eventLocation}</td>
                            </tr>
                          </table>

                          <!-- Ticket Type -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 12px;">
                            <tr>
                              <td style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; padding-bottom: 4px;">Ticket Type</td>
                            </tr>
                            <tr>
                              <td style="color: #1F2937; font-size: 14px; font-weight: bold;">${data.ticketType}</td>
                            </tr>
                          </table>

                          <!-- Quantity -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 12px;">
                            <tr>
                              <td style="color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; padding-bottom: 4px;">Quantity</td>
                            </tr>
                            <tr>
                              <td style="color: #1F2937; font-size: 14px; font-weight: bold;">${data.quantity}</td>
                            </tr>
                          </table>

                          <!-- Registration Number -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1F2937; border-radius: 8px; margin-top: 16px;">
                            <tr>
                              <td style="padding: 16px; text-align: center;">
                                <p style="margin: 0 0 6px 0; color: #9CA3AF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Registration Number</p>
                                <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px;">${data.registrationNumber}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Important Information -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px; background-color: #DBEAFE; border-left: 4px solid #3B82F6; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 12px 0; color: #1E3A8A; font-size: 14px; font-weight: bold;">Important Information</p>
                          <ul style="margin: 0; padding-left: 20px; color: #1E40AF; font-size: 14px; line-height: 1.8;">
                            <li>Your ticket PDF is attached to this email</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 30px;">
                      <tr>
                        <td align="center">
                          <a href="https://eventz-zeta.vercel.app/" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                            Explore More Events
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center;">
                      See you at the event.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 10px 0; color: #9CA3AF; font-size: 12px;">
                      This email was sent by <strong>Eventz</strong>
                    </p>
                    <p style="margin: 0 0 15px 0; color: #9CA3AF; font-size: 12px;">
                      Need help? <a href="mailto:interactwitai@gmail.com" style="color: #4F46E5; text-decoration: none;">Contact Support</a>
                    </p>
                    <p style="margin: 0; color: #D1D5DB; font-size: 11px;">
                      © 2026 Eventz. All rights reserved.
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

    await this.resend.emails.send({
      from: 'Eventz <tickets@eventstg.online>',
      to: data.to,
      subject: `Your Ticket for ${data.eventName}`,
      html,
      attachments: [
        {
          filename: 'ticket.pdf',
          content: data.pdfBuffer,
        },
      ],
    });
  }
}
