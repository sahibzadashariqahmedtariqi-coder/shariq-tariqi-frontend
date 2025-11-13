export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  image: string;
  duration: string;
  enrolledStudents: number;
  curriculum: CourseModule[];
  instructor: string;
  featured: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnail: string;
  category: string;
  uploadDate: string;
  views: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  category: string;
  image: string;
  tags: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  features: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  enrolledCourses: string[];
  appointments: Appointment[];
  role: 'user' | 'admin';
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  text: string;
  rating: number;
  date: string;
}

export interface FeaturedPost {
  id: string;
  title: string;
  image: string;
  link: string;
  description?: string;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
}
