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
const AdminContactSettingsPage = lazy(() => import('./pages/AdminContactSettingsPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminAppointmentSettingsPage = lazy(() => import('./pages/AdminAppointmentSettingsPage'))
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'))
const AdminTrashPage = lazy(() => import('./pages/AdminTrashPage'))
const AdminFeeManagementPage = lazy(() => import('./pages/AdminFeeManagementPage'))
const AdminServicesPage = lazy(() => import('./pages/AdminServicesPage'))
const AdminLMSPage = lazy(() => import('./pages/admin/AdminLMSPage'))
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'))
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'))
const StudentLMSPage = lazy(() => import('./pages/StudentLMSPage'))
const LMSCoursePage = lazy(() => import('./pages/LMSCoursePage'))
const LMSClassPage = lazy(() => import('./pages/LMSClassPage'))
const LMSCertificatePage = lazy(() => import('./pages/LMSCertificatePage'))
const MureedRegistrationPage = lazy(() => import('./pages/MureedRegistrationPage'))
const MureedCardPage = lazy(() => import('./pages/MureedCardPage'))
const AdminMureedsPage = lazy(() => import('./pages/AdminMureedsPage'))
const DonatePage = lazy(() => import('./pages/DonatePage'))
const AdminDonationsPage = lazy(() => import('./pages/AdminDonationsPage'))
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
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="my-orders" element={<MyOrdersPage />} />
          <Route path="track-order" element={<TrackOrderPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/hero-slides" element={<AdminHeroSlidesPage />} />
          <Route path="admin/about" element={<AdminAboutPage />} />
          <Route path="admin/courses" element={<AdminCoursesPage />} />
          <Route path="admin/appointments" element={<AdminAppointmentsPage />} />
          <Route path="admin/products" element={<AdminProductsPage />} />
          <Route path="admin/updates" element={<AdminUpdatesPage />} />
          <Route path="admin/stats" element={<AdminStatsPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
          <Route path="admin/contact-settings" element={<AdminContactSettingsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/appointment-settings" element={<AdminAppointmentSettingsPage />} />
          <Route path="admin/orders" element={<AdminOrdersPage />} />
          <Route path="admin/trash" element={<AdminTrashPage />} />
          <Route path="admin/fee-management" element={<AdminFeeManagementPage />} />
          <Route path="admin/services" element={<AdminServicesPage />} />
          <Route path="admin/lms" element={<AdminLMSPage />} />
          <Route path="admin/mureeds" element={<AdminMureedsPage />} />
          <Route path="admin/donations" element={<AdminDonationsPage />} />
          <Route path="donate" element={<DonatePage />} />
          <Route path="mureed" element={<MureedRegistrationPage />} />
          <Route path="mureed/card/:id" element={<MureedCardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        {/* LMS Routes outside Layout for different design */}
        <Route path="lms" element={<StudentLMSPage />} />
        <Route path="lms/course/:courseId" element={<LMSCoursePage />} />
        <Route path="lms/watch/:classId" element={<LMSClassPage />} />
        <Route path="lms/certificate/:certificateId" element={<LMSCertificatePage />} />
      </Routes>
    </Suspense>
  )
}

export default App
