import { Helmet } from 'react-helmet-async'
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Upload, ArrowLeft, Eye } from 'lucide-react'
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
      const res = await uploadApi.uploadImage(file, 'donation-pages')
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, coverImage: res.data.url }))
        toast.success('Cover image uploaded')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleGalleryUpload = async (file: File) => {
    try {
      setUploadingGallery(true)
      const res = await uploadApi.uploadImage(file, 'donation-pages')
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, res.data.url] }))
        toast.success('Gallery image uploaded')
      }
    } catch (error) {
      toast.error('Failed to upload image')
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
            <div className="flex items-center gap-3">
              {/* Dropdown to select existing page */}
              <select
                value={currentPage?._id || ''}
                onChange={(e) => {
                  const selectedId = e.target.value
                  if (selectedId === '') {
                    resetForm()
                  } else {
                    const selectedPage = pages.find(p => p._id === selectedId)
                    if (selectedPage) handleEdit(selectedPage)
                  }
                }}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white text-gray-900 min-w-[200px]"
              >
                <option value="">+ Add New Page</option>
                {pages.map((page) => (
                  <option key={page._id} value={page._id}>{page.title}</option>
                ))}
              </select>
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Add New Page
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-10 border border-gray-100 dark:border-gray-700">
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gallery Images (optional)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleGalleryUpload(file)
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  <input
                    type="text"
                    value=""
                    onChange={() => undefined}
                    className="hidden"
                  />
                </div>
                {uploadingGallery && <p className="text-xs text-emerald-600">Uploading...</p>}
                <div className="space-y-2">
                  {formData.galleryImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const updated = [...formData.galleryImages]
                          updated[idx] = e.target.value
                          setFormData({ ...formData, galleryImages: updated })
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="https://res.cloudinary.com/..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.galleryImages.filter((_, i) => i !== idx)
                          setFormData({ ...formData, galleryImages: updated })
                        }}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, galleryImages: [...formData.galleryImages, ''] })}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Upload className="w-4 h-4" /> Add Image URL
                </button>
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
