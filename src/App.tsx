import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const MediaPage = lazy(() => import('./pages/MediaPage'))
const PrayerTimesPage = lazy(() => import('./pages/PrayerTimesPage'))
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AdminCoursesPage = lazy(() => import('./pages/AdminCoursesPage'))
const AdminHeroSlidesPage = lazy(() => import('./pages/AdminHeroSlidesPage'))
const AdminAboutPage = lazy(() => import('./pages/AdminAboutPage'))
const AdminAppointmentsPage = lazy(() => import('./pages/AdminAppointmentsPage'))
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'))
const AdminUpdatesPage = lazy(() => import('./pages/AdminUpdatesPage'))
const AdminStatsPage = lazy(() => import('./pages/AdminStatsPage'))
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminAppointmentSettingsPage = lazy(() => import('./pages/AdminAppointmentSettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="prayer-times" element={<PrayerTimesPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:id" element={<BlogDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/hero-slides" element={<AdminHeroSlidesPage />} />
          <Route path="admin/about" element={<AdminAboutPage />} />
          <Route path="admin/courses" element={<AdminCoursesPage />} />
          <Route path="admin/appointments" element={<AdminAppointmentsPage />} />
          <Route path="admin/products" element={<AdminProductsPage />} />
          <Route path="admin/updates" element={<AdminUpdatesPage />} />
          <Route path="admin/stats" element={<AdminStatsPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/appointment-settings" element={<AdminAppointmentSettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
