import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Leaf, Book, Sparkles, Search, FileText, Download, Eye, Heart, X, Shield, Truck, BadgeCheck, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  priceINR?: number
  category: string
  image: string
  stock: number
  isFeatured: boolean
  pdfUrl?: string
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'herbal' | 'spiritual' | 'books' | 'pdf'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/products?limit=100')
      // Backend returns { success, count, total, data }
      setProducts(response.data.data || response.data || [])
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toast.error(error.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Function to force download PDF
  const handleDownloadPdf = async (pdfUrl: string, fileName: string) => {
    try {
      toast.loading('Downloading PDF...')
      const response = await fetch(pdfUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to download PDF')
      console.error('Download error:', error)
    }
  }

  const categories = [
    { id: 'all', name: 'All Products', icon: ShoppingCart },
    { id: 'herbal', name: 'Herbal Medicines', icon: Leaf },
    { id: 'spiritual', name: 'Spiritual Healing Items', icon: Sparkles },
    { id: 'books', name: 'Books', icon: Book },
    { id: 'pdf', name: 'Free PDFs', icon: FileText },
  ]

  const filteredProducts = products.filter((product) => {
    // Hide PDFs from All Products - only show in Free PDFs category
    if (selectedCategory === 'all' && product.category === 'pdf') {
      return false
    }
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Products | Sahibzada Shariq Ahmed Tariqi</title>
        <meta
          name="description"
          content="Shop authentic herbal medicines, spiritual healing items, and amliyat books for traditional Islamic healing."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary-800 dark:text-white mb-3 sm:mb-4">
              Our Products
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
              Authentic herbal medicines, spiritual healing items, and comprehensive amliyat books
              for traditional Islamic healing and spiritual practices.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 sm:mb-10"
          >
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4">
              <div className="flex flex-col items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary-700 dark:text-primary-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Authentic</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary-700 dark:text-primary-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <BadgeCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary-700 dark:text-primary-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Quality</span>
              </div>
            </div>
            
            {/* Professional Delivery Notice */}
            <div className="flex items-center justify-center gap-2 text-center">
              <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">
                After payment confirmation, delivery within <span className="font-semibold text-primary-700 dark:text-primary-400">24-48 hours</span> (Working days only, based on workload)
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 sm:mb-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-gray-800 dark:text-white"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-xl transition-all duration-300 transform ${
                      isActive
                        ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-gold-400 shadow-2xl scale-105 ring-2 sm:ring-4 ring-primary-300 dark:ring-primary-600'
                        : 'bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-primary-800 dark:hover:to-primary-700 border-2 border-yellow-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500'
                    }`}
                  >
                    <Icon className={`h-5 w-5 sm:h-8 sm:w-8 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-xs sm:text-sm font-semibold text-center">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-8">
              {filteredProducts.map((product, index) => {
                // Beautiful gradient colors for PDF cards
                const pdfGradients = [
                  'from-emerald-500 via-teal-500 to-cyan-500',
                  'from-violet-500 via-purple-500 to-fuchsia-500',
                  'from-amber-500 via-orange-500 to-red-500',
                  'from-blue-500 via-indigo-500 to-violet-500',
                  'from-rose-500 via-pink-500 to-fuchsia-500',
                  'from-green-500 via-emerald-500 to-teal-500',
                  'from-cyan-500 via-sky-500 to-blue-500',
                  'from-fuchsia-500 via-pink-500 to-rose-500',
                ]
                const cardBgGradients = [
                  'from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 border-emerald-200 dark:border-emerald-700',
                  'from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20 border-violet-200 dark:border-violet-700',
                  'from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-amber-200 dark:border-amber-700',
                  'from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-violet-900/20 border-blue-200 dark:border-blue-700',
                  'from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-fuchsia-900/20 border-rose-200 dark:border-rose-700',
                  'from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-700',
                  'from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-900/20 dark:via-sky-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700',
                  'from-fuchsia-50 via-pink-50 to-rose-50 dark:from-fuchsia-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-fuchsia-200 dark:border-fuchsia-700',
                ]
                const gradientIndex = index % pdfGradients.length
                
                return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  {/* PDF Products Card */}
                  {product.category === 'pdf' ? (
                    <div className={`block rounded-2xl overflow-hidden border-2 bg-gradient-to-br ${cardBgGradients[gradientIndex]} shadow-md hover:shadow-xl transition-all duration-300`}>
                      {/* PDF Header with icon */}
                      <div className={`bg-gradient-to-r ${pdfGradients[gradientIndex]} p-6 flex items-center justify-center`}>
                        <FileText className="h-14 w-14 text-white drop-shadow-lg" />
                      </div>

                      <div className="p-4">
                        <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <span className="inline-block text-sm font-bold text-green-600 dark:text-green-400 mb-3">
                          Free PDF
                        </span>
                        
                        {product.pdfUrl && (
                          <div className="flex gap-2">
                            <a 
                              href={product.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg flex-1 font-semibold transition-colors"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </a>
                            <button
                              onClick={() => handleDownloadPdf(product.pdfUrl!, product.name)}
                              className="inline-flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg flex-1 font-semibold transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Regular Products Card - Premium Biyaas Style */
                    <Link 
                      to={`/products/${product._id}`}
                      className="block bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200/60 dark:border-gray-700 group-hover:-translate-y-2"
                    >
                      {/* Image Container - Rectangle like Biyaas */}
                      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/placeholder-product.jpg'
                          }}
                        />
                        
                        {/* Featured Badge - Top Left */}
                        {product.isFeatured && (
                          <div className="absolute top-3 left-3 bg-primary-700 text-white px-2.5 py-1 text-[10px] sm:text-xs font-bold shadow-md">
                            Featured
                          </div>
                        )}
                        
                        {/* Out of Stock Overlay */}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-sm bg-red-600 px-3 py-1.5">Out of Stock</span>
                          </div>
                        )}
                        
                        {/* Hover Action Buttons - Biyaas Style */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toast.success('Added to wishlist!')
                            }}
                            className="p-2 bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 hover:bg-primary-600 hover:text-white text-gray-600"
                            title="Add to Wishlist"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setQuickViewProduct(product)
                            }}
                            className="p-2 bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 translate-x-4 group-hover:translate-x-0 hover:bg-primary-600 hover:text-white text-gray-600"
                            title="Quick View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Low Stock Badge */}
                        {product.stock > 0 && product.stock < 10 && (
                          <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-0.5 text-[10px] font-semibold">
                            Only {product.stock} left
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm sm:text-[15px] font-medium text-gray-800 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {product.name}
                        </h3>

                        {/* Price Section */}
                        <div className="mb-3">
                          <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            PKR {product.price.toLocaleString()}
                          </span>
                          {product.priceINR && (
                            <span className="block text-sm font-medium text-orange-600 dark:text-orange-400 mt-0.5">
                              IN ₹{product.priceINR.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* View Button */}
                        <button 
                          className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-xs sm:text-sm font-medium py-2.5 rounded-lg transition-all duration-300 disabled:bg-gray-400"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          View
                        </button>
                      </div>
                    </Link>
                  )}
                </motion.div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-1/2 aspect-square bg-gray-100 dark:bg-gray-700">
                  <img
                    src={quickViewProduct.image}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Details */}
                <div className="md:w-1/2 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {quickViewProduct.isFeatured && (
                        <span className="inline-block bg-primary-700 text-white text-xs px-2 py-1 rounded mb-2">
                          Featured
                        </span>
                      )}
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {quickViewProduct.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => setQuickViewProduct(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">
                    {quickViewProduct.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                      PKR {quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.priceINR && (
                      <span className="block text-lg font-semibold text-orange-600 dark:text-orange-400 mt-1">
                        IN ₹{quickViewProduct.priceINR.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {quickViewProduct.stock > 0 ? (
                    <p className="text-green-600 dark:text-green-400 text-sm mb-4">
                      ✓ In Stock ({quickViewProduct.stock} available)
                    </p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                      ✗ Out of Stock
                    </p>
                  )}
                  
                  <button
                    onClick={() => {
                      setQuickViewProduct(null)
                      navigate(`/products/${quickViewProduct._id}`)
                    }}
                    className="w-full bg-primary-700 hover:bg-primary-800 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    View Full Details
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
