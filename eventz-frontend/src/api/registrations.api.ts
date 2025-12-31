import api from "../utils/axios";

// PUBLIC – initiate registration (send OTP)
export const initiateRegistration = (data: {
  eventId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  ticketType: string;
}) => {
  return api.post("/registrations/initiate", data);
};

// PUBLIC – verify OTP
export const verifyOtp = (data: {
  registrationId: string;
  otp: number;
}) => {
  return api.post("/registrations/verify-otp", data);
};

// PUBLIC – get registration (ticket success)
export const getRegistration = (id: string) => {
  return api.get(`/registrations/${id}`);
};

// ORGANIZER – attendees list
export const getEventRegistrations = (eventId: string) => {
  return api.get(`/registrations/event/${eventId}`);
};
