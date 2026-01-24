import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/services/api';

export interface Course {
  id: string;
  _id?: string; // MongoDB ID support
  title: string;
  description: string;
  category: string;
  price: number;
  priceINR?: number | null; // Indian price in INR
  level: string;
  image: string;
  duration?: string;
  students?: number;
  enrolledStudents?: number;
  featured?: boolean;
  isFeatured?: boolean;
  isPaid?: boolean;
  isActive?: boolean;
}

interface CoursesState {
  courses: Course[];
  loading: boolean;
  lastFetch: number | null;
  fetchCourses: () => Promise<void>;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourseById: (id: string) => Course | undefined;
  getFeaturedCourses: () => Course[];
  getFilteredCourses: (category?: string, search?: string) => Course[];
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: [],
      loading: false,
      lastFetch: null,

      // Fetch courses from API and sync with store
      fetchCourses: async () => {
        try {
          set({ loading: true });
          const response = await apiClient.get('/courses?limit=100');
          const coursesData = response.data.data || response.data || [];
          
          // Map MongoDB courses to store format
          const mappedCourses = coursesData
            .filter((course: any) => course.isActive !== false) // Only active courses
            .map((course: any) => ({
              id: course._id || course.id,
              _id: course._id,
              title: course.title,
              description: course.description,
              category: course.category,
              price: course.price || 0,
              priceINR: course.priceINR || null,
              level: course.level,
              image: course.image,
              duration: course.duration,
              students: course.enrolledStudents || course.students || 0,
              enrolledStudents: course.enrolledStudents,
              featured: course.isFeatured || course.featured || false,
              isFeatured: course.isFeatured,
              isPaid: course.isPaid,
              isActive: course.isActive,
            }));

          set({ 
            courses: mappedCourses, 
            loading: false,
            lastFetch: Date.now()
          });
        } catch (error) {
          console.error('Error fetching courses:', error);
          set({ loading: false });
          // Keep existing courses on error
        }
      },

      addCourse: async (course) => {
        try {
          // Convert students to enrolledStudents for backend
          const dataToSend = { ...course };
          if ((dataToSend as any).students !== undefined) {
            (dataToSend as any).enrolledStudents = (dataToSend as any).students;
          }
          
          const response = await apiClient.post('/courses', dataToSend);
          const newCourse = response.data.data || response.data;
          
          set((state) => ({
            courses: [...state.courses, {
              id: newCourse._id || newCourse.id,
              _id: newCourse._id,
              ...course,
              ...newCourse,
            }],
          }));
          
          // Refresh from API to ensure sync
          await get().fetchCourses();
        } catch (error) {
          console.error('Error adding course:', error);
          throw error;
        }
      },

      updateCourse: async (id, updatedCourse) => {
        try {
          // Convert students to enrolledStudents for backend
          const dataToSend = { ...updatedCourse };
          if (dataToSend.students !== undefined) {
            dataToSend.enrolledStudents = dataToSend.students;
          }
          
          // Update in API first
          await apiClient.put(`/courses/${id}`, dataToSend);
          
          // Then update local store
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === id || course._id === id 
                ? { ...course, ...updatedCourse } 
                : course
            ),
          }));
          
          // Refresh from API to ensure sync
          await get().fetchCourses();
        } catch (error) {
          console.error('Error updating course:', error);
          throw error;
        }
      },

      deleteCourse: async (id) => {
        try {
          // Delete from API first
          await apiClient.delete(`/courses/${id}`);
          
          // Then update local store
          set((state) => ({
            courses: state.courses.filter((course) => 
              course.id !== id && course._id !== id
            ),
          }));
          
          // Refresh from API to ensure sync
          await get().fetchCourses();
        } catch (error) {
          console.error('Error deleting course:', error);
          throw error;
        }
      },

      getCourseById: (id) => {
        return get().courses.find((course) => course.id === id || course._id === id);
      },

      getFeaturedCourses: () => {
        return get().courses.filter((course) => course.featured || course.isFeatured);
      },

      getFilteredCourses: (category, search) => {
        let filtered = get().courses;

        if (category && category !== 'all') {
          filtered = filtered.filter((course) => course.category === category);
        }

        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(
            (course) =>
              course.title.toLowerCase().includes(searchLower) ||
              course.description.toLowerCase().includes(searchLower)
          );
        }

        return filtered;
      },
    }),
    {
      name: 'courses-storage',
      // Only persist courses and lastFetch, not loading state
      partialize: (state) => ({ 
        courses: state.courses,
        lastFetch: state.lastFetch 
      }),
    }
  )
);
