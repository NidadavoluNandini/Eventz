import api from "../utils/axios";

// PUBLIC
export const getAllEvents = () => api.get("/api/events");
export const getEventById = (id: string) =>
  api.get(`/api/events/${id}`);

// ORGANIZER
export const createEvent = (data: any) =>
  api.post("/api/events", data);

export const getOrganizerEvents = () =>
  api.get("/api/events/organizer/me");

export const publishEvent = (id: string) =>
  api.patch(`/api/events/${id}/publish`);

export const unpublishEvent = (id: string) =>
  api.patch(`/api/events/${id}/unpublish`);

export const completeEvent = (id: string) =>
  api.patch(`/api/events/${id}/complete`);

export const deleteEvent = (id: string) =>
  api.delete(`/api/events/${id}`);
