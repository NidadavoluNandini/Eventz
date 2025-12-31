import api from '../utils/axios';
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// SEND OTP
export const sendOtp = async (data: {
  phone: string;
  email: string;
}) => {
  const res = await axios.post(
    `${API_URL}/auth/user/send-otp`,
    data
  );
  return res.data;
};

// VERIFY OTP
export const verifyOtp = async (data: {
  phone: string;
  otp: string;
}) => {
  const res = await axios.post(
    `${API_URL}/auth/user/verify-otp`,
    data
  );
  return res.data;
};

export const organizerLogin = (data: {
  email: string;
  password: string;
}) => api.post('/auth/organizer/login', data);

export const organizerRegister = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post('/auth/organizer/register', data);
