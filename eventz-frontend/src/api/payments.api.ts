import api from '../utils/axios';

export const createPaymentOrder = (registrationId: string) =>
  api.post('/payments/registration/create-order', { registrationId });

export const verifyPayment = (data: {
  registrationId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => api.post('/payments/registration/verify', data);
