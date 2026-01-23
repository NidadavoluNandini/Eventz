import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateTicketPdfBuffer(data: {
    userName: string;
    eventTitle: string;
    venue: string;
    eventDate: Date;
    registrationNumber: string;
    ticketType: string;
    qrCode: string;
    amount?: number;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      doc.on('error', reject);

      /* ===== PDF CONTENT ===== */

      doc.fontSize(24).text('EVENT TICKET', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(data.eventTitle, { align: 'center' });
      doc.moveDown();

      doc.text(`Name: ${data.userName}`);
      doc.text(`Ticket Type: ${data.ticketType}`);
      doc.text(`Date: ${new Date(data.eventDate).toDateString()}`);
      doc.text(`Venue: ${data.venue}`);
      doc.text(`Registration: ${data.registrationNumber}`);

      if (data.amount !== undefined) {
        doc.text(`Amount Paid: ₹${data.amount}`);
      }

      doc.moveDown();

      const qrBase64 = data.qrCode.split(',')[1];
      const qrBuffer = Buffer.from(qrBase64, 'base64');

      doc.image(qrBuffer, {
        fit: [200, 200],
        align: 'center',
      });

      doc.end();
    });
  }
}
