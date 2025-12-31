export function generateInvoiceNumber(
  year: number,
  count: number,
): string {
  return `INV-${year}-${count.toString().padStart(3, '0')}`;
}
