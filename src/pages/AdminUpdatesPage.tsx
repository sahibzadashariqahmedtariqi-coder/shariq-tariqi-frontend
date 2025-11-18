import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Megaphone, Bell, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { uploadApi } from '@/services/apiService'

interface Update {
  id: number
  title: string
  description: string
  date: string
  type: 'announcement' | 'event' | 'news'
  link?: string
  image?: string
  promoImage?: string
}

export default function AdminUpdatesPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  const [updates, setUpdates] = useState<Update[]>([
    {
      id: 2,
      title: "Ruhani Punjab Tour",
      description: "Join us on an enlightening spiritual journey across Punjab. Experience divine blessings, spiritual healing sessions, and traditional Islamic teachings in multiple cities. A transformative tour to strengthen your connection with Allah.",
      date: "2025-11-20",
      type: "announcement",
      link: "/blog/2",
      image: "/images/ruhani-tour.jpg",
      promoImage: "/images/ruhani-promo.jpg"
    }
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [currentUpdate, setCurrentUpdate] = useState<Update | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingPromo, setUploadingPromo] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'announcement' as 'announcement' | 'event' | 'news',
    link: '',
    image: '',
    promoImage: ''
  })

  const handleEdit = (update: Update) => {
    setCurrentUpdate(update)
    setFormData({
      title: update.title,
      description: update.description,
      date: update.date,
      type: update.type,
      link: update.link || '',
      image: update.image || '',
      promoImage: update.promoImage || ''
    })
    setIsEditing(true)
  }

  const handleImageUpload = async (file: File, type: 'image' | 'promoImage') => {
    try {
      if (type === 'image') {
        setUploadingImage(true)
      } else {
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
      } else {
        setUploadingPromo(false)
      }
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this update?')) {
      setUpdates(updates.filter(update => update.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUpdate) {
      setUpdates(updates.map(update =>
        update.id === currentUpdate.id
          ? { ...update, ...formData }
          : update
      ))
    } else {
      const newUpdate: Update = {
        id: Math.max(...updates.map(u => u.id), 0) + 1,
        ...formData
      }
      setUpdates([...updates, newUpdate])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      type: 'announcement',
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
    news: { icon: Bell, color: 'text-green-600', bg: 'bg-green-100' }
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
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                  <option value="news">News</option>
                </select>
              </div>

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
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
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
                    className="w-32 h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
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
          
          {updates.map((update) => {
            const config = typeConfig[update.type]
            const Icon = config.icon

            return (
              <div
                key={update.id}
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
                          {update.type}
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
                      onClick={() => handleDelete(update.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
