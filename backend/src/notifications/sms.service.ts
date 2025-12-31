import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  async sendSms(phone: string, message: string) {
    // 🔴 Replace later with Twilio / Fast2SMS
    console.log('📱 SMS SENT');
    console.log('Phone:', phone);
    console.log('Message:', message);

    return { success: true };
  }
}
