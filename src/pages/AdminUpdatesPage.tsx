import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Megaphone, Bell, Upload, Image as ImageIcon, ArrowLeft, ShoppingBag, BookOpen } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { uploadApi } from '@/services/apiService'
import apiClient from '@/services/api'

interface Update {
  _id: string
  title: string
  description: string
  fullContent?: string
  detailImage1?: string
  detailImage2?: string
  date: string
  category: 'announcement' | 'event' | 'news' | 'course' | 'general'
  updateType?: 'general' | 'product' | 'course'
  productId?: string
  courseId?: string
  link?: string
  image?: string
  promoImage?: string
}

interface Product {
  _id: string
  name: string
}

interface Course {
  _id: string
  title: string
}

export default function AdminUpdatesPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  
  const [updates, setUpdates] = useState<Update[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUpdate, setCurrentUpdate] = useState<Update | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingPromo, setUploadingPromo] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullContent: '',
    detailImage1: '',
    detailImage2: '',
    date: '',
    category: 'announcement' as 'announcement' | 'event' | 'news' | 'course' | 'general',
    updateType: 'announcement' as 'announcement' | 'product' | 'course' | 'rohani_tour',
    productId: '',
    courseId: '',
    link: '',
    image: '',
    promoImage: ''
  })

  useEffect(() => {
    fetchUpdates()
    fetchProducts()
    fetchCourses()
  }, [])

  const fetchUpdates = async () => {
    try {
      const response = await apiClient.get('/updates')
      if (response.data.success) {
        setUpdates(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error)
      toast.error('Failed to load updates')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products')
      if (response.data.success) {
        setProducts(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/courses')
      if (response.data.success) {
        setCourses(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const handleEdit = (update: Update) => {
    setCurrentUpdate(update)
    // Convert ISO date to yyyy-MM-dd format for input field
    const formattedDate = update.date ? new Date(update.date).toISOString().split('T')[0] : ''
    setFormData({
      title: update.title,
      description: update.description,
      fullContent: update.fullContent || '',
      detailImage1: update.detailImage1 || '',
      detailImage2: update.detailImage2 || '',
      date: formattedDate,
      category: update.category,
      updateType: (update.updateType as any) || 'announcement',
      productId: update.productId || '',
      courseId: update.courseId || '',
      link: update.link || '',
      image: update.image || '',
      promoImage: update.promoImage || ''
    })
    setIsEditing(true)
  }

  const handleImageUpload = async (file: File, type: 'image' | 'promoImage' | 'detailImage1' | 'detailImage2') => {
    try {
      if (type === 'image') {
        setUploadingImage(true)
      } else if (type === 'promoImage') {
        setUploadingPromo(true)
      }
      
      toast.loading('Uploading image to Cloudinary...')
      
      const response = await uploadApi.uploadImage(file, 'updates')
      const imageUrl = response.data.data.url
      
      setFormData({ ...formData, [type]: imageUrl })
      toast.dismiss()
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Failed to upload image')
      console.error('Upload error:', error)
    } finally {
      if (type === 'image') {
        setUploadingImage(false)
      } else if (type === 'promoImage') {
        setUploadingPromo(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (currentUpdate) {
        // Update existing
        const response = await apiClient.put(`/updates/${currentUpdate._id}`, formData)
        if (response.data.success) {
          toast.success('Update edited successfully!')
          fetchUpdates()
        }
      } else {
        // Create new
        const response = await apiClient.post('/updates', formData)
        if (response.data.success) {
          toast.success('Update added successfully!')
          fetchUpdates()
        }
      }
      resetForm()
    } catch (error: any) {
      console.error('Failed to save update:', error)
      toast.error(error.response?.data?.message || 'Failed to save update')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return
    
    try {
      const response = await apiClient.delete(`/updates/${id}`)
      if (response.data.success) {
        toast.success('Update deleted successfully!')
        fetchUpdates()
      }
    } catch (error: any) {
      console.error('Failed to delete update:', error)
      toast.error(error.response?.data?.message || 'Failed to delete update')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fullContent: '',
      detailImage1: '',
      detailImage2: '',
      date: '',
      category: 'announcement',
      updateType: 'announcement',
      productId: '',
      courseId: '',
      link: '',
      image: '',
      promoImage: ''
    })
    setCurrentUpdate(null)
    setIsEditing(false)
  }

  const typeConfig = {
    announcement: { icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-100' },
    event: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    news: { icon: Bell, color: 'text-green-600', bg: 'bg-green-100' },
    course: { icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100' },
    general: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  return (
    <>
      <Helmet>
        <title>Manage Updates | Admin Dashboard</title>
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-2">
            Manage Updates
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Add, edit, or remove latest updates and announcements
          </p>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border-2 border-primary-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-primary-800 dark:text-white mb-6">
            {currentUpdate ? 'Edit Update' : 'Add New Update'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
                placeholder="Short description shown on homepage cards"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Content (Optional - for "Learn More" page)
              </label>
              <textarea
                value={formData.fullContent}
                onChange={(e) => setFormData({ ...formData, fullContent: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Detailed content shown when user clicks 'Learn More'. Leave empty to use description only."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This content will be displayed on the full update detail page (/blog/ID)
              </p>
            </div>

            {/* Detail Page Images */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Detail Page Image 1 (Optional)
                </label>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg mb-2">
                  <p className="text-xs text-indigo-700 dark:text-indigo-400">📸 First image for "Learn More" detail page</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'detailImage1' as any)
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">OR paste URL:</p>
                  <input
                    type="text"
                    value={formData.detailImage1}
                    onChange={(e) => setFormData({ ...formData, detailImage1: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                {formData.detailImage1 && (
                  <div className="mt-2">
                    <img src={formData.detailImage1} alt="Preview 1" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 pointer-events-none" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Detail Page Image 2 (Optional)
                </label>
                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg mb-2">
                  <p className="text-xs text-pink-700 dark:text-pink-400">📸 Second image for "Learn More" detail page</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'detailImage2' as any)
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">OR paste URL:</p>
                  <input
                    type="text"
                    value={formData.detailImage2}
                    onChange={(e) => setFormData({ ...formData, detailImage2: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                {formData.detailImage2 && (
                  <div className="mt-2">
                    <img src={formData.detailImage2} alt="Preview 2" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                  <option value="news">News</option>
                  <option value="course">Course</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Update Type * 
                  <span className="text-xs font-normal text-gray-500 ml-1">(Button will appear based on this)</span>
                </label>
                <select
                  value={formData.updateType}
                  onChange={(e) => setFormData({ ...formData, updateType: e.target.value as any, productId: '', courseId: '' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="product">🛒 Products</option>
                  <option value="course">📚 Course</option>
                  <option value="rohani_tour">🕌 Rohani Tour</option>
                </select>
              </div>
            </div>

            {/* Product Selection - Only show if updateType is 'product' */}
            {formData.updateType === 'product' && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl">
                <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                  <ShoppingBag className="inline w-4 h-4 mr-1" />
                  Select Product * (Buy Now button will link to this)
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-300 dark:border-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">-- Select a Product --</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>{product.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Course Selection - Only show if updateType is 'course' */}
            {formData.updateType === 'course' && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl">
                <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  <BookOpen className="inline w-4 h-4 mr-1" />
                  Select Course * (Enroll Now button will link to this)
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">-- Select a Course --</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Link (Optional)
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/courses"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image Name (Optional)
              </label>
              
              {/* Image Size Instructions */}
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">📐 Icon Image:</p>
                    <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-xs">
                      <li>• <strong>Dimensions:</strong> 200x200px (Square)</li>
                      <li>• <strong>Format:</strong> JPG, PNG, or WebP</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        await handleImageUpload(file, 'image')
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-primary-600">
                      <Upload className="w-4 h-4 animate-bounce" />
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR paste URL</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Icon Preview" 
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Promotional Image (Optional)
              </label>
              
              {/* Promo Image Size Instructions */}
              <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-purple-800 dark:text-purple-300 mb-1">📐 Promotional Banner:</p>
                    <ul className="text-purple-700 dark:text-purple-400 space-y-1 text-xs">
                      <li>• <strong>Dimensions:</strong> 400x600px (Portrait 2:3 ratio)</li>
                      <li>• <strong>Format:</strong> JPG, PNG, or WebP</li>
                      <li>• <strong>Note:</strong> Shown as blinking banner on right side</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingPromo}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        await handleImageUpload(file, 'promoImage')
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadingPromo && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Upload className="w-4 h-4 animate-bounce" />
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR paste URL</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.promoImage}
                  onChange={(e) => setFormData({ ...formData, promoImage: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Promo Image Preview */}
              {formData.promoImage && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <img 
                    src={formData.promoImage} 
                    alt="Promo Preview" 
                    className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                {currentUpdate ? 'Update' : 'Add Update'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary-800 dark:text-white mb-4">
            Current Updates ({updates.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading updates...</p>
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No updates found. Add your first update above!</p>
            </div>
          ) : (
            updates.map((update) => {
              const config = typeConfig[update.category]
              const Icon = config.icon

              return (
                <div
                  key={update._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`${config.bg} p-3 rounded-lg`}>
                        <Icon className={`h-6 w-6 ${config.color}`} />
                      </div>
                    
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${config.bg} ${config.color}`}>
                            {update.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(update.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {update.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {update.description}
                      </p>
                      
                      {update.link && (
                        <p className="text-sm text-primary-600 dark:text-primary-400">
                          Link: {update.link}
                        </p>
                      )}
                      
                      {update.image && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Image: {update.image}
                        </p>
                      )}
                      
                      {update.promoImage && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                          Promo Image: {update.promoImage} (Blinking on homepage)
                        </p>
                      )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(update)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    
                      <button
                        onClick={() => handleDelete(update._id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
