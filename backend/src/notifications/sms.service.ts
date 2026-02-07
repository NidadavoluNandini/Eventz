import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  async sendSms(phone: string, message: string) {
    // 🔴 Replace later with Twilio / Fast2SMS
  


    return { success: true };
  }
}
