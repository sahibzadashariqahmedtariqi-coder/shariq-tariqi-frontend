import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import apiClient from '@/services/api'
import { uploadApi } from '@/services/apiService'

interface HeroSlide {
  _id: string
  title: string
  subtitle?: string
  image: string
  buttonText?: string
  buttonLink?: string
  order: number
  isActive: boolean
}

export default function AdminHeroSlidesPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'Learn More',
    buttonLink: '/about',
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/hero-slides')
      setSlides(response.data.data || [])
    } catch (error) {
      console.error('Error fetching slides:', error)
      toast.error('Failed to load hero slides')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      toast.loading('Uploading image to Cloudinary...')
      
      const response = await uploadApi.uploadImage(file, 'hero-slides')
      const imageUrl = response.data.data.url
      
      setEditForm({ ...editForm, image: imageUrl })
      toast.dismiss()
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Failed to upload image')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (slide: HeroSlide) => {
    setIsEditing(slide._id)
    setEditForm(slide)
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      try {
        await apiClient.delete(`/hero-slides/${id}`)
        toast.success('Slide deleted successfully!')
        fetchSlides()
      } catch (error) {
        toast.error('Failed to delete slide')
      }
    }
  }

  const handleSave = async () => {
    if (!editForm.title || !editForm.image) {
      toast.error('Please fill in title and image!')
      return
    }

    try {
      if (isAdding) {
        await apiClient.post('/hero-slides', editForm)
        toast.success('Slide added successfully!')
      } else if (isEditing) {
        await apiClient.put(`/hero-slides/${isEditing}`, editForm)
        toast.success('Slide updated successfully!')
      }
      
      setIsEditing(null)
      setIsAdding(false)
      setEditForm({
        title: '',
        subtitle: '',
        image: '',
        buttonText: 'Learn More',
        buttonLink: '/about',
        order: 0,
        isActive: true,
      })
      fetchSlides()
    } catch (error) {
      toast.error('Failed to save slide')
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setIsAdding(false)
    setEditForm({
      title: '',
      subtitle: '',
      image: '',
      buttonText: 'Learn More',
      buttonLink: '/about',
      order: 0,
      isActive: true,
    })
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setIsEditing(null)
    setEditForm({
      title: '',
      subtitle: '',
      image: '',
      buttonText: 'Learn More',
      buttonLink: '/about',
      order: slides.length,
      isActive: true,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Manage Hero Slides | Admin</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-16">
          <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </Link>
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary-800 dark:text-white">
              Manage Hero Slides (Home Page Carousel)
            </h1>
            <Button
              onClick={handleAddNew}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Slide
            </Button>
          </div>

          {/* Add/Edit Form */}
          {(isEditing || isAdding) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                {isAdding ? 'Add New Slide' : 'Edit Slide'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Welcome to Our Website"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={editForm.subtitle || ''}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Discover spiritual healing and guidance"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Slide Image *</label>
                  
                  {/* Image Size Instructions */}
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">📐 Recommended Image Size:</p>
                        <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-xs">
                          <li>• <strong>Dimensions:</strong> 1920x800px or 1200x500px (Wide horizontal format)</li>
                          <li>• <strong>Aspect Ratio:</strong> 16:9 or similar landscape ratio</li>
                          <li>• <strong>File Size:</strong> Max 5MB (smaller is better for fast loading)</li>
                          <li>• <strong>Format:</strong> JPG, PNG, or WebP</li>
                          <li>• <strong>Tip:</strong> Images will be automatically optimized and converted to WebP</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            await handleImageUpload(file)
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {uploading && (
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
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR paste Cloudinary URL</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={editForm.image || ''}
                      onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>

                  {/* Image Preview */}
                  {editForm.image && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                      <img
                        src={editForm.image}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/1200x600/EF4444/FFFFFF?text=Image+Not+Found'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Button Text</label>
                  <input
                    type="text"
                    value={editForm.buttonText || ''}
                    onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Learn More"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Button Link</label>
                  <input
                    type="text"
                    value={editForm.buttonLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, buttonLink: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="/about"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order (Position)</label>
                  <input
                    type="number"
                    value={editForm.order || 0}
                    onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 mr-2"
                  />
                  <label className="text-sm font-medium">Active (Show on website)</label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Slide
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Slides List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide) => (
              <div key={slide._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/800x400/1B4332/D4AF37?text=Hero+Slide'
                    }}
                  />
                  {!slide.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Inactive
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs">
                    Order: {slide.order}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 text-gray-800 dark:text-white">{slide.title}</h3>
                  {slide.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{slide.subtitle}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(slide)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(slide._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {slides.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No hero slides yet. Add your first slide!</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
