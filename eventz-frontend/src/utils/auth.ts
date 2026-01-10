import api from '../utils/axios';

// PUBLIC
export const getAllEvents = () => api.get('/events');

export const getEventById = (id: string) =>
  api.get(`/events/${id}`);

// ORGANIZER
export const createEvent = (data: any) =>
  api.post('/events', data);

export const getOrganizerEvents = () =>
  api.get('/events/organizer/me');

export const publishEvent = (id: string) =>
  api.patch(`/events/${id}/publish`);

export const unpublishEvent = (id: string) =>
  api.patch(`/events/${id}/unpublish`);

export const completeEvent = (id: string) =>
  api.patch(`/events/${id}/complete`);

export const deleteEvent = (id: string) =>
  api.delete(`/events/${id}`);
// src/utils/auth.ts

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('organizerToken');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

