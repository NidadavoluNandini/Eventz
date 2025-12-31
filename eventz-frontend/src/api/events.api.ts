import api from "../utils/axios";

// PUBLIC
export const getAllEvents = () => api.get("/events");

export const getEventById = (id: string) =>
  api.get(`/events/${id}`);

// ORGANIZER
export const createEvent = (data: any) =>
  api.post("/events", data);



export const publishEvent = (id: string) =>
  api.patch(`/events/${id}/publish`);

export const unpublishEvent = (id: string) =>
  api.patch(`/events/${id}/unpublish`);

export const completeEvent = (id: string) =>
  api.patch(`/events/${id}/complete`);

export const deleteEvent = (id: string) =>
  api.delete(`/events/${id}`);
export const getOrganizerEvents = () =>
  api.get("/events/organizer/me");