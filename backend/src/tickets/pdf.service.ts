import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateTicketPdf(data: {
    userName: string;
    eventTitle: string;
    venue: string;
    eventDate: Date;
    registrationNumber: string;
    ticketType: string;
    qrCode: string;
    amount?: number;
  }): Promise<string> {
    const dir = path.join(process.cwd(), 'uploads/tickets');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${data.registrationNumber}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(fs.createWriteStream(filePath));

    /* ================= HEADER ================= */
    doc
      .fontSize(24)
      .fillColor('#111827')
      .text('EVENT TICKET', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fontSize(14)
      .fillColor('#6B7280')
      .text(data.eventTitle, { align: 'center' });

    doc.moveDown(1);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#E5E7EB')
      .stroke();

    doc.moveDown(1.5);

    /* ================= DETAILS ================= */
    doc.fontSize(12).fillColor('#111827');

    const leftX = 60;
    const rightX = 300;
    let y = doc.y;

    doc.text('Name', leftX, y);
    doc.text(data.userName, leftX, y + 15);

    doc.text('Ticket Type', rightX, y);
    doc.text(data.ticketType, rightX, y + 15);

    y += 45;

    doc.text('Date', leftX, y);
    doc.text(new Date(data.eventDate).toDateString(), leftX, y + 15);

    doc.text('Venue', rightX, y);
    doc.text(data.venue, rightX, y + 15);

    y += 45;

    doc.text('Registration Number', leftX, y);
    doc.text(data.registrationNumber, leftX, y + 15);

    if (data.amount !== undefined) {
      doc.text('Amount Paid', rightX, y);
      doc.text(`₹ ${data.amount}`, rightX, y + 15);
    }

    doc.moveDown(4);

    /* ================= QR SECTION ================= */
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#E5E7EB')
      .stroke();

    doc.moveDown(1);

    doc
      .fontSize(12)
      .fillColor('#374151')
      .text('Scan this QR code at the event entry', { align: 'center' });

    doc.moveDown(1);

    const base64 = data.qrCode.split(',')[1];
    const qrBuffer = Buffer.from(base64, 'base64');

    doc.image(qrBuffer, doc.page.width / 2 - 75, doc.y, {
      width: 150,
    });

    doc.moveDown(6);

    /* ================= FOOTER ================= */
    doc
      .fontSize(10)
      .fillColor('#9CA3AF')
      .text(
        'This ticket is auto-generated. Please carry a valid ID for verification.',
        { align: 'center' },
      );

    doc.end();

    return filePath;
  }
}
