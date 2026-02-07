import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Package, Shield, Truck, CheckCircle, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CheckoutModal from '@/components/checkout/CheckoutModal'

interface Product {
  _id: string
  name: string
  description: string
  longDescription?: string
  price: number
  originalPrice?: number
  priceINR?: number
  originalPriceINR?: number
  category: string
  image: string
  images?: string[]
  stock: number
  isFeatured: boolean
  benefits?: string[]
  ingredients?: string[]
  usage?: string
  hasPdfVersion?: boolean
  pdfPrice?: number
  pdfPriceINR?: number
  pdfUrl?: string
  isPdfOnly?: boolean
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [showFullImage, setShowFullImage] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseType, setPurchaseType] = useState<'hardcopy' | 'pdf'>('hardcopy')
  const [currentSlide, setCurrentSlide] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch product and related products
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        
        // Fetch current product
        const response = await apiClient.get(`/products/${id}`)
        const productData = response.data.data || response.data
        setProduct(productData)
        setSelectedImage(productData.image)
        
        // Fetch ALL products for related section - NO FILTERS
        const allProductsRes = await apiClient.get('/products')
        let allProducts: Product[] = allProductsRes.data.data || allProductsRes.data || []
        
        // Only exclude current product - NO OTHER FILTERS
        allProducts = allProducts.filter((p) => p._id !== id)
        
        console.log('✅ Related Products:', allProducts.length, allProducts)
        setRelatedProducts(allProducts.slice(0, 10))
        
      } catch (error: any) {
        console.error('Failed to fetch product:', error)
        toast.error('Product not found')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Auto-scroll carousel every 3 seconds
  useEffect(() => {
    if (relatedProducts.length === 0) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % relatedProducts.length)
    }, 3000)
    
    return () => clearInterval(timer)
  }, [relatedProducts.length])

  // Scroll to current slide
  useEffect(() => {
    if (scrollContainerRef.current && relatedProducts.length > 0) {
      const container = scrollContainerRef.current
      const cardWidth = 320 // approximate card width
      container.scrollTo({
        left: currentSlide * cardWidth,
        behavior: 'smooth'
      })
    }
  }, [currentSlide, relatedProducts.length])

  const scrollLeft = () => {
    setCurrentSlide((prev) => (prev - 1 + relatedProducts.length) % relatedProducts.length)
  }

  const scrollRight = () => {
    setCurrentSlide((prev) => (prev + 1) % relatedProducts.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    setShowCheckout(true)
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | Sahibzada Shariq Ahmed Tariqi</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {/* Full Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[101]"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedImage || product.image}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              {/* Main Image */}
              <div 
                className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                onClick={() => setShowFullImage(true)}
              >
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x800/1B4332/D4AF37?text=Product+Image'
                  }}
                />
                {product.isFeatured && (
                  <div className="absolute top-4 right-4 bg-gold-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold">
                    Click to enlarge
                  </span>
                </div>
              </div>
              
              {/* Image Thumbnails Gallery */}
              {((product.images && product.images.length > 0) || product.image) && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {/* Main Image Thumbnail */}
                  <button
                    onClick={() => setSelectedImage(product.image)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === product.image 
                        ? 'border-primary-500 ring-2 ring-primary-300' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <img 
                      src={product.image} 
                      alt="Main" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                  
                  {/* Additional Image Thumbnails */}
                  {product.images?.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img 
                          ? 'border-primary-500 ring-2 ring-primary-300' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`View ${index + 2}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-emerald-500 rounded-full w-fit mx-auto mb-2">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Authentic</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 rounded-xl shadow-md border border-blue-200 dark:border-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-blue-500 rounded-full w-fit mx-auto mb-2">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Fast Shipping</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl shadow-md border border-amber-200 dark:border-amber-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-amber-500 rounded-full w-fit mx-auto mb-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Quality</p>
                </div>
              </div>
              
              {/* Delivery Notice */}
              <div className="flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-primary-50 via-gold-50 to-primary-50 dark:from-primary-900/20 dark:via-gold-900/20 dark:to-primary-900/20 py-3 px-4 rounded-lg border border-primary-200 dark:border-primary-700">
                <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Delivery within <span className="font-bold text-primary-700 dark:text-primary-400">24-48 hours</span> after payment
                </p>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-3 capitalize">
                  {product.category}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Original Price with strikethrough */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    Rs.{product.originalPrice.toLocaleString()} PKR
                  </span>
                )}
                
                {/* Current Price */}
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  Rs.{(purchaseType === 'pdf' && product.pdfPrice 
                    ? product.pdfPrice 
                    : product.price).toLocaleString()} PKR
                </div>
                
                {/* Discount Badge - Biyaas Style */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold shadow-lg">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%Off
                  </span>
                )}
                
                {/* Stock Badge */}
                {purchaseType === 'hardcopy' ? (
                  product.stock > 0 ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                      In Stock ({product.stock})
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                      Out of Stock
                    </span>
                  )
                ) : (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                    📄 PDF Download
                  </span>
                )}
              </div>
              
              {product.priceINR && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {/* Original INR Price */}
                  {product.originalPriceINR && product.originalPriceINR > product.priceINR && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.originalPriceINR.toLocaleString()}
                    </span>
                  )}
                  <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                    IN ₹{(purchaseType === 'pdf' && product.pdfPriceINR 
                      ? product.pdfPriceINR 
                      : product.priceINR).toLocaleString()}
                  </div>
                </div>
              )}

              {/* PDF Only Book - Compact & Attractive */}
              {product.category === 'books' && product.isPdfOnly && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700 shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-lg shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">PDF Only</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Digital format only</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        PK PKR {(product.pdfPrice || product.price).toLocaleString()}
                      </div>
                      {(product.pdfPriceINR || product.priceINR) && (
                        <div className="text-sm font-bold text-orange-500">
                          IN ₹{(product.pdfPriceINR || product.priceINR)?.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1.5">
                    <span>⚡</span> PDF will be sent via WhatsApp after payment
                  </p>
                </div>
              )}

              {/* Purchase Type Selector (for Books with BOTH Hard Copy and PDF) */}
              {product.category === 'books' && product.hasPdfVersion && !product.isPdfOnly && (
                <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-700 shadow-lg">
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-5 flex items-center gap-2">
                    <span className="text-2xl">🛒</span> Select Purchase Type
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    {/* Hard Copy Option */}
                    <button
                      onClick={() => setPurchaseType('hardcopy')}
                      className={`relative p-5 rounded-2xl border-3 transition-all duration-300 transform hover:scale-[1.02] ${
                        purchaseType === 'hardcopy'
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 shadow-xl shadow-green-200 dark:shadow-green-900/50'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-green-300 hover:shadow-lg'
                      }`}
                    >
                      {purchaseType === 'hardcopy' && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          ✓ Selected
                        </div>
                      )}
                      <div className="text-4xl mb-3">📚</div>
                      <div className="font-bold text-lg text-gray-800 dark:text-white">Hard Copy</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        📦 Physical Book Delivery
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="text-green-600 dark:text-green-400 font-bold text-lg">
                          🇵🇰 PKR {product.price.toLocaleString()}
                        </div>
                        {product.priceINR && (
                          <div className="text-orange-600 dark:text-orange-400 font-bold">
                            🇮🇳 ₹{product.priceINR.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </button>
                    
                    {/* PDF Option */}
                    <button
                      onClick={() => setPurchaseType('pdf')}
                      className={`relative p-5 rounded-2xl border-3 transition-all duration-300 transform hover:scale-[1.02] ${
                        purchaseType === 'pdf'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 shadow-xl shadow-blue-200 dark:shadow-blue-900/50'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 hover:shadow-lg'
                      }`}
                    >
                      {purchaseType === 'pdf' && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          ✓ Selected
                        </div>
                      )}
                      <div className="text-4xl mb-3">📱</div>
                      <div className="font-bold text-lg text-gray-800 dark:text-white">PDF</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ⚡ Instant via WhatsApp
                      </div>
                      <div className="mt-4 space-y-1">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                          🇵🇰 PKR {(product.pdfPrice || 0).toLocaleString()}
                        </div>
                        {product.pdfPriceINR && (
                          <div className="text-orange-600 dark:text-orange-400 font-bold">
                            🇮🇳 ₹{product.pdfPriceINR.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {/* Info Note */}
                  <div className="mt-4 p-3 bg-white/60 dark:bg-gray-900/40 rounded-xl text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {purchaseType === 'hardcopy' 
                        ? '🚚 Book will be delivered to your address'
                        : '📲 PDF will be sent via WhatsApp after payment'}
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity Selector - Only for Hard Copy (not for PDF Only books) */}
              {purchaseType === 'hardcopy' && !product.isPdfOnly && (
              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center font-bold transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!product.isPdfOnly && purchaseType === 'hardcopy' && product.stock === 0}
                className="w-full py-6 text-lg font-bold gap-3"
                size="lg"
              >
                <ShoppingCart className="h-6 w-6" />
                {product.category === 'Books' 
                  ? (product.isPdfOnly 
                      ? 'Buy PDF'
                      : (purchaseType === 'hardcopy' 
                          ? (product.stock === 0 ? 'Out of Stock' : 'Buy Hard Copy')
                          : 'Buy PDF'))
                  : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')
                }
              </Button>

            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="space-y-8">
              {/* Long Description */}
              {product.longDescription && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    About This Product
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.longDescription}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Key Benefits
                  </h2>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                        <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    Ingredients
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage */}
              {product.usage && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    How to Use
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    {product.usage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products You May Like Section - Carousel */}
      {relatedProducts.length > 0 && (
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-100 to-emerald-100 dark:from-primary-900/30 dark:to-emerald-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
                ✨ Discover More
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Products You May <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600">Love</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Handpicked recommendations based on your interest
              </p>
            </motion.div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-white hover:bg-primary-500 hover:text-white transition-all duration-300 -ml-4 lg:-ml-6"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-white hover:bg-primary-500 hover:text-white transition-all duration-300 -mr-4 lg:-mr-6"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Products Carousel */}
              <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {relatedProducts.map((relatedProduct, idx) => (
                  <motion.div
                    key={relatedProduct._id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="group flex-shrink-0 w-[280px] sm:w-[300px]"
                  >
                    <Link to={`/products/${relatedProduct._id}`}>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700">
                        {/* Image */}
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Featured Badge */}
                          {relatedProduct.isFeatured && (
                            <span className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                              Featured
                            </span>
                          )}
                          
                          {/* Category Badge */}
                          <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full backdrop-blur-sm">
                            {relatedProduct.category}
                          </span>

                          {/* Quick View Button */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                            <span className="px-4 py-2 bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4" /> View Product
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {relatedProduct.name}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {relatedProduct.description}
                          </p>
                          
                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                Rs.{relatedProduct.price.toLocaleString()}
                              </span>
                              {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                                <span className="ml-2 text-sm text-gray-400 line-through">
                                  Rs.{relatedProduct.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {relatedProduct.stock > 0 ? (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">In Stock</span>
                            ) : (
                              <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {relatedProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === currentSlide 
                        ? 'bg-primary-500 w-8' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-primary-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* View All Products Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Link to="/products">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group px-8 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-300"
                >
                  View All Products
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {product && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          orderType="product"
          itemId={product._id}
          itemTitle={product.name}
          itemPrice={
            product.isPdfOnly 
              ? (product.pdfPrice || product.price)
              : (purchaseType === 'pdf' && product.pdfPrice ? product.pdfPrice : product.price)
          }
          itemPriceINR={
            product.isPdfOnly 
              ? (product.pdfPriceINR || product.priceINR)
              : (purchaseType === 'pdf' && product.pdfPriceINR ? product.pdfPriceINR : product.priceINR)
          }
          quantity={product.isPdfOnly || purchaseType === 'pdf' ? 1 : quantity}
          isPdfPurchase={product.isPdfOnly || purchaseType === 'pdf'}
          pdfUrl={product.pdfUrl}
        />
      )}
    </>
  )
}
