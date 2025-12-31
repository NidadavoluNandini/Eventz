import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from './schemas/contact.schema';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<Contact>,
    private readonly emailService: EmailService,
  ) {}

  // ===============================
  // CREATE CONTACT MESSAGE
  // ===============================
  async create(dto: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    try {
      // ✅ SAVE ONLY FIELDS THAT EXIST IN SCHEMA
      const contact = await this.contactModel.create({
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      });

      this.logger.log(`New contact message from ${dto.email}`);

      // ✅ Send emails (do not block DB save)
      await Promise.allSettled([
        this.sendAdminNotification(dto),
        this.sendUserConfirmation(dto),
      ]);

      return {
        success: true,
        message: 'Message sent successfully. We will get back to you soon!',
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        'Failed to send message. Please try again later.',
      );
    }
  }

  // ===============================
  // ADMIN NOTIFICATION EMAIL
  // ===============================
  private async sendAdminNotification(dto: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const adminEmail =
      process.env.CONTACT_RECEIVER_EMAIL || 'support@eventz.com';

    const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Message</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 48px; padding-bottom: 10px;">📩</td>
                </tr>
                <tr>
                  <td align="center" style="color: #ffffff; font-size: 28px; font-weight: bold; padding-bottom: 8px;">New Contact Message</td>
                </tr>
                <tr>
                  <td align="center" style="color: rgba(255,255,255,0.9); font-size: 14px;">Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              
              <!-- Sender Info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 6px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="color: #1f2937; font-size: 18px; font-weight: bold; padding-bottom: 15px;">👤 Sender Information</td>
                      </tr>
                      <tr>
                        <td>
                          <table border="0" cellpadding="8" cellspacing="0" width="100%">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 600; width: 100px;">Name:</td>
                              <td style="color: #1f2937; font-size: 14px; font-weight: 600;">${dto.name}</td>
                            </tr>
                            <tr style="border-top: 1px solid #e5e7eb;">
                              <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Email:</td>
                              <td><a href="mailto:${dto.email}" style="color: #4f46e5; font-size: 14px; font-weight: 600; text-decoration: none;">${dto.email}</a></td>
                            </tr>
                            <tr style="border-top: 1px solid #e5e7eb;">
                              <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Subject:</td>
                              <td style="color: #1f2937; font-size: 14px; font-weight: 600;">${dto.subject}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="color: #1f2937; font-size: 18px; font-weight: bold; padding-bottom: 12px;">💬 Message</td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${dto.message}</p>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="mailto:${dto.email}?subject=Re: ${encodeURIComponent(dto.subject)}" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">✉️ Reply to ${dto.name}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">This is an automated notification from <strong style="color: #4f46e5;">Eventz Contact System</strong></p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Eventz. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await this.emailService.sendEmail(
      adminEmail,
      `📩 New Contact Message: ${dto.subject}`,
      `
New Contact Message Received

Name: ${dto.name}
Email: ${dto.email}
Subject: ${dto.subject}

Message:
${dto.message}

— Eventz
      `,
      undefined,
      htmlContent,
    );

    this.logger.log(`Admin email sent to ${adminEmail}`);
  }

  // ===============================
  // USER CONFIRMATION EMAIL
  // ===============================
  private async sendUserConfirmation(dto: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Message Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 48px; padding-bottom: 10px;">✅</td>
                </tr>
                <tr>
                  <td align="center" style="color: #ffffff; font-size: 28px; font-weight: bold; padding-bottom: 8px;">Message Received!</td>
                </tr>
                <tr>
                  <td align="center" style="color: rgba(255,255,255,0.9); font-size: 14px;">We'll get back to you soon</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              
              <!-- Greeting -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="color: #374151; font-size: 16px; line-height: 1.6;">
                    Hello <strong style="color: #1f2937;">${dto.name}</strong>,
                  </td>
                </tr>
              </table>

              <!-- Main Message -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="color: #374151; font-size: 15px; line-height: 1.6;">
                    Thank you for reaching out to <strong style="color: #4f46e5;">Eventz</strong>! We have successfully received your message and our team will review it shortly.
                  </td>
                </tr>
              </table>

              <!-- Response Time Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 6px;">
                    <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600; padding-bottom: 8px;">⏱️ Expected Response Time</p>
                    <p style="margin: 0; color: #047857; font-size: 13px;">We typically respond within <strong>24 hours</strong> during business hours (Mon-Fri, 9 AM - 6 PM IST)</p>
                  </td>
                </tr>
              </table>

              <!-- Message Summary -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="background-color: #f9fafb; border-radius: 6px; padding: 20px; border: 1px solid #e5e7eb;">
                    <p style="color: #1f2937; font-size: 16px; font-weight: bold; margin: 0 0 12px;">Your Message Summary</p>
                    <table border="0" cellpadding="8" cellspacing="0" width="100%">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Subject:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${dto.subject}</td>
                      </tr>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td>
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px; font-weight: 600;">Message:</p>
                          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${dto.message.substring(0, 200)}${dto.message.length > 200 ? '...' : ''}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Urgent Help Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 6px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600; padding-bottom: 8px;">🚨 Need Urgent Help?</p>
                    <p style="margin: 0; color: #b45309; font-size: 13px;">Call us at <a href="tel:+919876543210" style="color: #d97706; text-decoration: none; font-weight: 700;">+91 9876543210</a></p>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td style="color: #1f2937; font-size: 16px; font-weight: bold; padding-bottom: 12px;">What Happens Next?</td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td valign="top" style="padding: 8px 12px 8px 0; width: 32px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="32" height="32" style="background-color: #e0e7ff; border-radius: 6px;">
                            <tr>
                              <td align="center" valign="middle" style="color: #4f46e5; font-weight: bold; font-size: 14px;">1</td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" style="color: #4b5563; font-size: 14px; line-height: 1.6; padding: 8px 0;">Our team reviews your message</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding: 8px 12px 8px 0; width: 32px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="32" height="32" style="background-color: #e0e7ff; border-radius: 6px;">
                            <tr>
                              <td align="center" valign="middle" style="color: #4f46e5; font-weight: bold; font-size: 14px;">2</td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" style="color: #4b5563; font-size: 14px; line-height: 1.6; padding: 8px 0;">We prepare a detailed response</td>
                      </tr>
                      <tr>
                        <td valign="top" style="padding: 8px 12px 8px 0; width: 32px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="32" height="32" style="background-color: #e0e7ff; border-radius: 6px;">
                            <tr>
                              <td align="center" valign="middle" style="color: #4f46e5; font-weight: bold; font-size: 14px;">3</td>
                            </tr>
                          </table>
                        </td>
                        <td valign="top" style="color: #4b5563; font-size: 14px; line-height: 1.6; padding: 8px 0;">You receive our reply via email</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Browse Events Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">While you wait, explore our platform</p>
                    <a href="${process.env.FRONTEND_URL || 'https://eventz.com'}" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">🎉 Browse Events</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px;"><strong style="color: #4f46e5;">Eventz</strong> - Your Gateway to Amazing Events</p>
              <p style="color: #9ca3af; font-size: 11px; margin: 12px 0 0;">This is an automated confirmation email. Please do not reply to this message.</p>
              <p style="color: #9ca3af; font-size: 11px; margin: 4px 0 0;">© ${new Date().getFullYear()} Eventz. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await this.emailService.sendEmail(
      dto.email,
      '✅ We received your message – Eventz',
      `
Hi ${dto.name},

Thank you for contacting Eventz.

We have received your message regarding:
"${dto.subject}"

Our team will respond shortly.

— Team Eventz
      `,
      undefined,
      htmlContent,
    );

    this.logger.log(`Confirmation email sent to ${dto.email}`);
  }

  // ===============================
  // FETCH ALL CONTACTS
  // ===============================
  async findAll() {
    return this.contactModel.find().sort({ _id: -1 }); // sort by latest without timestamps
  }
}
