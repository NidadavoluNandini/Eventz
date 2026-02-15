import api from "../utils/axios";

type OtherAttendeePayload = {
  name: string;
  email: string;
  phone: string;
};

// PUBLIC – initiate registration (send OTP)
export const initiateRegistration = (data: {
  eventId: string;
  firstName: string;
  lastName:string;
  userEmail: string;
  userPhone: string;
  ticketName: string;
  subTicketName?: string | null;
  quantity: number;
  otherAttendees?: OtherAttendeePayload[]; // <-- add this
}) => {
  return api.post("/api/registrations/initiate", data);
};

// PUBLIC – verify OTP
export const verifyOtp = (data: {
  registrationId: string;
  otp: number;
}) => {
  return api.post("/api/registrations/verify-otp", data);
};

// PUBLIC – get registration (ticket success)
export const getRegistration = (id: string) => {
  return api.get(`/api/registrations/${id}`);
};

// ORGANIZER – event registrations (User Management)
export const getEventRegistrations = (eventId: string) =>
  api.get(`/api/registrations/event/${eventId}`);

// resend OTP
export const resendOtpApi = (registrationId: string) => {
  return api.post("/api/registrations/resend-otp", {
    registrationId,
  });
};
