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
    subTicketName?: string;
    basePricePerTicket: number;
    quantity: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
    qrCode: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points

      // ===============================
      // GRADIENT HEADER BACKGROUND
      // ===============================
      doc
        .rect(0, 0, pageWidth, 130)
        .fillAndStroke('#4F46E5', '#4F46E5');

      // Decorative circles
      doc
        .circle(pageWidth - 50, 50, 60)
        .fillOpacity(0.1)
        .fill('#FFFFFF');

      doc
        .circle(50, 100, 40)
        .fillOpacity(0.1)
        .fill('#FFFFFF');

      // ===============================
      // HEADER TITLE
      // ===============================
      doc.fillOpacity(1);
      doc
        .fontSize(28)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('EVENT TICKET', 50, 35, { align: 'center' });

      doc
        .fontSize(11)
        .fillColor('#E0E7FF')
        .font('Helvetica')
        .text('Your official admission pass', 50, 70, { align: 'center' });

      doc
        .fontSize(9)
        .fillColor('#C7D2FE')
        .text(`Registration: ${data.registrationNumber || 'N/A'}`, 50, 90, {
          align: 'center',
        });

      // ===============================
      // WHITE CONTENT AREA
      // ===============================
      const contentY = 150;

      // Event Title Box
      doc
        .roundedRect(50, contentY, pageWidth - 100, 70, 10)
        .fillAndStroke('#F3F4F6', '#E5E7EB');

      doc
        .fontSize(9)
        .fillColor('#6B7280')
        .font('Helvetica-Bold')
        .text('EVENT', 70, contentY + 12);

      doc
        .fontSize(18)
        .fillColor('#1F2937')
        .font('Helvetica-Bold')
        .text(data.eventTitle || 'Event', 70, contentY + 30, {
          width: pageWidth - 140,
          ellipsis: true,
        });

      // ===============================
      // ATTENDEE & EVENT DETAILS GRID
      // ===============================
      const detailsY = contentY + 85;
      const leftColX = 50;
      const rightColX = pageWidth / 2 + 10;
      const colWidth = pageWidth / 2 - 70;

      // Helper function to draw detail box
      const drawDetailBox = (
        x: number,
        y: number,
        label: string,
        value: string,
        iconSymbol?: string,
      ) => {
        doc
          .roundedRect(x, y, colWidth, 58, 8)
          .fillAndStroke('#FFFFFF', '#E5E7EB');

        doc
          .fontSize(8)
          .fillColor('#9CA3AF')
          .font('Helvetica-Bold')
          .text(label.toUpperCase(), x + 15, y + 10);

        // Draw icon circle if provided
        if (iconSymbol) {
          doc
            .circle(x + 22, y + 38, 12)
            .fillAndStroke('#EEF2FF', '#C7D2FE');

          doc
            .fontSize(10)
            .fillColor('#4F46E5')
            .font('Helvetica-Bold')
            .text(iconSymbol, x + 18, y + 31);
        }

        doc
          .fontSize(11)
          .fillColor('#1F2937')
          .font('Helvetica-Bold')
          .text(value || 'N/A', x + (iconSymbol ? 45 : 15), y + 30, {
            width: colWidth - (iconSymbol ? 60 : 30),
            ellipsis: true,
          });
      };

      // Left Column
      drawDetailBox(leftColX, detailsY, 'Attendee', data.userName, 'A');
      drawDetailBox(
        leftColX,
        detailsY + 68,
        'Date',
        data.eventDate
          ? data.eventDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'TBA',
        'D',
      );

      // Right Column
      drawDetailBox(rightColX, detailsY, 'Venue', data.venue, 'V');

      // ✅ TICKET TYPE - SHOW MAIN + SUB-TICKET
      const ticketDisplay = data.subTicketName
        ? `${data.ticketName} + ${data.subTicketName}`
        : data.ticketName;

      drawDetailBox(rightColX, detailsY + 68, 'Ticket Type', ticketDisplay, 'T');

      // ===============================
      // PAYMENT DETAILS SECTION
      // ===============================
      const paymentY = detailsY + 148;

      // ✅ COMPACT HEIGHT
      const paymentHeight = data.subTicketName ? 140 : 125;

      doc
        .roundedRect(50, paymentY, pageWidth - 100, paymentHeight, 10)
        .fillAndStroke('#EEF2FF', '#C7D2FE');

      doc
        .fontSize(11)
        .fillColor('#4338CA')
        .font('Helvetica-Bold')
        .text('PAYMENT DETAILS', 70, paymentY + 12);

      // Payment table
      const tableY = paymentY + 32;
      const drawRow = (label: string, value: string, y: number, bold = false) => {
        doc
          .fontSize(9)
          .fillColor('#4B5563')
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(label, 70, y);

        doc
          .fontSize(9)
          .fillColor('#1F2937')
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(value, pageWidth - 170, y, { width: 100, align: 'right' });
      };

      // ✅ SHOW MAIN TICKET
      drawRow('Ticket', data.ticketName || 'N/A', tableY);

      let currentY = tableY + 18;

      // ✅ SHOW SUB-TICKET IF EXISTS
      if (data.subTicketName) {
        drawRow('Option', data.subTicketName, currentY);
        currentY += 18;
      }

      drawRow(
        'Base Price (per ticket)',
        `₹${data.basePricePerTicket?.toFixed(2) || '0.00'}`,
        currentY,
      );
      drawRow('Quantity', `${data.quantity || 1}`, currentY + 18);
      drawRow(
        `GST (${data.gstRate || 0}%)`,
        `₹${data.gstAmount?.toFixed(2) || '0.00'}`,
        currentY + 36,
      );

      // Total line
      doc
        .moveTo(70, currentY + 56)
        .lineTo(pageWidth - 70, currentY + 56)
        .stroke('#C7D2FE');

      drawRow(
        'TOTAL PAID',
        `₹${data.totalAmount?.toFixed(2) || '0.00'}`,
        currentY + 64,
        true,
      );

      // ===============================
      // QR CODE SECTION
      // ===============================
      const qrY = paymentY + paymentHeight + 15;

      doc
        .roundedRect(50, qrY, pageWidth - 100, 165, 10)
        .fillAndStroke('#F9FAFB', '#E5E7EB');

      doc
        .fontSize(11)
        .fillColor('#6B7280')
        .font('Helvetica-Bold')
        .text('SCAN FOR ENTRY', 50, qrY + 12, {
          align: 'center',
          width: pageWidth - 100,
        });

      // QR Code
      try {
        const qrBase64 = data.qrCode.split(',')[1];
        const qrBuffer = Buffer.from(qrBase64, 'base64');

        doc.image(qrBuffer, pageWidth / 2 - 65, qrY + 35, {
          fit: [130, 130],
          align: 'center',
        });
      } catch (error) {
        // Fallback if QR code fails
        doc
          .fontSize(10)
          .fillColor('#EF4444')
          .text('QR Code unavailable', pageWidth / 2 - 65, qrY + 80, {
            width: 130,
            align: 'center',
          });
      }

      // ===============================
      // FOOTER INSTRUCTIONS
      // ===============================
      const footerY = qrY + 180;

      doc
        .rect(0, footerY, pageWidth, 75)
        .fillAndStroke('#F3F4F6', '#F3F4F6');

      doc
        .fontSize(9)
        .fillColor('#1F2937')
        .font('Helvetica-Bold')
        .text('IMPORTANT INSTRUCTIONS', 50, footerY + 10, {
          align: 'center',
          width: pageWidth - 100,
        });

      doc
        .fontSize(7.5)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(
          '- Please carry a printed or digital copy of this ticket\n' +
            '- Show this QR code at the venue entrance for check-in\n' +
            '- Arrive 15 minutes early for smooth entry\n' +
            '- This ticket is non-transferable and valid for one entry only',
          50,
          footerY + 26,
          { align: 'center', width: pageWidth - 100, lineGap: 2 },
        );

      // ===============================
      // WATERMARK
      // ===============================
      doc
        .fontSize(7)
        .fillColor('#D1D5DB')
        .font('Helvetica')
        .text(
          `Generated on ${new Date().toLocaleString('en-IN')} | Powered by Eventz`,
          0,
          footerY + 60,
          { align: 'center', width: pageWidth },
        );

      // ✅ FINISH PDF (NO EXTRA PAGES)
      doc.end();
    });
  }
}
