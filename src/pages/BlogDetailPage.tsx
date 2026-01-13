import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, X, ZoomIn, BookOpen, Heart, Share2, Star, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import apiClient from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Update {
  _id: string
  title: string
  description: string
  fullContent?: string
  detailImage1?: string
  detailImage2?: string
  date: string
  category: string
  image?: string
}

export default function BlogDetailPage() {
  const { id } = useParams()
  const [update, setUpdate] = useState<Update | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const [fullImageSrc, setFullImageSrc] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 50)

  useEffect(() => {
    const fetchUpdate = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/updates/${id}`)
        if (response.data.success) {
          setUpdate(response.data.data)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Failed to fetch update:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUpdate()
    }
  }, [id])

  const handleImageClick = (src: string) => {
    setFullImageSrc(src)
    setShowFullImage(true)
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: update?.title,
        text: update?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const typeColors: Record<string, string> = {
    announcement: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/40 dark:to-orange-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700',
    event: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/40 dark:to-cyan-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-700',
    news: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/40 dark:to-emerald-900/40 dark:text-green-400 border border-green-200 dark:border-green-700',
    course: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/40 dark:to-pink-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-700',
    general: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 dark:from-gray-900/40 dark:to-slate-900/40 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="large" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-600 dark:text-gray-400 font-medium"
          >
            Loading spiritual content...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (error || !update) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🕌</div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Update Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The content you're looking for doesn't exist.</p>
          <Link to="/" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors">
            Return to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  const displayContent = update.fullContent || update.description
  const hasDetailImages = update.detailImage1 || update.detailImage2

  return (
    <>
      <Helmet>
        <title>{update.title} | Sahibzada Shariq Ahmed Tariqi</title>
        <meta name="description" content={update.description} />
      </Helmet>

      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              onClick={() => setShowFullImage(false)}
              className="absolute top-6 right-6 text-white hover:text-primary-400 transition-colors z-[101] bg-white/10 p-2 rounded-full backdrop-blur-sm"
            >
              <X className="h-8 w-8" />
            </motion.button>
            <motion.img
              initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 30 }}
              transition={{ type: "spring", damping: 25 }}
              src={fullImageSrc}
              alt="Full view"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-b from-primary-50/50 via-gold-50/30 to-primary-50/40 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated floating shapes */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{ 
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 15, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 12, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary-200/40 to-gold-200/40 dark:from-primary-900/30 dark:to-gold-900/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.2, 1],
              x: [0, -30, 0],
              y: [0, 30, 0]
            }}
            transition={{ 
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 14, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-gold-200/40 to-primary-200/40 dark:from-gold-900/30 dark:to-primary-900/30 rounded-full blur-3xl"
          />
          {/* Additional floating elements */}
          <motion.div
            animate={{ 
              y: [0, -40, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-primary-300/30 to-transparent rounded-full blur-2xl"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-10 w-40 h-40 bg-gradient-to-tl from-gold-300/30 to-transparent rounded-full blur-2xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-xl"
          />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold mb-8 group shadow-lg hover:shadow-xl transition-all duration-300 border border-primary-100 dark:border-primary-800"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </motion.div>

            {/* Article Header */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-white/50 dark:border-gray-700/50 relative overflow-hidden"
            >
              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-100/50 to-transparent dark:from-primary-900/30 rounded-bl-full" />
              <Sparkles className="absolute top-4 right-4 h-6 w-6 text-primary-400/50" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <motion.span 
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-md ${typeColors[update.category] || typeColors.general}`}
                  >
                    ✨ {update.category}
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full"
                  >
                    <Calendar className="h-4 w-4 text-primary-500" />
                    {new Date(update.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full"
                  >
                    <User className="h-4 w-4 text-primary-500" />
                    Sahibzada Shariq Ahmed Tariqi
                  </motion.span>
                </div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 dark:from-white dark:via-primary-200 dark:to-white bg-clip-text text-transparent mb-6 leading-tight"
                >
                  {update.title}
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
                >
                  {update.description}
                </motion.p>

                {/* Reading & Interaction Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-4"
                >
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full">
                      <BookOpen className="h-4 w-4 text-primary-600" />
                      <span className="font-medium">{Math.ceil(displayContent.length / 1000)} min read</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                        liked 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                      <span className="font-semibold">{likeCount}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="font-semibold">Share</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-gold-600 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                {/* Decorative patterns */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-block mb-4"
                >
                  <Star className="h-12 w-12 text-gold-300 fill-gold-300" />
                </motion.div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10">
                  Want to Learn More?
                </h3>
                <p className="text-primary-100 mb-6 text-lg relative z-10">
                  Book an appointment or explore our services for personalized spiritual guidance
                </p>
                <div className="flex flex-wrap gap-4 justify-center relative z-10">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/appointments"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      🕌 Book Appointment
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/50 hover:bg-white/30 transition-all duration-300"
                    >
                      ✨ View Services
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Article Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 md:p-16 border border-white/50 dark:border-gray-700/50 mb-8 min-h-[300px] relative overflow-hidden"
            >
              {/* Decorative quote mark */}
              <div className="absolute top-6 left-6 text-8xl text-primary-100 dark:text-primary-900/30 font-serif leading-none">"</div>
              
              <div className="prose prose-xl dark:prose-invert max-w-none relative z-10">
                {displayContent.split('\n\n').map((paragraph, index) => (
                  <motion.p 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                    className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-8 whitespace-pre-line first-letter:text-4xl first-letter:font-bold first-letter:text-primary-600 first-letter:mr-1"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {/* Detail Images Gallery */}
            {hasDetailImages && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="grid md:grid-cols-2 gap-6 mb-8"
              >
                {update.detailImage1 && (
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-4 overflow-hidden group cursor-pointer border border-white/50 dark:border-gray-700/50"
                    onClick={() => handleImageClick(update.detailImage1!)}
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                      <img 
                        src={update.detailImage1} 
                        alt={`${update.title} - Image 1`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                        <span className="text-white text-lg font-semibold flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <ZoomIn className="h-5 w-5" /> Click to view
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {update.detailImage2 && (
                  <motion.div 
                    whileHover={{ y: -8 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-4 overflow-hidden group cursor-pointer border border-white/50 dark:border-gray-700/50"
                    onClick={() => handleImageClick(update.detailImage2!)}
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                      <img 
                        src={update.detailImage2} 
                        alt={`${update.title} - Image 2`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                        <span className="text-white text-lg font-semibold flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <ZoomIn className="h-5 w-5" /> Click to view
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Bottom Navigation */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-700 dark:text-gray-300 font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to All Updates
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
