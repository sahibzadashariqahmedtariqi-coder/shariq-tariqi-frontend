import { motion } from 'framer-motion'
import { Bell, Calendar, ArrowRight, Megaphone, X, ShoppingBag, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import apiClient from '@/services/api'

interface Update {
  _id: string
  title: string
  description: string
  date: string
  category: 'announcement' | 'event' | 'news' | 'course' | 'general'
  updateType?: 'general' | 'product' | 'course'
  productId?: string
  courseId?: string
  link?: string
  image?: string
  promoImage?: string
}

const fallbackUpdates: Update[] = [
  {
    _id: '2',
    title: "Ruhani Punjab Tour",
    description: "Join us on an enlightening spiritual journey across Punjab. Experience divine blessings, spiritual healing sessions, and traditional Islamic teachings in multiple cities. A transformative tour to strengthen your connection with Allah.",
    date: "2025-11-20",
    category: "announcement",
    link: "/blog/2",
    promoImage: "/images/ruhani-promo.jpg"
  }
]

const typeConfig = {
  announcement: {
    icon: Megaphone,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800'
  },
  event: {
    icon: Calendar,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800'
  },
  news: {
    icon: Bell,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800'
  },
  course: {
    icon: Bell,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800'
  },
  general: {
    icon: Bell,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800'
  }
}

export default function LatestUpdates() {
  const [updates, setUpdates] = useState<Update[]>(fallbackUpdates)
  const [loading, setLoading] = useState(true)
  const [showFullImage, setShowFullImage] = useState(false)
  const [fullImageSrc, setFullImageSrc] = useState('')

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    try {
      const response = await apiClient.get('/updates?limit=3')
      if (response.data.success && response.data.data.length > 0) {
        setUpdates(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error)
      // Keep fallback updates
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (src: string) => {
    setFullImageSrc(src)
    setShowFullImage(true)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-gray-800 relative">
      <div className="container mx-auto px-4 relative">
        {/* Full Image Modal */}
        {showFullImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-red-600 hover:bg-red-700 rounded-full p-3 shadow-lg transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={fullImageSrc}
              alt="Full Size Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Blinking Promotional Image - Shows on all devices */}
        {(updates[0]?.promoImage || updates[0]?.image) && (
          <>
            {/* Mobile/Tablet - Above content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:hidden flex justify-center mb-6"
            >
              <div className="relative">
                <img
                  src={`${updates[0].promoImage || updates[0].image}?t=${Date.now()}`}
                  alt="Promotional Banner"
                  className="w-40 sm:w-48 h-auto rounded-xl shadow-2xl border-4 border-gold-400 hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => handleImageClick(updates[0].promoImage || updates[0].image || '')}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x600/8B0000/FFD700?text=Ruhani+Tour+Promo'
                  }}
                />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">
                  New!
                </div>
              </div>
            </motion.div>

            {/* Desktop - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block absolute right-8 top-32 z-10"
            >
              <div className="relative animate-pulse">
                <img
                  src={`${updates[0].promoImage || updates[0].image}?t=${Date.now()}`}
                  alt="Promotional Banner"
                  className="w-56 h-auto rounded-xl shadow-2xl border-4 border-gold-400 hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => handleImageClick(updates[0].promoImage || updates[0].image || '')}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x600/8B0000/FFD700?text=Ruhani+Tour+Promo'
                  }}
                />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">
                  New!
                </div>
              </div>
            </motion.div>
          </>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-4 border-gold-400 animate-pulse">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2 sm:gap-3">
              <Bell className="h-5 w-5 sm:h-8 sm:w-8 text-gold-300 animate-bounce" />
              <span className="whitespace-nowrap">Latest Updates</span>
              <Bell className="h-5 w-5 sm:h-8 sm:w-8 text-gold-300 animate-bounce" />
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mt-4 sm:mt-6 text-sm sm:text-lg font-medium px-2">
            Stay informed about our latest announcements, upcoming events, and spiritual programs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-6 max-w-3xl mx-auto lg:mr-80">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading updates...</p>
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No updates available at the moment.</p>
            </div>
          ) : (
            updates.map((update, index) => {
              const config = typeConfig[update.category]
              const Icon = config.icon

              return (
                <motion.div
                  key={update._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`${config.bg} ${config.border} border-2 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group`}>
                    {/* Mobile: Stack vertically, Desktop: Side by side */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      {/* Image */}
                      {update.image && (
                        <div className="flex-shrink-0 cursor-pointer w-full sm:w-auto" onClick={() => handleImageClick(update.image || '')}>
                          <img 
                            src={`${update.image}?t=${Date.now()}`}
                            alt={update.title}
                            className="w-full sm:w-28 md:w-32 h-40 sm:h-28 md:h-32 object-cover rounded-lg shadow-md hover:opacity-80 transition-opacity"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/200x200/1B4332/D4AF37?text=Update+Image'
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <div className={`${config.color} p-2 sm:p-3 rounded-lg ${config.bg} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                                {update.category}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(update.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 break-words">
                              {update.title}
                            </h3>
                            
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 break-words">
                              {update.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              <Link 
                                to={update.link || `/blog/${update._id}`}
                                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                Learn More
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Link>
                              
                              {/* Buy Now Button for Product Updates */}
                              {update.updateType === 'product' && update.productId && (
                                <Link 
                                  to={`/products/${update.productId}`}
                                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none"
                                >
                                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Buy Now
                                </Link>
                              )}
                              
                              {/* Enroll Now Button for Course Updates */}
                              {update.updateType === 'course' && update.courseId && (
                                <Link 
                                  to={`/courses/${update.courseId}`}
                                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:via-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none"
                                >
                                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Enroll Now
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}