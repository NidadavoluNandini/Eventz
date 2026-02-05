import api from "../utils/axios";

// PUBLIC – initiate registration (send OTP)
export const initiateRegistration = (data: {
  eventId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  ticketName: string;
  subTicketName?: string | null; // ✅ ADD THIS LINE
  quantity: number;
}) => {
  return api.post("/api/registrations/initiate", data);
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



// ✅ CORRECT endpoint
export const getEventRegistrations = (eventId: string) =>
  api.get(`/api/tickets/event/${eventId}`);


export const resendOtpApi = (registrationId: string) => {
  return api.post("/api/registrations/resend-otp", {
    registrationId,
  });
};