import { motion } from 'framer-motion'
import { Bell, Calendar, ArrowRight, Megaphone, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

interface Update {
  id: number
  title: string
  description: string
  date: string
  type: 'announcement' | 'event' | 'news'
  link?: string
  promoImage?: string
}

const updates: Update[] = [
  {
    id: 2,
    title: "Ruhani Punjab Tour",
    description: "Join us on an enlightening spiritual journey across Punjab. Experience divine blessings, spiritual healing sessions, and traditional Islamic teachings in multiple cities. A transformative tour to strengthen your connection with Allah.",
    date: "2025-11-20",
    type: "announcement",
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
  }
}

export default function LatestUpdates() {
  const [showFullImage, setShowFullImage] = useState(false)
  const [fullImageSrc, setFullImageSrc] = useState('')

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

        {/* Blinking Promotional Image - Right Side */}
        {updates[0]?.promoImage && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block absolute right-8 top-32 z-10"
          >
            <div className="relative animate-pulse">
              <img
                src={updates[0].promoImage}
                alt="Promotional Banner"
                className="w-56 h-auto rounded-xl shadow-2xl border-4 border-gold-400 hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleImageClick(updates[0].promoImage!)}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/400x600/8B0000/FFD700?text=Ruhani+Tour+Promo'
                }}
              />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">
                New!
              </div>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 px-8 py-4 rounded-2xl shadow-2xl border-4 border-gold-400 animate-pulse">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Bell className="h-8 w-8 text-gold-300 animate-bounce" />
              Latest Updates
              <Bell className="h-8 w-8 text-gold-300 animate-bounce" />
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mt-6 text-lg font-medium">
            Stay informed about our latest announcements, upcoming events, and spiritual programs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-6 max-w-3xl mx-auto lg:mr-80">
          {updates.map((update, index) => {
            const config = typeConfig[update.type]
            const Icon = config.icon

            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`${config.bg} ${config.border} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group`}>
                  <div className="flex items-start gap-6">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src="/images/ruhani-tour.jpg" 
                        alt="Ruhani Punjab Tour"
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/200x200/1B4332/D4AF37?text=Ruhani+Tour'
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`${config.color} p-3 rounded-lg ${config.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                              {update.type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(update.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {update.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {update.description}
                          </p>
                          
                          {update.link && (
                            <Link 
                              to={update.link}
                              className={`inline-flex items-center gap-2 text-sm font-semibold ${config.color} hover:gap-3 transition-all duration-300`}
                            >
                              Learn More
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* View All Updates Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            View All Updates
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
