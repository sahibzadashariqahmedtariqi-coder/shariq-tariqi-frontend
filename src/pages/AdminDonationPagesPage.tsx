import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Edit2, Trash2, Upload, ArrowLeft, Eye, Image, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import apiClient from '@/services/api'
import { uploadApi } from '@/services/apiService'

interface DonationPage {
  _id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  coverImage: string
  galleryImages?: string[]
  youtubeShortsUrl?: string
  isPublished: boolean
  order?: number
}

// Default pages that should always appear in dropdown
const defaultPages = [
  {
    title: 'Helping Communities',
    slug: 'helping-communities',
    shortDescription: 'Supporting families in need',
    description: 'Your support helps provide food, clothing, and essential care to families who need it most. Together, we can uplift communities and restore hope.',
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=800&fit=crop',
  },
  {
    title: 'Education for All',
    slug: 'education-for-all',
    shortDescription: 'Providing quality education',
    description: 'Education transforms lives. Your donation supports learning materials, teachers, and access to schools for children who deserve a brighter future.',
    coverImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&h=800&fit=crop',
  },
  {
    title: 'Food Distribution',
    slug: 'food-distribution',
    shortDescription: 'Feeding the hungry',
    description: 'We deliver meals to families and individuals facing hunger. Your generosity ensures that no one sleeps hungry.',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=800&fit=crop',
  },
  {
    title: 'Building Hope',
    slug: 'building-hope',
    shortDescription: 'Creating better futures',
    description: 'Support initiatives that create long-term impact — from shelters to healthcare and community support programs.',
    coverImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=800&fit=crop',
  },
]

const toSlug = (value = '') => value
  .toString()
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '')

export default function AdminDonationPagesPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const [pages, setPages] = useState<DonationPage[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState<DonationPage | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [selectedDropdown, setSelectedDropdown] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    coverImage: '',
    galleryImages: [] as string[],
    youtubeShortsUrl: '',
    isPublished: true,
    order: 0
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await apiClient.get('/donation-pages/admin/all')
      if (response.data.success) {
        setPages(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch donation pages:', error)
      toast.error('Failed to load donation pages')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setCurrentPage(null)
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      coverImage: '',
      galleryImages: [],
      youtubeShortsUrl: '',
      isPublished: true,
      order: 0
    })
  }

  const handleEdit = (page: DonationPage) => {
    setIsEditing(true)
    setCurrentPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      shortDescription: page.shortDescription,
      description: page.description,
      coverImage: page.coverImage,
      galleryImages: page.galleryImages || [],
      youtubeShortsUrl: page.youtubeShortsUrl || '',
      isPublished: page.isPublished,
      order: page.order || 0
    })
  }

  const handleCoverUpload = async (file: File) => {
    try {
      setUploadingCover(true)
      console.log('📤 Uploading cover image:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      const res = await uploadApi.uploadImage(file, 'donation-pages')
      console.log('✅ Cover upload response:', res.data)
      const imageUrl = res.data?.data?.url || res.data?.url
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, coverImage: imageUrl }))
        toast.success('Cover image uploaded')
      } else {
        console.error('❌ No URL in response:', res)
        toast.error('Upload failed - no URL returned')
      }
    } catch (error: any) {
      console.error('❌ Cover upload error:', error.response?.data || error.message || error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload image'
      toast.error(errorMsg)
    } finally {
      setUploadingCover(false)
    }
  }

  const handleGalleryUpload = async (file: File) => {
    try {
      setUploadingGallery(true)
      console.log('📤 Uploading gallery image:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      const res = await uploadApi.uploadImage(file, 'donation-pages')
      console.log('✅ Upload response:', res.data)
      const imageUrl = res.data?.data?.url || res.data?.url
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, imageUrl] }))
        toast.success('Gallery image uploaded')
      } else {
        console.error('❌ No URL in response:', res)
        toast.error('Upload failed - no URL returned')
      }
    } catch (error: any) {
      console.error('❌ Gallery upload error:', error.response?.data || error.message || error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload image'
      toast.error(errorMsg)
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        slug: formData.slug || toSlug(formData.title),
        galleryImages: formData.galleryImages.filter(Boolean)
      }

      if (isEditing && currentPage) {
        await apiClient.put(`/donation-pages/${currentPage._id}`, payload)
        toast.success('Donation page updated')
      } else {
        await apiClient.post('/donation-pages', payload)
        toast.success('Donation page created')
      }

      resetForm()
      fetchPages()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save donation page')
    }
  }

  const handleDelete = async (pageId: string) => {
    if (!window.confirm('Are you sure you want to delete this donation page?')) return

    try {
      await apiClient.delete(`/donation-pages/${pageId}`)
      toast.success('Donation page deleted')
      fetchPages()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete donation page')
    }
  }

  return (
    <>
      <Helmet>
        <title>Donation Pages | Admin Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-10">
          <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donation Pages</h1>
              <p className="text-gray-600 dark:text-gray-400">Create beautiful pages for donation campaigns</p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setSelectedDropdown('')
                window.scrollTo({ top: document.getElementById('donation-form')?.offsetTop || 500, behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105"
            >
              <span className="text-xl">+</span> Create New Page
            </button>
          </div>

          {/* Page Selection Dropdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <Image className="w-4 h-4 inline mr-2" />
              Select Page to Edit
            </label>
            <select
              value={selectedDropdown}
              onChange={(e) => {
                const selectedSlug = e.target.value
                setSelectedDropdown(selectedSlug)
                
                if (selectedSlug === '') {
                  resetForm()
                  return
                }
                
                // Check if page exists in database
                const existingPage = pages.find(p => p.slug === selectedSlug)
                if (existingPage) {
                  handleEdit(existingPage)
                } else {
                  // Load from default pages
                  const defaultPage = defaultPages.find(p => p.slug === selectedSlug)
                  if (defaultPage) {
                    setIsEditing(false)
                    setCurrentPage(null)
                    setFormData({
                      title: defaultPage.title,
                      slug: defaultPage.slug,
                      shortDescription: defaultPage.shortDescription,
                      description: defaultPage.description,
                      coverImage: defaultPage.coverImage,
                      galleryImages: [],
                      youtubeShortsUrl: '',
                      isPublished: true,
                      order: 0
                    })
                  }
                }
              }}
              className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white text-gray-900 text-lg font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="">-- Select a Page --</option>
              <optgroup label="📋 Default Pages">
                {defaultPages.map((page) => {
                  const existsInDb = pages.some(p => p.slug === page.slug)
                  return (
                    <option key={page.slug} value={page.slug}>
                      {page.title} {existsInDb ? '✅' : '(Not Created)'}
                    </option>
                  )
                })}
              </optgroup>
              {pages.filter(p => !defaultPages.some(d => d.slug === p.slug)).length > 0 && (
                <optgroup label="📁 Custom Pages">
                  {pages.filter(p => !defaultPages.some(d => d.slug === p.slug)).map((page) => (
                    <option key={page._id} value={page.slug}>{page.title} ✅</option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-2">✅ = Already created in database</p>
          </div>

          {/* Form */}
          <form id="donation-form" onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-10 border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g. Food Distribution"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Slug (optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="food-distribution"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Description *</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Short summary shown on card"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Write detailed description for donors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Image *</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCoverUpload(file)
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
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
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="https://res.cloudinary.com/..."
                    required
                  />
                  {uploadingCover && <p className="text-xs text-primary-600">Uploading...</p>}
                  {formData.coverImage && (
                    <img src={formData.coverImage} alt="Cover" className="w-full h-40 object-cover rounded-lg border" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">YouTube Shorts URL (optional)</label>
                <input
                  type="url"
                  value={formData.youtubeShortsUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeShortsUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="https://www.youtube.com/shorts/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  min={0}
                />
              </div>

              <div className="md:col-span-2">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                  <label className="block text-lg font-bold text-gray-900 dark:text-white mb-2">
                    🖼️ Hero Slides / Gallery Images
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload multiple images that will auto-slide in the hero section. Cover image is the first slide.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      📐 Recommended: 1200 × 800 px
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                      📏 Aspect Ratio: 3:2 (Landscape)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                      📦 Max Size: 5 MB
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                      🖼️ Formats: JPG, PNG, WebP
                    </span>
                  </div>
                  
                  {/* Upload Button */}
                  <div className="mb-4">
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-emerald-700 transition-colors">
                      <Upload className="w-5 h-5" />
                      Upload Hero Slide Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleGalleryUpload(file)
                        }}
                        className="hidden"
                      />
                    </label>
                    {uploadingGallery && (
                      <span className="ml-3 text-emerald-600 animate-pulse">Uploading...</span>
                    )}
                  </div>

                  {/* Image Previews Grid */}
                  {formData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                      {formData.galleryImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={img} 
                            alt={`Slide ${idx + 1}`} 
                            className="w-full h-28 object-cover rounded-xl border-2 border-white shadow-lg"
                          />
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            Slide {idx + 2}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.galleryImages.filter((_, i) => i !== idx)
                              setFormData({ ...formData, galleryImages: updated })
                            }}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or paste image URL here..."
                      className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            setFormData({ ...formData, galleryImages: [...formData.galleryImages, input.value.trim()] })
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                        if (input?.value.trim()) {
                          setFormData({ ...formData, galleryImages: [...formData.galleryImages, input.value.trim()] })
                          input.value = ''
                        }
                      }}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 font-semibold"
                    >
                      Add
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Total slides: {formData.galleryImages.length + 1} (Cover + {formData.galleryImages.length} gallery images)
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-gray-300">Publish this page</label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                {isEditing ? 'Update Page' : 'Create Page'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Donation Pages</h2>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : pages.length === 0 ? (
              <p className="text-gray-600">No donation pages yet.</p>
            ) : (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center gap-4">
                      <img src={page.coverImage} alt={page.title} className="w-20 h-16 object-cover rounded-lg" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{page.title}</h3>
                        <p className="text-sm text-gray-500">/{page.slug}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${page.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {page.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/donate/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <Eye className="w-4 h-4" /> View
                      </a>
                      <button
                        onClick={() => handleEdit(page)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(page._id)}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
