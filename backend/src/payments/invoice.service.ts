import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

import { Invoice } from './schemas/invoice.schema';
import { InvoiceCounter } from './schemas/invoice-counter.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice>,

    @InjectModel(InvoiceCounter.name)
    private readonly counterModel: Model<InvoiceCounter>,
  ) {}

  // ======================================================
  // 🔢 AUTO INVOICE NUMBER
  // ======================================================
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const counter = await this.counterModel.findOneAndUpdate(
      { year },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );

    return `INV-${year}-${String(counter.seq).padStart(4, '0')}`;
  }

  // ======================================================
  // ❌ FILE-BASED PDF (OPTIONAL — KEEP FOR ADMIN DOWNLOAD)
  // ======================================================
  async generateInvoicePdf(dto: {
    registrationId: string;
    eventTitle: string;
    userName: string;
    userEmail: string;
    quantity: number;
    unitPrice: number;
  }): Promise<string> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const total = dto.quantity * dto.unitPrice;

    const dir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfPath = path.join(dir, `${invoiceNumber}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(fs.createWriteStream(pdfPath));

    this.buildInvoicePdf(doc, {
      invoiceNumber,
      ...dto,
      total,
    });

    doc.end();

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

  // ======================================================
  // ✅ BUFFER-BASED PDF (RECOMMENDED FOR EMAIL)
  // ======================================================
  async generateInvoicePdfBuffer(dto: {
    registrationId: string;
    eventTitle: string;
    userName: string;
    userEmail: string;
    quantity: number;
    unitPrice: number;
  }): Promise<Buffer> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const total = dto.quantity * dto.unitPrice;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const buffer = Buffer.concat(buffers);

        await this.invoiceModel.create({
          invoiceNumber,
          registrationId: dto.registrationId,
          userName: dto.userName,
          userEmail: dto.userEmail,
          eventTitle: dto.eventTitle,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
          totalAmount: total,
          
        });

        resolve(buffer);
      });

      doc.on('error', reject);

      this.buildInvoicePdf(doc, {
        invoiceNumber,
        ...dto,
        total,
      });

      doc.end();
    });
  }

  // ======================================================
  // 🧾 COMMON PDF LAYOUT
  // ======================================================
  private buildInvoicePdf(
    doc: PDFDocument,
    data: {
      invoiceNumber: string;
      registrationId: string;
      eventTitle: string;
      userName: string;
      userEmail: string;
      quantity: number;
      unitPrice: number;
      total: number;
    },
  ) {
    /* ---------- HEADER ---------- */
    doc.fontSize(22).text('INVOICE', { align: 'right' });
    doc
      .fontSize(10)
      .text(`Invoice No: ${data.invoiceNumber}`, { align: 'right' })
      .text(`Date: ${new Date().toDateString()}`, { align: 'right' });

    doc.moveDown(2);

    /* ---------- CUSTOMER ---------- */
    doc.fontSize(12).text('Billed To');
    doc.moveDown(0.5);
    doc.text(data.userName);
    doc.text(data.userEmail);

    doc.moveDown(1.5);

    /* ---------- EVENT ---------- */
    doc.fontSize(12).text(`Event: ${data.eventTitle}`);
    doc.moveDown();

    /* ---------- TABLE ---------- */
    const y = doc.y;

    doc.fontSize(11);
    doc.text('Description', 50, y);
    doc.text('Qty', 350, y);
    doc.text('Unit Price', 420, y);
    doc.text('Amount', 490, y);

    doc
      .moveTo(50, y + 15)
      .lineTo(545, y + 15)
      .stroke();

    const rowY = y + 30;

    doc.text('Event Registration Ticket', 50, rowY);
    doc.text(String(data.quantity), 350, rowY);
    doc.text(`₹ ${data.unitPrice}`, 420, rowY);
    doc.text(`₹ ${data.total}`, 490, rowY);

    doc.moveDown(4);

    /* ---------- TOTAL ---------- */
    doc
      .fontSize(14)
      .text(`Total Paid: ₹ ${data.total}`, { align: 'right' });

    doc.moveDown(2);

    /* ---------- FOOTER ---------- */
    doc
      .fontSize(10)
      .fillColor('#6B7280')
      .text(
        'This is a system generated invoice. No signature required.',
        { align: 'center' },
      );
  }
}
