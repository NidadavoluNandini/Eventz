// ticket-confirmation.template.ts
export function ticketConfirmationTemplate(data: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketName: string;
  registrationNumber: string;
  quantity: number;
  totalAmount: number;
}) {
  return `
    <h2>🎟 Ticket Confirmed</h2>
    <p>Hello ${data.userName},</p>
    <p><b>Event:</b> ${data.eventTitle}</p>
    <p><b>Ticket:</b> ${data.ticketName}</p>
    <p><b>Quantity:</b> ${data.quantity}</p>
    <p><b>Total Paid:</b> ₹${data.totalAmount}</p>
    <p><b>Registration No:</b> ${data.registrationNumber}</p>
  `;
}
