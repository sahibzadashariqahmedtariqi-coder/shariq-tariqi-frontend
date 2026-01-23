import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Package, Shield, Truck, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
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
  priceINR?: number
  category: string
  image: string
  stock: number
  isFeatured: boolean
  benefits?: string[]
  ingredients?: string[]
  usage?: string
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [quantity, setQuantity] = useState(1)
  const [showFullImage, setShowFullImage] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const response = await apiClient.get(`/products/${id}`)
        // Backend returns { success, data: product }
        setProduct(response.data.data || response.data)
      } catch (error: any) {
        console.error('Failed to fetch product:', error)
        toast.error('Product not found')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

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
            src={product.image}
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
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div 
                className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                onClick={() => setShowFullImage(true)}
              >
                <img
                  src={product.image}
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

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
                  <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Authentic</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
                  <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Fast Shipping</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
                  <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quality</p>
                </div>
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

              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  PKR {product.price.toLocaleString()}
                </div>
                {product.stock > 0 ? (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                    In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
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

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-6 text-lg font-bold gap-3"
                size="lg"
              >
                <ShoppingCart className="h-6 w-6" />
                {product.stock === 0 
                  ? 'Out of Stock' 
                  : 'Add to Cart'}
              </Button>

              {/* Contact for Order */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-xl">
                <p className="text-center font-semibold mb-2">
                  For orders, please contact us:
                </p>
                <p className="text-center text-xl font-bold">
                  +92 318 2392985
                </p>
              </div>
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

      {/* Checkout Modal */}
      {product && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          orderType="product"
          itemId={product._id}
          itemTitle={product.name}
          itemPrice={product.price}
          itemPriceINR={product.priceINR}
          quantity={quantity}
        />
      )}
    </>
  )
}
