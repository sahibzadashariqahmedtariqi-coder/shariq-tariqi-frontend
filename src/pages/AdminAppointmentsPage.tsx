import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle, XCircle, Clock, ArrowLeft, CreditCard, Tag, Eye, CalendarDays, Users, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import ConfirmModal from '@/components/ui/ConfirmModal'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface BookingAppointment {
  _id: string
  name: string
  email: string
  phone: string
  country?: string
  date: string
  time: string
  type: string
  message?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  source: 'booking'
}

interface OrderAppointment {
  _id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  appointmentDate?: string
  appointmentTime?: string
  itemTitle: string
  amount: number
  originalAmount?: number
  couponCode?: string
  couponDiscount?: number
  paymentStatus: 'pending' | 'verified' | 'rejected'
  paymentProof?: string
  customerMessage?: string
  createdAt: string
  source: 'order'
}

type CombinedAppointment = BookingAppointment | OrderAppointment

export default function AdminAppointmentsPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const [bookingAppointments, setBookingAppointments] = useState<BookingAppointment[]>([])
  const [orderAppointments, setOrderAppointments] = useState<OrderAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'bookings' | 'orders'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string; type: 'booking' | 'order' }>({ isOpen: false, id: '', name: '', type: 'booking' })
  const [selectedOrder, setSelectedOrder] = useState<OrderAppointment | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    fetchAllAppointments()
  }, [])

  const fetchAllAppointments = async () => {
    try {
      setLoading(true)
      const [bookingsRes, ordersRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/orders?type=appointment').catch(() => ({ data: { success: false, data: [] } })),
      ])

      if (bookingsRes.data.success) {
        setBookingAppointments(
          bookingsRes.data.data.map((a: any) => ({ ...a, source: 'booking' }))
        )
      }

      if (ordersRes.data.success) {
        setOrderAppointments(
          ordersRes.data.data.map((o: any) => ({ ...o, source: 'order' }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingStatusChange = async (id: string, status: string) => {
    try {
      const res = await api.put(`/appointments/${id}`, { status })
      if (res.data.success) {
        setBookingAppointments((prev) =>
          prev.map((apt) => (apt._id === id ? { ...apt, status: status as any } : apt))
        )
        toast.success(`Appointment ${status}`)
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteClick = (id: string, name: string, type: 'booking' | 'order') => {
    setDeleteConfirm({ isOpen: true, id, name, type })
  }

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.type === 'booking') {
        await api.delete(`/appointments/${deleteConfirm.id}`)
        setBookingAppointments((prev) => prev.filter((apt) => apt._id !== deleteConfirm.id))
      } else {
        await api.delete(`/orders/${deleteConfirm.id}`)
        setOrderAppointments((prev) => prev.filter((apt) => apt._id !== deleteConfirm.id))
      }
      toast.success('Appointment deleted successfully')
    } catch (error) {
      toast.error('Failed to delete appointment')
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '', type: 'booking' })
    }
  }

  // Type label helper
  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'spiritual-healing': 'Spiritual Healing',
      consultation: 'Consultation',
      ruqyah: 'Ruqyah',
      hijama: 'Hijama',
      other: 'Other',
    }
    return map[type] || type
  }

  // Combined data
  const allItems: CombinedAppointment[] = [
    ...(activeTab === 'orders' ? [] : bookingAppointments),
    ...(activeTab === 'bookings' ? [] : orderAppointments),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Filter logic
  const filteredItems = allItems.filter((item) => {
    if (filterStatus === 'all') return true
    if (item.source === 'booking') {
      return (item as BookingAppointment).status === filterStatus
    } else {
      const o = item as OrderAppointment
      if (filterStatus === 'pending') return o.paymentStatus === 'pending'
      if (filterStatus === 'confirmed' || filterStatus === 'verified') return o.paymentStatus === 'verified'
      if (filterStatus === 'rejected') return o.paymentStatus === 'rejected'
      if (filterStatus === 'cancelled') return false // orders don't have cancelled status
      return false
    }
  })

  // Stats
  const totalBookings = bookingAppointments.length
  const totalOrders = orderAppointments.length
  const paidOrders = orderAppointments.filter((o) => o.amount > 0).length
  const pendingBookings = bookingAppointments.filter((a) => a.status === 'pending').length
  const pendingOrders = orderAppointments.filter((o) => o.paymentStatus === 'pending').length
  const freeOrders = orderAppointments.filter((o) => o.amount === 0).length

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </span>
        )
      case 'confirmed':
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Confirmed
          </span>
        )
      case 'completed':
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        )
      default:
        return null
    }
  }

  const getPaymentStatusBadge = (status: string, amount: number) => {
    if (amount === 0) {
      return (
        <span className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Tag className="h-3 w-3" /> Free (Coupon)
        </span>
      )
    }
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> Payment Pending
          </span>
        )
      case 'verified':
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Payment Verified
          </span>
        )
      case 'rejected':
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Payment Rejected
          </span>
        )
      default:
        return null
    }
  }

  // Render Booking Appointment Card
  const renderBookingCard = (apt: BookingAppointment) => (
    <div key={`booking-${apt._id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{apt.name}</h3>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  📋 Booking Request
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {format(new Date(apt.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            {getBookingStatusBadge(apt.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{apt.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="font-medium">{apt.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium">{format(new Date(apt.date), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
              <p className="font-medium">{apt.time}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Service Type</p>
              <p className="font-medium text-primary-600 dark:text-primary-400">{getTypeLabel(apt.type)}</p>
            </div>
          </div>

          {apt.message && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Message</p>
              <p className="text-sm">{apt.message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex lg:flex-col gap-2">
          <Button
            onClick={() => handleBookingStatusChange(apt._id, 'pending')}
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none"
            disabled={apt.status === 'pending'}
          >
            <Clock className="h-4 w-4 mr-1" /> Pending
          </Button>
          <Button
            onClick={() => handleBookingStatusChange(apt._id, 'confirmed')}
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none bg-green-50 hover:bg-green-100 text-green-700"
            disabled={apt.status === 'confirmed'}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Confirm
          </Button>
          <Button
            onClick={() => handleBookingStatusChange(apt._id, 'cancelled')}
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-700"
            disabled={apt.status === 'cancelled'}
          >
            <XCircle className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button
            onClick={() => handleDeleteClick(apt._id, apt.name, 'booking')}
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>
    </div>
  )

  // Render Order Appointment Card
  const renderOrderCard = (order: OrderAppointment) => (
    <div key={`order-${order._id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-emerald-500">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{order.customerName}</h3>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  💳 Paid Appointment
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{order.orderNumber} • {format(new Date(order.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            {getPaymentStatusBadge(order.paymentStatus, order.amount)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
            {order.appointmentDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Appointment Date</p>
                <p className="font-medium">{format(new Date(order.appointmentDate), 'dd/MM/yyyy')}</p>
              </div>
            )}
            {order.appointmentTime && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Appointment Time</p>
                <p className="font-medium">{order.appointmentTime}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
              <p className="font-medium text-primary-600 dark:text-primary-400">{order.itemTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              {order.couponCode ? (
                <div>
                  <span className="line-through text-gray-400 text-sm mr-2">Rs. {(order.originalAmount || order.amount + (order.couponDiscount || 0)).toLocaleString()}</span>
                  <span className="font-bold text-lg text-emerald-600">
                    {order.amount === 0 ? 'FREE 🎉' : `Rs. ${order.amount.toLocaleString()}`}
                  </span>
                </div>
              ) : (
                <p className="font-bold text-lg">Rs. {order.amount.toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Coupon Info */}
          {order.couponCode && (
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                  Coupon Applied: <span className="font-mono bg-violet-100 dark:bg-violet-800 px-2 py-0.5 rounded">{order.couponCode}</span>
                </span>
                <span className="text-sm text-violet-600 dark:text-violet-400">
                  — Discount: Rs. {(order.couponDiscount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {order.customerMessage && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer Message</p>
              <p className="text-sm">{order.customerMessage}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex lg:flex-col gap-2">
          <Button
            onClick={() => {
              setSelectedOrder(order)
              setShowOrderModal(true)
            }}
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none text-emerald-600 hover:text-emerald-700"
          >
            <Eye className="h-4 w-4 mr-1" /> View Order
          </Button>
          <Button
            onClick={() => handleDeleteClick(order._id, order.customerName, 'order')}
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>Admin - Manage Appointments | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-4">
            Manage Appointments
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-600 font-medium">Total</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{totalBookings + totalOrders}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-600 font-medium">Booking Requests</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{totalBookings}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                <p className="text-sm text-emerald-600 font-medium">Paid Orders</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{paidOrders}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{pendingBookings + pendingOrders}</p>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-violet-600" />
                <p className="text-sm text-violet-600 font-medium">Free (Coupon)</p>
              </div>
              <p className="text-2xl font-bold text-violet-900">{freeOrders}</p>
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex gap-2 flex-wrap mb-4">
            <Button
              onClick={() => setActiveTab('all')}
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All ({totalBookings + totalOrders})
            </Button>
            <Button
              onClick={() => setActiveTab('bookings')}
              variant={activeTab === 'bookings' ? 'default' : 'outline'}
              size="sm"
              className={activeTab === 'bookings' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              📋 Booking Requests ({totalBookings})
            </Button>
            <Button
              onClick={() => setActiveTab('orders')}
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              size="sm"
              className={activeTab === 'orders' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              💳 Paid Appointments ({totalOrders})
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'verified', 'cancelled', 'rejected'].map((status) => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                className={
                  filterStatus === status
                    ? status === 'pending'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : status === 'confirmed' || status === 'verified'
                        ? 'bg-green-500 hover:bg-green-600'
                        : status === 'cancelled' || status === 'rejected'
                          ? 'bg-red-500 hover:bg-red-600'
                          : ''
                    : ''
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading appointments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
              </div>
            ) : (
              filteredItems.map((item) =>
                item.source === 'booking'
                  ? renderBookingCard(item as BookingAppointment)
                  : renderOrderCard(item as OrderAppointment)
              )
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Appointment Order Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium font-mono">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  {getPaymentStatusBadge(selectedOrder.paymentStatus, selectedOrder.amount)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{selectedOrder.itemTitle}</p>
                </div>
                {selectedOrder.appointmentDate && (
                  <div>
                    <p className="text-sm text-gray-500">Appointment Date</p>
                    <p className="font-medium">{format(new Date(selectedOrder.appointmentDate), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                {selectedOrder.appointmentTime && (
                  <div>
                    <p className="text-sm text-gray-500">Appointment Time</p>
                    <p className="font-medium">{selectedOrder.appointmentTime}</p>
                  </div>
                )}
              </div>

              {/* Amount & Coupon */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Amount</span>
                  {selectedOrder.couponCode ? (
                    <div className="text-right">
                      <span className="line-through text-gray-400 text-sm mr-2">
                        Rs. {(selectedOrder.originalAmount || selectedOrder.amount + (selectedOrder.couponDiscount || 0)).toLocaleString()}
                      </span>
                      <span className="font-bold text-lg text-emerald-600">
                        {selectedOrder.amount === 0 ? 'FREE 🎉' : `Rs. ${selectedOrder.amount.toLocaleString()}`}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg">Rs. {selectedOrder.amount.toLocaleString()}</span>
                  )}
                </div>
                {selectedOrder.couponCode && (
                  <div className="mt-2 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-violet-600" />
                    <span className="text-sm text-violet-700 dark:text-violet-300">
                      Coupon: <span className="font-mono font-bold">{selectedOrder.couponCode}</span>
                      {' '}— Discount: Rs. {(selectedOrder.couponDiscount || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {selectedOrder.customerMessage && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Customer Message</p>
                  <p className="text-blue-800 dark:text-blue-200">{selectedOrder.customerMessage}</p>
                </div>
              )}

              {selectedOrder.paymentProof && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Payment Proof</p>
                  <img
                    src={selectedOrder.paymentProof}
                    alt="Payment Proof"
                    className="max-w-full h-auto border rounded-lg cursor-pointer"
                    onClick={() => window.open(selectedOrder.paymentProof, '_blank')}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Link
                to="/admin/orders"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
              >
                <CreditCard className="w-4 h-4 inline mr-1" />
                Manage in Orders Page
              </Link>
              <button
                onClick={() => {
                  setShowOrderModal(false)
                  setSelectedOrder(null)
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '', type: 'booking' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment?"
        message="Are you sure you want to delete this appointment?"
        itemName={deleteConfirm.name}
        type="danger"
        confirmText="Delete"
      />
    </>
  )
}
