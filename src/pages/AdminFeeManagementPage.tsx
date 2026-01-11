import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, Users, Plus, Search, Eye, Check, X, Ban, 
  Unlock, Key, Calendar, DollarSign, AlertTriangle, 
  CheckCircle, Clock, FileText, Download, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/services/api'
import toast from 'react-hot-toast'

interface PaidStudent {
  _id: string
  name: string
  email: string
  phone: string
  studentId: string
  monthlyFee: number
  feeStatus: 'active' | 'defaulter' | 'suspended'
  courseAccessBlocked: boolean
  enrollmentDate: string
  createdAt: string
  currentMonthFee: string
  pendingFees: number
  overdueFees: number
  grantedCourses: any[]
}

interface FeePayment {
  _id: string
  student: {
    _id: string
    name: string
    email: string
    studentId: string
    phone: string
  }
  studentId: string
  month: number
  year: number
  amount: number
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  paymentScreenshot: string
  paymentMethod: string
  transactionId: string
  studentNotes: string
  submittedAt: string
  approvedAt: string
  monthName: string
}

interface Course {
  _id: string
  title: string
  isPaid: boolean
}

interface NewStudentForm {
  name: string
  phone: string
  monthlyFee: number
  courses: string[]
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']

export default function AdminFeeManagementPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'students' | 'pending' | 'all'>('students')
  const [students, setStudents] = useState<PaidStudent[]>([])
  const [pendingFees, setPendingFees] = useState<FeePayment[]>([])
  const [allFees, setAllFees] = useState<FeePayment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [selectedScreenshot, setSelectedScreenshot] = useState('')
  const [selectedFee, setSelectedFee] = useState<FeePayment | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [newCredentials, setNewCredentials] = useState<any>(null)
  
  // Form
  const [formData, setFormData] = useState<NewStudentForm>({
    name: '',
    phone: '',
    monthlyFee: 5000,
    courses: []
  })

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'students') {
        const response = await apiClient.get('/fee/students')
        setStudents(response.data?.data || [])
      } else if (activeTab === 'pending') {
        const response = await apiClient.get('/fee/pending')
        setPendingFees(response.data?.data || [])
      } else {
        const response = await apiClient.get('/fee/all')
        setAllFees(response.data?.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/courses?limit=100')
      const coursesData = response.data?.data || response.data || []
      setCourses(coursesData.filter((c: Course) => c.isPaid))
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const handleCreateStudent = async () => {
    if (!formData.name || !formData.phone || !formData.monthlyFee) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await apiClient.post('/fee/create-student', formData)
      if (response.data?.success) {
        toast.success('Paid student created successfully!')
        setNewCredentials(response.data.data.credentials)
        setShowCreateModal(false)
        setShowCredentialsModal(true)
        setFormData({ name: '', phone: '', monthlyFee: 5000, courses: [] })
        fetchData()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create student')
    }
  }

  const handleApproveFee = async (feeId: string) => {
    try {
      await apiClient.put(`/fee/approve/${feeId}`)
      toast.success('Fee payment approved!')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve')
    }
  }

  const handleRejectFee = async (feeId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (reason === null) return

    try {
      await apiClient.put(`/fee/reject/${feeId}`, { reason })
      toast.success('Fee payment rejected')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject')
    }
  }

  const handleBlockAccess = async (studentId: string) => {
    const reason = prompt('Enter reason for blocking (e.g., Fee defaulter):')
    if (reason === null) return

    try {
      await apiClient.put(`/fee/block/${studentId}`, { reason })
      toast.success('Student access blocked')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to block')
    }
  }

  const handleUnblockAccess = async (studentId: string) => {
    try {
      await apiClient.put(`/fee/unblock/${studentId}`)
      toast.success('Student access unblocked')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unblock')
    }
  }

  const handleGenerateMonthlyFees = async () => {
    if (!window.confirm('Generate fee records for current month for all active paid students?')) return

    try {
      const response = await apiClient.post('/fee/generate-monthly', {})
      toast.success(response.data?.message || 'Monthly fees generated')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate')
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">✅ Paid</span>
      case 'submitted':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">⏳ Pending Review</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">❌ Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">📋 Not Paid</span>
    }
  }

  return (
    <>
      <Helmet>
        <title>Fee Management | Admin Dashboard</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6 font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-2">
              💰 Fee Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage paid students and their monthly fees
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateMonthlyFees}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Generate Monthly Fees
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Paid Student
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {students.length}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Total Paid Students
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {students.filter(s => s.feeStatus === 'active').length}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Active Students
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">
              {students.filter(s => s.feeStatus === 'defaulter').length}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Fee Defaulters
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
              {pendingFees.length}
            </div>
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
              Pending Approvals
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'students'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            👨‍🎓 Paid Students
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            ⏳ Pending Approvals
            {pendingFees.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingFees.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            📋 All Fee Records
          </button>
        </div>

        {/* Search */}
        {activeTab === 'students' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, student ID or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : activeTab === 'students' ? (
          /* Students Table */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Monthly Fee</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Current Month</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                          <div className="text-sm text-gray-500">{student.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                          {student.studentId}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        Rs. {student.monthlyFee?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {student.courseAccessBlocked ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            🔒 Blocked
                          </span>
                        ) : student.feeStatus === 'defaulter' ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                            ⚠️ Defaulter
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            ✅ Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(student.currentMonthFee)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {student.courseAccessBlocked ? (
                            <button
                              onClick={() => handleUnblockAccess(student.studentId)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Unblock Access"
                            >
                              <Unlock className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockAccess(student.studentId)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Block Access"
                            >
                              <Ban className="h-5 w-5" />
                            </button>
                          )}
                          <Link
                            to={`/admin/fee-history/${student.studentId}`}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View Fee History"
                          >
                            <FileText className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No paid students found
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'pending' ? (
          /* Pending Fees */
          <div className="space-y-4">
            {pendingFees.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No pending fee approvals</p>
              </div>
            ) : (
              pendingFees.map((fee) => (
                <div key={fee._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {fee.student?.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">{fee.studentId}</p>
                      <p className="text-sm text-gray-500">{fee.student?.phone}</p>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-green-600">
                          Rs. {fee.amount?.toLocaleString()}
                        </span>
                        <span className="text-gray-500 ml-2">
                          for {months[fee.month - 1]} {fee.year}
                        </span>
                      </div>
                      {fee.paymentMethod && (
                        <p className="text-sm text-gray-500 mt-1">
                          Payment Method: {fee.paymentMethod.replace('_', ' ').toUpperCase()}
                        </p>
                      )}
                      {fee.transactionId && (
                        <p className="text-sm text-gray-500">
                          Transaction ID: {fee.transactionId}
                        </p>
                      )}
                      {fee.studentNotes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{fee.studentNotes}"
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {fee.paymentScreenshot && (
                        <button
                          onClick={() => {
                            setSelectedScreenshot(fee.paymentScreenshot)
                            setShowScreenshotModal(true)
                          }}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-5 w-5" />
                          View Screenshot
                        </button>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleApproveFee(fee._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectFee(fee._id)}
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* All Fees Table */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Month/Year</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Screenshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {allFees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{fee.student?.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{fee.studentId}</div>
                      </td>
                      <td className="px-6 py-4">
                        {months[fee.month - 1]} {fee.year}
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        Rs. {fee.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(fee.status)}
                      </td>
                      <td className="px-6 py-4">
                        {fee.paymentScreenshot && (
                          <button
                            onClick={() => {
                              setSelectedScreenshot(fee.paymentScreenshot)
                              setShowScreenshotModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Student Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                ➕ Add Paid Student
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Student full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Fee (Rs.) *</label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Grant Access to Courses</label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 dark:border-gray-600">
                    {courses.map((course) => (
                      <label key={course._id} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={formData.courses.includes(course._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, courses: [...formData.courses, course._id] })
                            } else {
                              setFormData({ ...formData, courses: formData.courses.filter(id => id !== course._id) })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{course.title}</span>
                      </label>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-sm text-gray-500">No paid courses available</p>
                    )}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📧 A unique Student ID and login credentials will be automatically generated.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateStudent}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  Create Student
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Modal */}
        {showCredentialsModal && newCredentials && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Student Created Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Please save these credentials securely
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase">Student ID</label>
                  <div className="font-mono font-bold text-lg text-primary-600">
                    {newCredentials.studentId}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Login Email</label>
                  <div className="font-mono text-sm break-all">
                    {newCredentials.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase">Password</label>
                  <div className="font-mono font-bold text-lg">
                    {newCredentials.password}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    const text = `Student ID: ${newCredentials.studentId}\nEmail: ${newCredentials.email}\nPassword: ${newCredentials.password}`
                    navigator.clipboard.writeText(text)
                    toast.success('Credentials copied to clipboard!')
                  }}
                  variant="outline"
                  className="w-full mb-3"
                >
                  📋 Copy Credentials
                </Button>
                <Button
                  onClick={() => {
                    setShowCredentialsModal(false)
                    setNewCredentials(null)
                  }}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Modal */}
        {showScreenshotModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowScreenshotModal(false)}>
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setShowScreenshotModal(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={selectedScreenshot}
                alt="Payment Screenshot"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
