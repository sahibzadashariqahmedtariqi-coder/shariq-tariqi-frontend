import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart, Search, Eye, CheckCircle, XCircle, Clock,
  ArrowLeft, DollarSign, TrendingUp, RefreshCw, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'

interface Donation {
  _id: string
  donationNumber: string
  donorName: string
  donorEmail: string
  donorPhone: string
  donorCountry: string
  amount: number
  currency: string
  purpose: string
  donorMessage: string
  paymentStatus: 'pending' | 'verified' | 'rejected'
  paymentProof: string
  transactionId: string
  isAnonymous: boolean
  createdAt: string
  verifiedAt: string
}

interface Stats {
  total: number
  verified: number
  pending: number
  totalAmountPKR: number
  totalAmountINR: number
  byPurpose: { _id: string; count: number; total: number }[]
  recentCount: number
}

const purposeLabels: { [key: string]: string } = {
  general: 'General Donation',
  madrasa: 'Madrasa Support',
  orphans: 'Orphan Care',
  poor: 'Help the Poor',
  mosque: 'Mosque Development',
  education: 'Education Fund',
  other: 'Other',
}

export default function AdminDonationsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [purposeFilter, setPurposeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchDonations()
    fetchStats()
  }, [page, statusFilter, purposeFilter])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(purposeFilter !== 'all' && { purpose: purposeFilter }),
      })

      const response = await apiClient.get(`/donations?${params}`)
      if (response.data.success) {
        setDonations(response.data.data)
        setTotalPages(response.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
      toast.error('Failed to load donations')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/donations/admin/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleVerify = async (id: string) => {
    try {
      const response = await apiClient.put(`/donations/${id}/verify`, { adminNotes })
      if (response.data.success) {
        toast.success('Donation verified successfully')
        fetchDonations()
        fetchStats()
        setShowModal(false)
        setSelectedDonation(null)
        setAdminNotes('')
      }
    } catch (error) {
      toast.error('Failed to verify donation')
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      const response = await apiClient.put(`/donations/${id}/reject`, { rejectionReason, adminNotes })
      if (response.data.success) {
        toast.success('Donation rejected')
        fetchDonations()
        fetchStats()
        setShowModal(false)
        setSelectedDonation(null)
        setRejectionReason('')
        setAdminNotes('')
      }
    } catch (error) {
      toast.error('Failed to reject donation')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation record?')) return

    try {
      const response = await apiClient.delete(`/donations/${id}`)
      if (response.data.success) {
        toast.success('Donation deleted')
        fetchDonations()
        fetchStats()
      }
    } catch (error) {
      toast.error('Failed to delete donation')
    }
  }

  const filteredDonations = donations.filter(donation => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      donation.donationNumber.toLowerCase().includes(searchLower) ||
      donation.donorName.toLowerCase().includes(searchLower) ||
      donation.donorEmail.toLowerCase().includes(searchLower) ||
      donation.donorPhone.includes(search)
    )
  })

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Helmet>
        <title>Manage Donations | Admin Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link to="/admin" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Heart className="h-8 w-8 text-pink-600" />
                Donation Management
              </h1>
            </div>

            <Button
              onClick={() => { fetchDonations(); fetchStats(); }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                    <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total (PKR)</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      Rs. {stats.totalAmountPKR.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total (INR)</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹ {stats.totalAmountINR.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or donation number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700"
                >
                  <option value="all">All Purposes</option>
                  <option value="general">General</option>
                  <option value="madrasa">Madrasa</option>
                  <option value="orphans">Orphans</option>
                  <option value="poor">Poor</option>
                  <option value="mosque">Mosque</option>
                  <option value="education">Education</option>
                </select>
              </div>
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Donation #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Donor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Purpose</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-600" />
                      </td>
                    </tr>
                  ) : filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No donations found
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-pink-600">{donation.donationNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {donation.isAnonymous ? '🙈 Anonymous' : donation.donorName}
                            </p>
                            <p className="text-sm text-gray-500">{donation.donorEmail}</p>
                            <p className="text-xs text-gray-400">{donation.donorPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {donation.currency === 'PKR' ? 'Rs.' : '₹'} {donation.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{donation.currency}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {purposeLabels[donation.purpose] || donation.purpose}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            donation.paymentStatus === 'verified'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : donation.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {donation.paymentStatus === 'verified' && <CheckCircle className="w-3 h-3" />}
                            {donation.paymentStatus === 'pending' && <Clock className="w-3 h-3" />}
                            {donation.paymentStatus === 'rejected' && <XCircle className="w-3 h-3" />}
                            {donation.paymentStatus.charAt(0).toUpperCase() + donation.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(donation.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedDonation(donation)
                                setShowModal(true)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {donation.paymentStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerify(donation._id)}
                                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                  title="Verify"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDonation(donation)
                                    setShowModal(true)
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(donation._id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Donation Details
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedDonation(null)
                  setRejectionReason('')
                  setAdminNotes('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Donor Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Donor Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDonation.isAnonymous ? '🙈 Anonymous' : selectedDonation.donorName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donorEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donorPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Country</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donorCountry}</p>
                  </div>
                </div>
              </div>

              {/* Donation Details */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-3">Donation Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Donation Number</p>
                    <p className="font-mono font-bold text-pink-600">{selectedDonation.donationNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-bold text-2xl text-emerald-600">
                      {selectedDonation.currency === 'PKR' ? 'Rs.' : '₹'} {selectedDonation.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Purpose</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {purposeLabels[selectedDonation.purpose] || selectedDonation.purpose}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Transaction ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.transactionId || '-'}</p>
                  </div>
                </div>
                {selectedDonation.donorMessage && (
                  <div className="mt-4">
                    <p className="text-gray-500">Message</p>
                    <p className="font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded-lg mt-1">
                      {selectedDonation.donorMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              {selectedDonation.paymentProof && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Proof</h4>
                  <a href={selectedDonation.paymentProof} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedDonation.paymentProof}
                      alt="Payment Proof"
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </a>
                </div>
              )}

              {/* Admin Actions */}
              {selectedDonation.paymentStatus === 'pending' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Admin Actions</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      rows={2}
                      placeholder="Optional notes..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rejection Reason (required if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      rows={2}
                      placeholder="Reason for rejection..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleVerify(selectedDonation._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Verify Donation
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedDonation._id)}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
