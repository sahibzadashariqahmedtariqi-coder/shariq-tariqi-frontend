import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, Tag, ToggleLeft, ToggleRight, Search, Copy } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'

interface Coupon {
  _id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  applicableTo: 'all' | 'products' | 'courses' | 'appointments'
  minOrderAmount: number
  maxUses: number
  usedCount: number
  expiryDate: string | null
  isActive: boolean
  createdAt: string
}

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: 0,
  applicableTo: 'all' as 'all' | 'products' | 'courses' | 'appointments',
  minOrderAmount: 0,
  maxUses: 0,
  expiryDate: '',
  isActive: true,
}

export default function AdminCouponsPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/coupons')
      if (response.data.success) {
        setCoupons(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code.trim()) {
      toast.error('Coupon code is required')
      return
    }
    if (formData.discountValue <= 0) {
      toast.error('Discount value must be greater than 0')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...formData,
        expiryDate: formData.expiryDate || null,
      }

      if (editingId) {
        const response = await apiClient.put(`/coupons/${editingId}`, payload)
        if (response.data.success) {
          toast.success('Coupon updated successfully')
        }
      } else {
        const response = await apiClient.post('/coupons', payload)
        if (response.data.success) {
          toast.success('Coupon created successfully')
        }
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(emptyForm)
      fetchCoupons()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      applicableTo: coupon.applicableTo,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
    })
    setEditingId(coupon._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      await apiClient.delete(`/coupons/${id}`)
      toast.success('Coupon deleted')
      fetchCoupons()
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const response = await apiClient.put(`/coupons/${id}/toggle`)
      if (response.data.success) {
        toast.success(response.data.message)
        fetchCoupons()
      }
    } catch (error) {
      toast.error('Failed to toggle coupon')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied: ${code}`)
  }

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isExpired = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  return (
    <>
      <Helmet>
        <title>Manage Coupons | Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <Link to="/admin" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Tag className="w-8 h-8 text-violet-500" />
                Manage Coupons
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage discount coupons for orders</p>
            </div>
            <button
              onClick={() => {
                setFormData(emptyForm)
                setEditingId(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Coupon
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-2xl font-bold text-violet-600">{coupons.length}</p>
              <p className="text-sm text-gray-500">Total Coupons</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-2xl font-bold text-green-600">{coupons.filter(c => c.isActive).length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-2xl font-bold text-red-500">{coupons.filter(c => !c.isActive || isExpired(c.expiryDate)).length}</p>
              <p className="text-sm text-gray-500">Inactive / Expired</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-2xl font-bold text-blue-600">{coupons.reduce((sum, c) => sum + c.usedCount, 0)}</p>
              <p className="text-sm text-gray-500">Total Uses</p>
            </div>
          </div>

          {/* Create/Edit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto my-8">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                  </h2>
                  <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white uppercase"
                      placeholder="e.g. SAVE50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 50% off on all products"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type *</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (Rs.)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(Rs.)'}
                      </label>
                      <input
                        type="number"
                        value={formData.discountValue || ''}
                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        min="0"
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applicable To</label>
                    <select
                      value={formData.applicableTo}
                      onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All (Products, Courses & Appointments)</option>
                      <option value="products">Products Only</option>
                      <option value="courses">Courses Only</option>
                      <option value="appointments">Appointments Only</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Amount (Rs.)</label>
                      <input
                        type="number"
                        value={formData.minOrderAmount || ''}
                        onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        min="0"
                        placeholder="0 = no minimum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses</label>
                      <input
                        type="number"
                        value={formData.maxUses || ''}
                        onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        min="0"
                        placeholder="0 = unlimited"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-violet-600 rounded"
                    />
                    <label htmlFor="isActive" className="text-gray-700 dark:text-gray-300 font-medium">Active</label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 disabled:bg-gray-400 font-medium"
                    >
                      {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null) }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Coupons List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500">No coupons found</h3>
              <p className="text-gray-400 mt-1">Create your first discount coupon</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCoupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-5 transition-all ${
                    coupon.isActive && !isExpired(coupon.expiryDate)
                      ? 'border-violet-200 dark:border-violet-800'
                      : 'border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xl font-bold text-violet-600 dark:text-violet-400 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-gray-400 hover:text-violet-500 transition-colors"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {coupon.isActive && !isExpired(coupon.expiryDate) ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                        ) : isExpired(coupon.expiryDate) ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Expired</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Inactive</span>
                        )}
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{coupon.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-md font-medium">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `Rs. ${coupon.discountValue} OFF`}
                        </span>
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">
                          {coupon.applicableTo === 'all' ? 'All Orders' : coupon.applicableTo}
                        </span>
                        <span className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
                          Used: {coupon.usedCount}{coupon.maxUses > 0 ? `/${coupon.maxUses}` : ' (Unlimited)'}
                        </span>
                        {coupon.minOrderAmount > 0 && (
                          <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md">
                            Min: Rs. {coupon.minOrderAmount}
                          </span>
                        )}
                        {coupon.expiryDate && (
                          <span className={`px-2 py-1 rounded-md ${
                            isExpired(coupon.expiryDate)
                              ? 'bg-red-50 text-red-600'
                              : 'bg-green-50 text-green-600'
                          }`}>
                            Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(coupon._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
