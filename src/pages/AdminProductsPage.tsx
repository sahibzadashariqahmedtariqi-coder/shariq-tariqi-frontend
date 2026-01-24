import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X, ShoppingCart, Leaf, Sparkles, BookOpen, Upload, Image as ImageIcon, ArrowLeft, FileText } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import apiClient from '@/services/api'
import { uploadApi } from '@/services/apiService'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  priceINR: number | null
  category: 'herbal' | 'spiritual' | 'books' | 'pdf'
  image: string
  images?: string[]
  stock: number
  featured: boolean
  pdfUrl?: string
  hasPdfVersion?: boolean
  pdfPrice?: number | null
  pdfPriceINR?: number | null
  isPdfOnly?: boolean
}

export default function AdminProductsPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editForm, setEditForm] = useState<Product>({
    _id: '',
    name: '',
    description: '',
    price: 0,
    priceINR: null,
    category: 'spiritual',
    image: '',
    images: [],
    stock: 0,
    featured: false,
    pdfUrl: '',
    hasPdfVersion: false,
    pdfPrice: null,
    pdfPriceINR: null,
    isPdfOnly: false,
  })

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/products?limit=100')
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      toast.loading('Uploading image to Cloudinary...')
      
      const response = await uploadApi.uploadImage(file, 'products')
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

  const handlePdfUpload = async (file: File) => {
    try {
      setUploading(true)
      toast.loading('Uploading PDF to Cloudinary... (Large files may take a few minutes)')
      
      const response = await uploadApi.uploadPdf(file, 'pdfs')
      const pdfUrl = response.data.data.url
      
      setEditForm({ ...editForm, pdfUrl: pdfUrl })
      toast.dismiss()
      toast.success('PDF uploaded successfully!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Failed to upload PDF')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setIsEditing(product._id)
    setEditForm(product)
    setIsAdding(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.delete(`/products/${id}`)
        toast.success('Product deleted successfully!')
        fetchProducts()
      } catch (error) {
        toast.error('Failed to delete product')
      }
    }
  }

  const handleSave = async () => {
    // For PDFs, require pdfUrl instead of image
    if (editForm.category === 'pdf') {
      if (!editForm.name || !editForm.pdfUrl) {
        toast.error('Please fill in required fields (Name and PDF)!')
        return
      }
      // Set a default placeholder image for PDFs
      if (!editForm.image) {
        editForm.image = 'https://res.cloudinary.com/shariqtariqi/image/upload/v1737654000/pdf-icon.png'
      }
    } else {
      if (!editForm.name || !editForm.image) {
        toast.error('Please fill in required fields!')
        return
      }
    }

    try {
      if (isAdding) {
        // Remove _id when creating new product
        const { _id, ...productData } = editForm
        await apiClient.post('/products', productData)
        toast.success('Product added successfully!')
      } else {
        await apiClient.put(`/products/${editForm._id}`, editForm)
        toast.success('Product updated successfully!')
      }
      
      fetchProducts()
      handleCancel()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product')
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setIsAdding(false)
    setEditForm({
      _id: '',
      name: '',
      description: '',
      price: 0,
      priceINR: null,
      category: 'herbal',
      image: '',
      images: [],
      stock: 0,
      featured: false,
      pdfUrl: '',
      hasPdfVersion: false,
      pdfPrice: null,
      pdfPriceINR: null,
      isPdfOnly: false,
    })
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setIsEditing(null)
    setEditForm({
      _id: '',
      name: '',
      description: '',
      price: 0,
      priceINR: null,
      category: 'herbal',
      image: '',
      images: [],
      stock: 0,
      featured: false,
      pdfUrl: '',
      hasPdfVersion: false,
      pdfPrice: null,
      pdfPriceINR: null,
      isPdfOnly: false,
    })
  }

  return (
    <>
      <Helmet>
        <title>Admin - Manage Products | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-16">
        <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white">
            Manage Products
          </h1>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-5 w-5" />
            Add New Product
          </Button>
        </div>

        {/* Category Filter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'all' ? 'scale-110' : ''}`}>
              <ShoppingCart className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">All Products</span>
          </button>
          <button
            onClick={() => setSelectedCategory('herbal')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'herbal'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'herbal' ? 'scale-110' : ''}`}>
              <Leaf className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">Herbal Medicines</span>
          </button>
          <button
            onClick={() => setSelectedCategory('spiritual')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'spiritual'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'spiritual' ? 'scale-110' : ''}`}>
              <Sparkles className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">Spiritual Healing Items</span>
          </button>
          <button
            onClick={() => setSelectedCategory('books')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'books'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'books' ? 'scale-110' : ''}`}>
              <BookOpen className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">Amliyat Books</span>
          </button>
          <button
            onClick={() => setSelectedCategory('pdf')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 transform ${
              selectedCategory === 'pdf'
                ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600'
                : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            <div className={`transition-transform duration-300 ${selectedCategory === 'pdf' ? 'scale-110' : ''}`}>
              <FileText className="h-8 w-8" />
            </div>
            <span className="text-sm font-semibold text-center">Free PDFs</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {isAdding ? 'Add New Product' : 'Edit Product'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Product['category'] })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="herbal">Herbal Medicines</option>
                  <option value="spiritual">Spiritual Healing Items</option>
                  <option value="books">Amliyat Books</option>
                  <option value="pdf">Free PDFs</option>
                </select>
              </div>
              
              {/* Only show Price and Stock for non-PDF products */}
              {editForm.category !== 'pdf' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (PKR) 🇵🇰</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter price in PKR"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (INR) 🇮🇳 <span className="text-xs text-gray-500">(For India)</span></label>
                    <input
                      type="number"
                      value={editForm.priceINR || ''}
                      onChange={(e) => setEditForm({ ...editForm, priceINR: e.target.value ? Number(e.target.value) : null })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter price in INR (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter stock quantity"
                    />
                  </div>
                </>
              )}
              
              {/* PDF Options for Books */}
              {editForm.category === 'books' && (
                <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">📚 Book Availability Options:</p>
                  
                  {/* Option 1: Both Hard Copy + PDF */}
                  <label className="flex items-center gap-2 mb-3 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer">
                    <input
                      type="radio"
                      name="bookType"
                      checked={!editForm.isPdfOnly && !editForm.hasPdfVersion}
                      onChange={() => setEditForm({ ...editForm, hasPdfVersion: false, isPdfOnly: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📖 Hard Copy Only (No PDF option)</span>
                  </label>
                  
                  {/* Option 2: Hard Copy + PDF Both */}
                  <label className="flex items-center gap-2 mb-3 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer">
                    <input
                      type="radio"
                      name="bookType"
                      checked={editForm.hasPdfVersion && !editForm.isPdfOnly}
                      onChange={() => setEditForm({ ...editForm, hasPdfVersion: true, isPdfOnly: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📖📄 Both Hard Copy & PDF Available</span>
                  </label>
                  
                  {/* Option 3: PDF Only */}
                  <label className="flex items-center gap-2 mb-3 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 cursor-pointer">
                    <input
                      type="radio"
                      name="bookType"
                      checked={editForm.isPdfOnly}
                      onChange={() => setEditForm({ ...editForm, hasPdfVersion: true, isPdfOnly: true })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📄 PDF Only (No Hard Copy available)</span>
                  </label>
                  
                  {/* PDF Price Fields - show when PDF is available */}
                  {(editForm.hasPdfVersion || editForm.isPdfOnly) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <div>
                        <label className="block text-sm font-medium mb-2">PDF Price (PKR) 🇵🇰</label>
                        <input
                          type="number"
                          value={editForm.pdfPrice || ''}
                          onChange={(e) => setEditForm({ ...editForm, pdfPrice: e.target.value ? Number(e.target.value) : null })}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          placeholder="Enter PDF price in PKR"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">PDF Price (INR) 🇮🇳</label>
                        <input
                          type="number"
                          value={editForm.pdfPriceINR || ''}
                          onChange={(e) => setEditForm({ ...editForm, pdfPriceINR: e.target.value ? Number(e.target.value) : null })}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          placeholder="Enter PDF price in INR"
                        />
                      </div>
                      <div className="md:col-span-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          📱 PDF will be sent via WhatsApp after payment verification
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* PDF Upload for Free PDFs category */}
              {editForm.category === 'pdf' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">PDF Document *</label>
                  <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-purple-800 dark:text-purple-300 mb-1">📄 Upload PDF File:</p>
                        <ul className="text-purple-700 dark:text-purple-400 space-y-1 text-xs">
                          <li>• <strong>Format:</strong> PDF only</li>
                          <li>• PDF will be uploaded to Cloudinary</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            await handlePdfUpload(file)
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {uploading && (
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
                      value={editForm.pdfUrl || ''}
                      onChange={(e) => setEditForm({ ...editForm, pdfUrl: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="https://res.cloudinary.com/... or https://drive.google.com/..."
                    />
                  </div>

                  {/* PDF Preview */}
                  {editForm.pdfUrl && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">PDF Uploaded ✓</span>
                        <a 
                          href={editForm.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-auto text-xs text-green-600 hover:underline"
                        >
                          View PDF →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              
              {/* Product Image - Only for non-PDF products */}
              {editForm.category !== 'pdf' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Product Image *</label>
                
                {/* Image Size Instructions */}
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">📐 Recommended Image Size:</p>
                      <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-xs">
                        <li>• <strong>Dimensions:</strong> 400x300px (Landscape 4:3 ratio)</li>
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
                    value={editForm.image}
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
                      className="w-32 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>
              )}
              
              {/* Additional Images - Optional */}
              {editForm.category !== 'pdf' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Additional Images (Optional)</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Add more images to show different angles of your product</p>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      onChange={async (e) => {
                        const files = e.target.files
                        if (files && files.length > 0) {
                          setUploading(true)
                          for (let i = 0; i < files.length; i++) {
                            try {
                              const response = await uploadApi.uploadImage(files[i], 'products')
                              if (response.data.success) {
                                setEditForm(prev => ({
                                  ...prev,
                                  images: [...(prev.images || []), response.data.data.url]
                                }))
                                toast.success(`Image ${i + 1} uploaded!`)
                              }
                            } catch (error) {
                              toast.error(`Failed to upload image ${i + 1}`)
                            }
                          }
                          setUploading(false)
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-300 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  
                  {/* Additional Images Preview */}
                  {editForm.images && editForm.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Additional Images ({editForm.images.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {editForm.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img} 
                              alt={`Additional ${index + 1}`} 
                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditForm(prev => ({
                                  ...prev,
                                  images: prev.images?.filter((_, i) => i !== index) || []
                                }))
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.featured}
                    onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Featured Product</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Product
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          /* Products List */
          <div className="grid grid-cols-1 gap-6">
            {products
              .filter((product) => selectedCategory === 'all' || product.category === selectedCategory)
              .map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center gap-6"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  {product.featured && (
                    <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {product.description}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="bg-primary-100 dark:bg-primary-900 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  <span className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                    Stock: {product.stock}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-600 mt-3">
                  PKR {product.price}
                  {product.priceINR && (
                    <span className="text-lg text-orange-600 ml-3">
                      🇮🇳 ₹{product.priceINR}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(product)}
                  variant="outline"
                  size="icon"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(product._id)}
                  variant="outline"
                  size="icon"
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Click "Choose file" to upload product images directly to Cloudinary</li>
            <li>Images will be automatically optimized and converted to WebP format</li>
            <li>Recommended image size: 400x300px (4:3 landscape ratio)</li>
            <li>Mark important products as "Featured" to highlight them on homepage</li>
            <li>All products are automatically saved to MongoDB database</li>
            <li>Changes reflect immediately on the products page</li>
          </ul>
        </div>
      </div>
      </div>
    </>
  )}