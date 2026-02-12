import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, Search, Filter, Eye, Trash2, CheckCircle, XCircle, Clock,
  ArrowLeft, Globe, TrendingUp, UserCheck, UserX, RefreshCw, AlertTriangle, X
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'

interface Mureed {
  _id: string
  mureedId: number
  fullName: string
  fatherName: string
  contactNumber: string
  country: string
  city: string
  dateOfBirth: string
  address: string
  profilePicture: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface Stats {
  total: number
  approved: number
  pending: number
  rejected: number
  recentCount: number
  countryStats: { _id: string; count: number }[]
}

export default function AdminMureedsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [mureeds, setMureeds] = useState<Mureed[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string; mureedId: number }>({ show: false, id: '', name: '', mureedId: 0 })

  useEffect(() => {
    fetchMureeds()
    fetchStats()
  }, [page, statusFilter, search])

  const fetchMureeds = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      })
      
      const response = await apiClient.get(`/mureeds?${params}`)
      if (response.data.success) {
        setMureeds(response.data.data)
        setTotalPages(response.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching mureeds:', error)
      toast.error('Failed to load mureeds')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/mureeds/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await apiClient.put(`/mureeds/${id}/status`, { status })
      if (response.data.success) {
        toast.success(`Mureed ${status} successfully`)
        fetchMureeds()
        fetchStats()
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteClick = (id: string, name: string, mureedId: number) => {
    setDeleteConfirm({ show: true, id, name, mureedId })
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await apiClient.delete(`/mureeds/${deleteConfirm.id}`)
      if (response.data.success) {
        toast.success('Mureed deleted successfully')
        fetchMureeds()
        fetchStats()
      }
    } catch (error) {
      toast.error('Failed to delete mureed')
    } finally {
      setDeleteConfirm({ show: false, id: '', name: '', mureedId: 0 })
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Helmet>
        <title>Manage Mureeds | Admin Dashboard</title>
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
                <Users className="h-8 w-8 text-primary-600" />
                Mureed Management
              </h1>
            </div>
            
            <Button
              onClick={() => { fetchMureeds(); fetchStats(); }}
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
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Mureeds</p>
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
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
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
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 Days</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.recentCount}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Country Distribution */}
          {stats && stats.countryStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary-600" />
                Top Countries
              </h3>
              <div className="flex flex-wrap gap-3">
                {stats.countryStats.map((country) => (
                  <span
                    key={country._id}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{country._id}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">({country.count})</span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, contact, or city..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mureeds Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading mureeds...</p>
              </div>
            ) : mureeds.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No mureeds found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mureed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mureeds.map((mureed) => (
                      <tr key={mureed._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={mureed.profilePicture}
                              alt={mureed.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{mureed.fullName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">S/O {mureed.fatherName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-mono text-primary-600 font-semibold">{mureed.mureedId}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {mureed.contactNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {mureed.city}, {mureed.country}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            mureed.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            mureed.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {mureed.status.charAt(0).toUpperCase() + mureed.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(mureed.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link to={`/mureed/card/${mureed.mureedId}`} target="_blank">
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors" title="View Card">
                                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </button>
                            </Link>
                            
                            {mureed.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(mureed._id, 'approved')}
                                className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </button>
                            )}
                            
                            {mureed.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(mureed._id, 'rejected')}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteClick(mureed._id, mureed.fullName, mureed.mureedId)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-center gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beautiful Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm({ show: false, id: '', name: '', mureedId: 0 })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header with icon */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Delete Mureed?</h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Are you sure you want to delete this Mureed?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                    {deleteConfirm.name}
                  </p>
                  <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium mt-2">
                    ID: {deleteConfirm.mureedId}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-4">
                  This action cannot be undone. All data including profile picture and registration details will be permanently removed.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-0">
                <Button
                  onClick={() => setDeleteConfirm({ show: false, id: '', name: '', mureedId: 0 })}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
