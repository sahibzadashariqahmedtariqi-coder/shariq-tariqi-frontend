import apiClient from './api';
import type { Course, Video, Article, Service, PrayerTimes, User, Appointment } from '@/types';

// Courses
export const coursesApi = {
  getAll: (params?: { category?: string; level?: string; search?: string }) =>
    apiClient.get<Course[]>('/courses', { params }),
  getById: (id: string) => apiClient.get<Course>(`/courses/${id}`),
  enroll: (courseId: string) => apiClient.post(`/courses/${courseId}/enroll`),
};

// Videos
export const videosApi = {
  getAll: (params?: { category?: string; search?: string }) =>
    apiClient.get<Video[]>('/videos', { params }),
  getById: (id: string) => apiClient.get<Video>(`/videos/${id}`),
  incrementView: (id: string) => apiClient.post(`/videos/${id}/view`),
  getLatestFromYouTube: async () => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
    
    if (!apiKey) {
      console.warn('YouTube API key not configured');
      return { items: [] };
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`
      );
      return await response.json();
    } catch (error) {
      console.error('YouTube API error:', error);
      return { items: [] };
    }
  },
};

// Articles
export const articlesApi = {
  getAll: (params?: { category?: string; search?: string }) =>
    apiClient.get<Article[]>('/articles', { params }),
  getById: (id: string) => apiClient.get<Article>(`/articles/${id}`),
};

// Services
export const servicesApi = {
  getAll: () => apiClient.get<Service[]>('/services'),
  getById: (id: string) => apiClient.get<Service>(`/services/${id}`),
};

// Prayer Times
export const prayerTimesApi = {
  getCurrent: (lat?: number, lng?: number) =>
    apiClient.get<PrayerTimes>('/prayer-times', {
      params: { lat, lng },
    }),
};

// Appointments
export const appointmentsApi = {
  create: (data: Partial<Appointment>) => apiClient.post('/appointments', data),
  getByUserId: (userId: string) => apiClient.get<Appointment[]>(`/users/${userId}/appointments`),
  cancel: (id: string) => apiClient.patch(`/appointments/${id}/cancel`),
};

// Authentication
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiClient.post<{ token: string; user: User }>('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get<User>('/auth/me'),
};

// Newsletter
export const newsletterApi = {
  subscribe: (email: string) => apiClient.post('/newsletter/subscribe', { email }),
};

// Contact
export const contactApi = {
  sendMessage: (data: { name: string; email: string; message: string; phone?: string }) =>
    apiClient.post('/contact', data),
};
