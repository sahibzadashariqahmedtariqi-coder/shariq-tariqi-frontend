import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  level: string;
  image: string;
  duration?: string;
  students?: number;
  featured?: boolean;
}

interface CoursesState {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  getFeaturedCourses: () => Course[];
  getFilteredCourses: (category?: string, search?: string) => Course[];
}

// Initial courses data
const initialCourses: Course[] = [
  {
    id: '1',
    title: 'Tarbiyat ul Amileen',
    description: 'Learn the fundamentals of Spiritual Courses and spiritual energy work',
    category: 'spiritual-healing',
    price: 3000,
    level: 'Beginner to Advanced',
    image: '/images/tarbiyat-course.jpg',
    duration: '8 weeks',
    students: 234,
    featured: true,
  },
  {
    id: '2',
    title: 'Jabl E Amliyat Season 2 Surah e Muzzamil Special',
    description: 'Deep dive into spiritual sciences and mystical practices',
    category: 'spiritual-healing',
    price: 3000,
    level: 'Advanced',
    image: '/images/jabl-amliyat.jpg',
    duration: '12 weeks',
    students: 156,
    featured: true,
  },
  {
    id: '3',
    title: 'Traditional Hikmat & Healing',
    description: 'Learn traditional Islamic medicine and natural healing methods',
    category: 'medicine',
    price: 600,
    level: 'Intermediate',
    image: '/images/hikmat-tariqi.jpg',
    duration: '10 weeks',
    students: 189,
    featured: true,
  },
  {
    id: '4',
    title: 'Pakistan & Overseas Free Amliyat',
    description: 'Free spiritual practices and amliyat for Pakistan and overseas students',
    category: 'spiritual-healing',
    price: 0,
    level: 'All Levels',
    image: '/images/free-amliyat.jpg',
    duration: '6 weeks',
    students: 312,
    featured: false,
  },
  {
    id: '5',
    title: 'India Free Amliyat',
    description: 'Free spiritual practices and amliyat specifically for students in India',
    category: 'spiritual-healing',
    price: 0,
    level: 'All Levels',
    image: '/images/free-amliyat.jpg',
    duration: '6 weeks',
    students: 278,
    featured: false,
  },
  {
    id: '6',
    title: 'Jabl-E-Amliyat-Season-1',
    description: 'Special Course',
    category: 'spiritual-healing',
    price: 5000,
    level: 'All Levels',
    image: '/images/jabl-amliyat-1.jpg',
    duration: '8 weeks',
    students: 145,
    featured: true,
  },
];

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: initialCourses,

      addCourse: (course) =>
        set((state) => ({
          courses: [
            ...state.courses,
            {
              ...course,
              id: Date.now().toString(),
              students: course.students || 0,
              featured: course.featured || false,
            },
          ],
        })),

      updateCourse: (id, updatedCourse) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === id ? { ...course, ...updatedCourse } : course
          ),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== id),
        })),

      getCourseById: (id) => {
        return get().courses.find((course) => course.id === id);
      },

      getFeaturedCourses: () => {
        return get().courses.filter((course) => course.featured);
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
    }
  )
);
