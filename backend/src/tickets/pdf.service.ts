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

    ticketName: string;
    basePricePerTicket: number;
    quantity: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;

    qrCode: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ===============================
      // HEADER
      // ===============================
      doc.fontSize(22).text('EVENT TICKET', { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(16).text(data.eventTitle, { align: 'center' });
      doc.moveDown(2);

      // ===============================
      // USER DETAILS
      // ===============================
      doc.fontSize(12);
      doc.text(`Name: ${data.userName}`);
      doc.text(`Venue: ${data.venue}`);
      doc.text(`Date: ${data.eventDate.toDateString()}`);
      doc.text(`Registration No: ${data.registrationNumber}`);

      doc.moveDown(1.5);

      // ===============================
      // TICKET + GST BREAKUP (DISPLAY ONLY)
      // ===============================
      doc.fontSize(14).text('Ticket Details', { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12);
      doc.text(`Ticket Type: ${data.ticketName}`);
      doc.text(
        `Base Price (per ticket): ₹${data.basePricePerTicket}`,
      );
      doc.text(`Quantity: ${data.quantity}`);
      doc.text(`GST (${data.gstRate}%): ₹${data.gstAmount}`);

      doc.moveDown(0.5);
      doc.fontSize(14).text(
        `Total Paid: ₹${data.totalAmount}`,
        { bold: true },
      );

      doc.moveDown(2);

      // ===============================
      // QR CODE
      // ===============================
      const qrBase64 = data.qrCode.split(',')[1];
      const qrBuffer = Buffer.from(qrBase64, 'base64');

      doc.image(qrBuffer, {
        fit: [150, 150],
        align: 'center',
      });

      doc.end();
    });
  }
}
