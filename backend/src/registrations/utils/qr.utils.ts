import * as QRCode from 'qrcode';

export async function generateQrCode(data: object): Promise<string> {
  const qrString = JSON.stringify(data);

  // Returns Base64 string (data:image/png;base64,...)
  return QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'H',
  });
}
