import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { BookOpen, Calendar, ShoppingBag, Video, FileText, Users, Settings } from 'lucide-react'

export default function AdminDashboardPage() {
  const adminSections = [
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
      title: 'Manage Products',
      description: 'Add, edit, or remove products',
      icon: ShoppingBag,
      path: '/admin/products',
      color: 'bg-purple-500',
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
      title: 'Appointment Settings',
      description: 'Configure charges, timings & availability',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-teal-500',
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
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className={`${section.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {section.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">25+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total Courses</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-300">150+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Appointments</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">45+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Products</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-300">4K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Students</div>
          </div>
        </div>
      </div>
    </>
  )
}
