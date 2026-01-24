import apiClient from './api';
import type { Course, Video, Article, Service, PrayerTimes, User, Appointment } from '@/types';

// Courses
export const coursesApi = {
  getAll: (params?: { category?: string; level?: string; search?: string }) =>
    apiClient.get<Course[]>('/courses', { params }),
  getById: (id: string) => apiClient.get<Course>(`/courses/${id}`),
  enroll: (courseId: string) => apiClient.post(`/courses/${courseId}/enroll`),
  update: (id: string, data: Partial<Course>) => apiClient.put(`/courses/${id}`, data),
  create: (data: Omit<Course, 'id' | '_id'>) => apiClient.post('/courses', data),
  delete: (id: string) => apiClient.delete(`/courses/${id}`),
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
    
    console.log('YouTube Videos API Config:', { 
      hasApiKey: !!apiKey, 
      hasChannelId: !!channelId,
      channelId: channelId 
    });
    
    if (!apiKey || !channelId) {
      console.warn('YouTube API key or Channel ID not configured');
      return { items: [] };
    }

    try {
      // Convert channel ID to uploads playlist ID (UC -> UU)
      const uploadsPlaylistId = channelId.replace('UC', 'UU');
      
      // Use playlistItems API instead of search API (more reliable)
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=12`;
      console.log('Fetching YouTube videos from uploads playlist...');
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('YouTube Videos API Response:', data);
      
      if (data.error) {
        console.error('YouTube Videos API Error:', data.error.message);
        return { items: [] };
      }
      
      // Transform playlistItems response to match search API format
      if (data.items) {
        data.items = data.items.map((item: any) => ({
          id: { videoId: item.snippet.resourceId.videoId },
          snippet: item.snippet
        }));
      }
      
      return data;
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

// Upload (Admin only)
export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(`/upload/image?folder=${folder || 'general'}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadPdf: (file: File, folder?: string, onProgress?: (progress: { loaded: number; total: number; percent: number }) => void) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return apiClient.post(`/upload/pdf?folder=${folder || 'pdfs'}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 900000, // 15 minutes timeout for large PDFs
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percent
          });
        }
      }
    });
  },
  deleteImage: (publicId: string) =>
    apiClient.delete('/upload/image', { data: { publicId } }),
};
