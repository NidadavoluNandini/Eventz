export function ticketConfirmationTemplate(data: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  registrationNumber: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Ticket Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#111827;color:#ffffff;padding:24px;">
              <h2 style="margin:0;">🎟 Eventz</h2>
              <p style="margin:4px 0 0;">Your ticket is confirmed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;color:#111827;">
              <p>Hi <strong>${data.userName}</strong>,</p>

              <p>
                Your registration for <strong>${data.eventTitle}</strong> has been
                <strong style="color:#16a34a;">successfully confirmed</strong>.
              </p>

              <table width="100%" cellpadding="8" cellspacing="0" style="background:#f9fafb;border-radius:6px;">
                <tr>
                  <td><strong>📅 Date</strong></td>
                  <td>${data.eventDate}</td>
                </tr>
                <tr>
                  <td><strong>📍 Venue</strong></td>
                  <td>${data.venue}</td>
                </tr>
                <tr>
                  <td><strong>🎫 Ticket Type</strong></td>
                  <td>${data.ticketType}</td>
                </tr>
                <tr>
                  <td><strong>🆔 Registration No</strong></td>
                  <td>${data.registrationNumber}</td>
                </tr>
              </table>

              <p style="margin-top:20px;">
                Your ticket (PDF with QR code) is attached to this email.
                Please show it at the event entrance.
              </p>

              <p style="margin-top:24px;">
                We look forward to seeing you! 😊
              </p>

              <p>
                — Team <strong>Eventz</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:16px;text-align:center;font-size:12px;color:#6b7280;">
              © ${new Date().getFullYear()} Eventz. All rights reserved.
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
