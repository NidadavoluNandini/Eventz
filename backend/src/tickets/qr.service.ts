import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  async generateQr(data: {
    registrationId: string;
    registrationNumber: string;
    eventId: string;
  }): Promise<string> {
    const payload = JSON.stringify({
      rId: data.registrationId,
      rNo: data.registrationNumber,
      eId: data.eventId,
      v: 1, // versioning (future-proof)
    });

    return QRCode.toDataURL(payload);
  }
}
