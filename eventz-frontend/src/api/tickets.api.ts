import api from '../utils/axios';

export const verifyQr = (qrData: string) =>
  api.post('/tickets/verify-qr', { qrData });
