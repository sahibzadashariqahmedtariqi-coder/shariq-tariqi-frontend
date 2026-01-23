import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Leaf, Book, Sparkles, Search, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
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

  const categories = [
    { id: 'all', name: 'All Products', icon: ShoppingCart },
    { id: 'herbal', name: 'Herbal Medicines', icon: Leaf },
    { id: 'spiritual', name: 'Spiritual Healing Items', icon: Sparkles },
    { id: 'books', name: 'Books', icon: Book },
    { id: 'pdf', name: 'Free PDFs', icon: FileText },
  ]

  const filteredProducts = products.filter((product) => {
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

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={`/products/${product._id}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder-product.jpg'
                        }}
                      />
                      {product.isFeatured && (
                        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gold-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                          Featured
                        </div>
                      )}
                      {product.category !== 'pdf' && product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-sm sm:text-lg">Out of Stock</span>
                        </div>
                      )}
                      {product.category === 'pdf' && (
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-green-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                          Free
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-6">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white mb-1 sm:mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        {/* Show price for non-PDF products */}
                        {product.category !== 'pdf' ? (
                          <div>
                            <span className="text-base sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                              PKR {product.price.toLocaleString()}
                            </span>
                            {product.priceINR && (
                              <span className="block text-sm sm:text-xl font-bold text-orange-500 dark:text-orange-400 mt-1">
                                🇮🇳 ₹{product.priceINR.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-base sm:text-xl font-bold text-green-600 dark:text-green-400">
                            Free PDF
                          </span>
                        )}
                        
                        {/* Show Download button for PDFs, View button for others */}
                        {product.category === 'pdf' && product.pdfUrl ? (
                          <a 
                            href={product.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-2 rounded-lg w-full sm:w-auto font-semibold transition-colors"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            Download
                          </a>
                        ) : (
                          <Button 
                            size="sm" 
                            className="bg-primary-600 hover:bg-primary-700 text-xs sm:text-sm w-full sm:w-auto"
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {product.stock === 0 ? 'Sold Out' : 'View'}
                          </Button>
                        )}
                      </div>

                      {product.category !== 'pdf' && product.stock > 0 && product.stock < 10 && (
                        <p className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 mt-2">
                          Only {product.stock} left in stock
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
