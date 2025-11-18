import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  message: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

export default function AdminAppointmentsPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '+92 300 1234567',
      date: '2025-11-15',
      time: '10:00 AM',
      service: 'Spiritual Consultation',
      message: 'Need guidance for spiritual growth',
      status: 'pending',
      createdAt: '2025-11-10',
    },
    {
      id: '2',
      name: 'Fatima Khan',
      email: 'fatima@example.com',
      phone: '+92 301 9876543',
      date: '2025-11-16',
      time: '2:00 PM',
      service: 'Traditional Healing',
      message: 'Looking for traditional healing treatment',
      status: 'confirmed',
      createdAt: '2025-11-09',
    },
    {
      id: '3',
      name: 'Usman Tariq',
      email: 'usman@example.com',
      phone: '+92 345 5555555',
      date: '2025-11-14',
      time: '3:00 PM',
      service: 'Hikmat Consultation',
      message: 'Need advice on hikmat practices',
      status: 'cancelled',
      createdAt: '2025-11-08',
    },
  ])

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')

  const handleStatusChange = (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    setAppointments(appointments.map((apt) => (apt.id === id ? { ...apt, status } : apt)))
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(appointments.filter((apt) => apt.id !== id))
    }
  }

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter((apt) => apt.status === filterStatus)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </span>
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Confirmed
        </span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Cancelled
        </span>
      default:
        return null
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin - Manage Appointments | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-4">
            Manage Appointments
          </h1>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilterStatus('all')}
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All ({appointments.length})
            </Button>
            <Button
              onClick={() => setFilterStatus('pending')}
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Pending ({appointments.filter((a) => a.status === 'pending').length})
            </Button>
            <Button
              onClick={() => setFilterStatus('confirmed')}
              variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
              size="sm"
              className="bg-green-500 hover:bg-green-600"
            >
              Confirmed ({appointments.filter((a) => a.status === 'confirmed').length})
            </Button>
            <Button
              onClick={() => setFilterStatus('cancelled')}
              variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              className="bg-red-500 hover:bg-red-600"
            >
              Cancelled ({appointments.filter((a) => a.status === 'cancelled').length})
            </Button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Section - Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {appointment.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(appointment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium">{appointment.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium">{appointment.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium">{new Date(appointment.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                        <p className="font-medium">{appointment.time}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                        <p className="font-medium text-primary-600 dark:text-primary-400">
                          {appointment.service}
                        </p>
                      </div>
                    </div>
                    
                    {appointment.message && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Message</p>
                        <p className="text-sm">{appointment.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      onClick={() => handleStatusChange(appointment.id, 'pending')}
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none"
                      disabled={appointment.status === 'pending'}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Pending
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none bg-green-50 hover:bg-green-100 text-green-700"
                      disabled={appointment.status === 'confirmed'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-700"
                      disabled={appointment.status === 'cancelled'}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleDelete(appointment.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Use status filters to view appointments by status</li>
            <li>Confirm appointments to notify clients</li>
            <li>Cancel appointments that cannot be fulfilled</li>
            <li>Delete old or spam appointments</li>
            <li>For production: Connect to backend API and email notifications</li>
          </ul>
        </div>
      </div>
    </>
  )
}
