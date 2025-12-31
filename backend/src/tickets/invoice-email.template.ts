export function invoiceEmailTemplate(data: {
  userName: string;
  eventTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;color:#ffffff;padding:24px;">
              <h2 style="margin:0;">🧾 Eventz Invoice</h2>
              <p style="margin:4px 0 0;">Payment Successful</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;color:#111827;">
              <p>Hi <strong>${data.userName}</strong>,</p>

              <p>
                Thank you for your payment for
                <strong>${data.eventTitle}</strong>.
              </p>

              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#f3f4f6;">
                  <th align="left">Description</th>
                  <th align="right">Amount</th>
                </tr>
                <tr>
                  <td>
                    Ticket × ${data.quantity}
                    <br/>
                    <small>₹${data.unitPrice} per ticket</small>
                  </td>
                  <td align="right">₹${data.totalAmount}</td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #e5e7eb;"><strong>Total Paid</strong></td>
                  <td align="right" style="border-top:1px solid #e5e7eb;">
                    <strong>₹${data.totalAmount}</strong>
                  </td>
                </tr>
              </table>

              <p style="margin-top:20px;">
                Your invoice PDF is attached to this email for your records.
              </p>

              <p style="margin-top:24px;">
                Thanks for choosing <strong>Eventz</strong> 🙌
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
              This is a system-generated invoice. No signature required.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
