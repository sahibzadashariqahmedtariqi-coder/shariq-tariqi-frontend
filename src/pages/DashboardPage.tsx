import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '@/stores/authStore'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <>
      <Helmet>
        <title>Dashboard | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Welcome, {user?.name}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">Enrolled Courses</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">Appointments</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">Bookmarks</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
        </div>
      </div>
    </>
  )
}
