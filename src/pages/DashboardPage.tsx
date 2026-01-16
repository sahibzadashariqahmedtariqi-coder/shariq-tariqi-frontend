import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { DollarSign, Upload, CheckCircle, Clock, XCircle, AlertTriangle, Calendar, FileText, X, BookOpen, ShoppingBag } from 'lucide-react'
import apiClient from '@/services/api'
import toast from 'react-hot-toast'

interface FeePayment {
  _id: string
  month: number
  year: number
  amount: number
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  paymentScreenshot: string
  monthName: string
  rejectionReason?: string
  dueDate: string
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [feeData, setFeeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState<FeePayment | null>(null)
  const [uploading, setUploading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'bank_transfer',
    transactionId: '',
    notes: '',
    screenshot: ''
  })

  useEffect(() => {
    if (user?.isPaidStudent) {
      fetchFeeData()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchFeeData = async () => {
    try {
      const response = await apiClient.get('/fee/my-fees')
      setFeeData(response.data?.data)
    } catch (error) {
      console.error('Error fetching fee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentForm({ ...paymentForm, screenshot: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitPayment = async () => {
    if (!selectedFee || !paymentForm.screenshot) {
      toast.error('Please upload payment screenshot')
      return
    }

    setUploading(true)
    try {
      await apiClient.post('/fee/submit', {
        month: selectedFee.month,
        year: selectedFee.year,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        notes: paymentForm.notes,
        screenshot: paymentForm.screenshot
      })
      toast.success('Payment submitted! Awaiting admin approval.')
      setShowPaymentModal(false)
      setPaymentForm({ paymentMethod: 'bank_transfer', transactionId: '', notes: '', screenshot: '' })
      fetchFeeData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit payment')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            <CheckCircle className="h-4 w-4" /> Paid
          </span>
        )
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            <Clock className="h-4 w-4" /> Under Review
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            <XCircle className="h-4 w-4" /> Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" /> Not Paid
          </span>
        )
    }
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
        
        {/* Paid Student Info */}
        {user?.isPaidStudent && (
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-full font-semibold">
              🎓 Student ID: {user.studentId}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-4">Quick Access</h2>
          <div className="flex flex-wrap gap-4">
            <a 
              href="/lms" 
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium"
            >
              <BookOpen className="h-5 w-5" />
              My Learning (LMS)
            </a>
            <a 
              href="/appointments" 
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium"
            >
              <Calendar className="h-5 w-5" />
              Book Appointment
            </a>
            <a 
              href="/my-orders" 
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium"
            >
              <ShoppingBag className="h-5 w-5" />
              My Orders
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Fee Management Section - Only for Paid Students */}
        {user?.isPaidStudent && !loading && feeData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Fee Management
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Monthly Fee</p>
                <p className="text-2xl font-bold text-green-600">Rs. {feeData.monthlyFee?.toLocaleString()}</p>
              </div>
            </div>

            {/* Course Access Status */}
            {feeData.courseAccessBlocked && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Your course access is blocked due to unpaid fees. Please clear your dues to restore access.</span>
                </div>
              </div>
            )}

            {/* Current Month Fee */}
            {feeData.currentMonthFee && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {months[feeData.currentMonthFee.month - 1]} {feeData.currentMonthFee.year}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Due Date: {new Date(feeData.currentMonthFee.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(feeData.currentMonthFee.status)}
                    {(feeData.currentMonthFee.status === 'pending' || feeData.currentMonthFee.status === 'rejected') && (
                      <Button
                        onClick={() => {
                          setSelectedFee(feeData.currentMonthFee)
                          setShowPaymentModal(true)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
                {feeData.currentMonthFee.status === 'rejected' && feeData.currentMonthFee.rejectionReason && (
                  <p className="mt-2 text-red-600 text-sm">
                    Rejection Reason: {feeData.currentMonthFee.rejectionReason}
                  </p>
                )}
              </div>
            )}

            {/* Fee History */}
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {feeData.feeHistory?.map((fee: FeePayment) => (
                    <tr key={fee._id}>
                      <td className="px-4 py-3">
                        {months[fee.month - 1]} {fee.year}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        Rs. {fee.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(fee.status)}
                      </td>
                      <td className="px-4 py-3">
                        {(fee.status === 'pending' || fee.status === 'rejected') && (
                          <Button
                            onClick={() => {
                              setSelectedFee(fee)
                              setShowPaymentModal(true)
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!feeData.feeHistory || feeData.feeHistory.length === 0) && (
                <p className="text-center py-8 text-gray-500">No fee records yet</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedFee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  Pay Fee - {months[selectedFee.month - 1]} {selectedFee.year}
                </h2>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                <p className="text-2xl font-bold text-green-600">
                  Rs. {selectedFee.amount?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount Due</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Transaction ID (Optional)</label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter transaction ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Screenshot *</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {paymentForm.screenshot ? (
                      <div className="relative">
                        <img src={paymentForm.screenshot} alt="Screenshot" className="max-h-40 mx-auto rounded" />
                        <button
                          onClick={() => setPaymentForm({ ...paymentForm, screenshot: '' })}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload screenshot</p>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows={2}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPayment}
                  disabled={uploading || !paymentForm.screenshot}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {uploading ? 'Submitting...' : 'Submit Payment'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
