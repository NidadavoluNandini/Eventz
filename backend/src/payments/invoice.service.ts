import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
const PDFDocument = require('pdfkit');

import { Invoice } from './schemas/invoice.schema';
import { InvoiceCounter } from './schemas/invoice-counter.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceCounter.name)
    private counterModel: Model<InvoiceCounter>,
  ) {}

  private async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const counter = await this.counterModel.findOneAndUpdate(
      { year },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    return `INV-${year}-${String(counter.seq).padStart(4, '0')}`;
  }

  async generateInvoicePdf(dto: any): Promise<string> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const total = dto.quantity * dto.unitPrice;

    const dir = path.resolve('invoices');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const pdfPath = path.join(dir, `${invoiceNumber}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(fs.createWriteStream(pdfPath));

    /* ================= HEADER ================= */
    doc
      .fontSize(22)
      .fillColor('#111827')
      .text('INVOICE', { align: 'right' });

    doc
      .fontSize(10)
      .fillColor('#6B7280')
      .text(`Invoice Number: ${invoiceNumber}`, { align: 'right' })
      .text(`Date: ${new Date().toDateString()}`, { align: 'right' });

    doc.moveDown(2);

    /* ================= INTRO TEXT ================= */
    doc
      .fontSize(12)
      .fillColor('#111827')
      .text(
        'Thank you for registering for the event. This document serves as confirmation of your successful payment and event registration.',
      );

    doc.moveDown(1.5);

    /* ================= BILLING ================= */
    doc.fontSize(12).fillColor('#111827').text('Billed To');
    doc.moveDown(0.5);
    doc.text(dto.userName);
    doc.text(dto.userEmail);

    doc.moveDown(1.5);

    /* ================= EVENT ================= */
    doc
      .fontSize(12)
      .text(`Event Name: ${dto.eventTitle}`);

    doc.moveDown(1);

    /* ================= TABLE ================= */
    const tableTop = doc.y;

    doc.fontSize(11).fillColor('#111827');
    doc.text('Description', 50, tableTop);
    doc.text('Qty', 350, tableTop);
    doc.text('Unit Price', 410, tableTop);
    doc.text('Amount', 480, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .strokeColor('#E5E7EB')
      .stroke();

    const rowY = tableTop + 30;

    doc.text('Event Registration Ticket', 50, rowY);
    doc.text(String(dto.quantity), 350, rowY);
    doc.text(`₹ ${dto.unitPrice}`, 410, rowY);
    doc.text(`₹ ${total}`, 480, rowY);

    doc.moveDown(4);

    /* ================= TOTAL ================= */
    doc
      .fontSize(14)
      .fillColor('#111827')
      .text(`Total Amount Paid: ₹ ${total}`, { align: 'right' });

    doc.moveDown(2);

    /* ================= PAYMENT NOTE ================= */
    doc
      .fontSize(11)
      .fillColor('#374151')
      .text(
        'Payment has been received successfully. Please retain this invoice for your records and future reference.',
      );

    doc.moveDown(1.5);

    /* ================= FOOTER ================= */
    doc
      .fontSize(10)
      .fillColor('#9CA3AF')
      .text(
        'This is a system-generated invoice and does not require a physical signature.\nFor any queries, please contact the event organizer.',
        { align: 'center' },
      );

    doc.end();

    /* ================= SAVE IN DB ================= */
    await this.invoiceModel.create({
      invoiceNumber,
      registrationId: dto.registrationId,
      userName: dto.userName,
      userEmail: dto.userEmail,
      eventTitle: dto.eventTitle,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      totalAmount: total,
      pdfPath,
    });

    return pdfPath;
  }
}
