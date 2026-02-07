// api/events.api.ts
import api from "../utils/axios";

// ================= PUBLIC =================

export const getAllEvents = () =>
  api.get("/api/events");

export const getEventById = (id: string) =>
  api.get(`/api/events/${id}`);

// ================= ORGANIZER =================

export const createEvent = (data: any) =>
  api.post("/api/events", data);

export const getOrganizerEvents = () =>
  api.get("/api/events/organizer/me");

export const updateEvent = (id: string, data: any) =>
  api.put(`/api/events/${id}`, data);

// ✅ PUBLISH EVENT (Make visible + open registration)
export const publishEvent = (id: string) =>
  api.patch(`/api/events/${id}/publish`);

// ✅ UNPUBLISH EVENT (Hide + close registration - pause temporarily)
export const unpublishEvent = (id: string) =>
  api.patch(`/api/events/${id}/unpublish`);

// ✅ COMPLETE EVENT (Hide from public, keep in organizer panel)
export const completeEvent = (id: string) =>
  api.patch(`/api/events/${id}/complete`);

// ✅ MOVE TO DRAFT (For editing existing event)
export const moveToDraft = (id: string) =>
  api.patch(`/api/events/${id}/draft`);

// ✅ CLOSE REGISTRATION (Keep visible but stop new registrations)
export const closeRegistration = (id: string) =>
  api.patch(`/api/events/${id}/close-registration`);

// ✅ OPEN REGISTRATION (Resume accepting registrations)
export const openRegistration = (id: string) =>
  api.patch(`/api/events/${id}/open-registration`);

// ✅ DELETE EVENT (Permanent deletion)
export const deleteEvent = (id: string) =>
  api.delete(`/api/events/${id}`);

// ================= REGISTRATIONS / ATTENDEES =================

export const getEventAttendees = (eventId: string) =>
  api.get(`/api/tickets/event/${eventId}`);
