import { Helmet } from 'react-helmet-async'
import { Link, Navigate } from 'react-router-dom'
import { BookOpen, Calendar, ShoppingBag, Video, FileText, Users, Settings, Bell, Image, Info, TrendingUp, Mail, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore'

export default function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuthStore()

  // Redirect to login if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  const adminSections = [
    {
      title: 'Hero Slides',
      description: 'Manage home page carousel images',
      icon: Image,
      path: '/admin/hero-slides',
      color: 'bg-pink-500',
    },
    {
      title: 'About Page',
      description: 'Manage profile image and content',
      icon: Info,
      path: '/admin/about',
      color: 'bg-cyan-500',
    },
    {
      title: 'Manage Courses',
      description: 'Add, edit, or remove courses',
      icon: BookOpen,
      path: '/admin/courses',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Appointments',
      description: 'View and manage appointment requests',
      icon: Calendar,
      path: '/admin/appointments',
      color: 'bg-green-500',
    },
    {
      title: 'Appointment Settings',
      description: 'Configure charges, timings & availability',
      icon: Settings,
      path: '/admin/appointment-settings',
      color: 'bg-teal-500',
    },
    {
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
      icon: ShoppingBag,
      path: '/admin/products',
      color: 'bg-purple-500',
    },
    {
      title: 'Payment Orders',
      description: 'Manage & verify payment orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      color: 'bg-pink-500',
    },
    {
      title: 'Trash',
      description: 'Restore or delete orders permanently',
      icon: Trash2,
      path: '/admin/trash',
      color: 'bg-gray-500',
    },
    {
      title: 'Manage Updates',
      description: 'Add, edit, or remove latest updates',
      icon: Bell,
      path: '/admin/updates',
      color: 'bg-amber-500',
    },
    {
      title: 'Website Statistics',
      description: 'Update homepage achievement stats',
      icon: TrendingUp,
      path: '/admin/stats',
      color: 'bg-indigo-500',
    },
    {
      title: 'Manage Videos',
      description: 'Add or remove YouTube videos',
      icon: Video,
      path: '/admin/videos',
      color: 'bg-red-500',
    },
    {
      title: 'Manage Services',
      description: 'Add, edit, or remove services',
      icon: FileText,
      path: '/admin/services',
      color: 'bg-orange-500',
    },
    {
      title: 'Account Settings',
      description: 'Update profile and change password',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-gray-500',
    },
    {
      title: 'Contact & Social Media',
      description: 'Manage contact info, social links & footer',
      icon: Mail,
      path: '/admin/contact-settings',
      color: 'bg-emerald-500',
    },
    {
      title: 'Manage Users',
      description: 'View and manage registered users',
      icon: Users,
      path: '/admin/users',
      color: 'bg-indigo-500',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage all aspects of your website from here
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className="group bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:from-primary-100 hover:to-emerald-100 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-gold-500 active:bg-gradient-to-br active:from-primary-700 active:to-primary-900 active:scale-95"
            >
              <div className={`${section.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md group-active:scale-125`}>
                <section.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-gold-400 transition-colors group-active:text-white">
                {section.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm group-active:text-gray-200">
                {section.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6 shadow-lg border-2 border-blue-300 dark:border-blue-700">
            <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">25+</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Total Courses</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl p-6 shadow-lg border-2 border-green-300 dark:border-green-700">
            <div className="text-4xl font-bold text-green-700 dark:text-green-300">150+</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Appointments</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6 shadow-lg border-2 border-purple-300 dark:border-purple-700">
            <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">45+</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Products</div>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-xl p-6 shadow-lg border-2 border-orange-300 dark:border-orange-700">
            <div className="text-4xl font-bold text-orange-700 dark:text-orange-300">4K+</div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Students</div>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
