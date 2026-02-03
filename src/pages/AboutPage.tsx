import { Helmet } from 'react-helmet-async'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api'

// Animated Counter Component
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * target))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isInView, target, duration])

  return <div ref={ref}>{count}+</div>
}

export default function AboutPage() {
  const [stats, setStats] = useState({
    yearsExperience: 15,
    peopleHelped: 5000
  })
  const [aboutData, setAboutData] = useState<{
    profileImage: string;
    introductionText: string;
    descriptionText: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats')
        const data = response.data.data
        setStats({
          yearsExperience: data.yearsOfExperience || 15,
          peopleHelped: data.studentsTrained || 5000
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
    
    // Load about settings from API (database)
    const fetchAboutSettings = async () => {
      try {
        const response = await api.get('/settings/about')
        if (response.data.success && response.data.data) {
          const data = response.data.data
          setAboutData({
            profileImage: data.profileImage || '/images/about-profile.jpg',
            introductionText: data.introductionText || 'Sahibzada Shariq Ahmed Tariqi is a dedicated spiritual healer and practitioner of traditional Islamic medicine. With deep knowledge in Roohaniyat (spirituality) and Hikmat (traditional Islamic medicine), he serves humanity through the prophetic traditions of healing.',
            descriptionText: data.descriptionText || 'Through years of dedicated study and practice, Sahibzada Shariq Ahmed Tariqi has mastered the art of spiritual healing and traditional Islamic medicine, helping countless individuals find peace, health, and spiritual enlightenment.'
          })
        } else {
          // Fallback to default values
          setAboutData({
            profileImage: '/images/about-profile.jpg',
            introductionText: 'Sahibzada Shariq Ahmed Tariqi is a dedicated spiritual healer and practitioner of traditional Islamic medicine. With deep knowledge in Roohaniyat (spirituality) and Hikmat (traditional Islamic medicine), he serves humanity through the prophetic traditions of healing.',
            descriptionText: 'Through years of dedicated study and practice, Sahibzada Shariq Ahmed Tariqi has mastered the art of spiritual healing and traditional Islamic medicine, helping countless individuals find peace, health, and spiritual enlightenment.'
          })
        }
      } catch (error) {
        console.error('Error fetching about settings:', error)
        // Fallback to default values on error
        setAboutData({
          profileImage: '/images/about-profile.jpg',
          introductionText: 'Sahibzada Shariq Ahmed Tariqi is a dedicated spiritual healer and practitioner of traditional Islamic medicine. With deep knowledge in Roohaniyat (spirituality) and Hikmat (traditional Islamic medicine), he serves humanity through the prophetic traditions of healing.',
          descriptionText: 'Through years of dedicated study and practice, Sahibzada Shariq Ahmed Tariqi has mastered the art of spiritual healing and traditional Islamic medicine, helping countless individuals find peace, health, and spiritual enlightenment.'
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchAboutSettings()
  }, [])

  // Show loading state until data is fetched
  if (isLoading || !aboutData) {
    return (
      <>
        <Helmet>
          <title>About Sahibzada Shariq Ahmed Tariqi</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>About Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      
      {/* Blinking Book Appointment Button - Top Right */}
      <Link to="/appointments" className="fixed top-20 sm:top-24 right-2 sm:right-4 z-50 animate-pulse">
        <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-110 flex items-center gap-1 sm:gap-2 border-2 border-white">
          <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-white"></span>
          </span>
          <span className="text-xs sm:text-sm md:text-base">Book Appointment</span>
        </button>
      </Link>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary-800 dark:text-white mb-8 sm:mb-12 text-center"
          >
            About <span className="text-gold-500">Sahibzada Shariq Ahmed Tariqi</span>
          </motion.h1>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start mb-12">
              {/* Profile Image */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative md:sticky md:top-24"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={aboutData.profileImage}
                    alt="Sahibzada Shariq Ahmed Tariqi"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold-400 opacity-20 rounded-full blur-2xl"></div>
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary-400 opacity-20 rounded-full blur-2xl"></div>
              </motion.div>

              {/* Introduction Text */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {aboutData.introductionText}
                  </p>
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {aboutData.descriptionText}
                  </p>
                </div>

                {/* Key Highlights */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(251,191,36,0.5)] transition-all duration-500 transform hover:-translate-y-3 hover:scale-110 overflow-hidden group border-2 border-yellow-300/30"
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                    
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 group-hover:scale-[2] transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full -ml-10 -mb-10 group-hover:scale-[2] transition-transform duration-700"></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="text-5xl md:text-6xl font-extrabold text-white mb-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
                        <AnimatedCounter target={stats.yearsExperience} />
                      </div>
                      <div className="text-base md:text-lg text-white font-bold uppercase tracking-wider drop-shadow-md">Years Experience</div>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 group-hover:translate-x-full"></div>
                    
                    {/* Border glow effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-200/30 to-orange-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(16,185,129,0.5)] transition-all duration-500 transform hover:-translate-y-3 hover:scale-110 overflow-hidden group border-2 border-emerald-300/30"
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                    
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 group-hover:scale-[2] transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full -ml-10 -mb-10 group-hover:scale-[2] transition-transform duration-700"></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="text-5xl md:text-6xl font-extrabold text-white mb-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
                        <AnimatedCounter target={stats.peopleHelped} />
                      </div>
                      <div className="text-base md:text-lg text-white font-bold uppercase tracking-wider drop-shadow-md">People Helped</div>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 group-hover:translate-x-full"></div>
                    
                    {/* Border glow effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-200/30 to-cyan-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Additional Content Sections */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6 mt-16"
            >
              {/* Expertise Card - Spiritual Healing */}
              <div className="bg-gradient-to-br from-white to-gold-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gold-200 dark:border-gold-800 backdrop-blur-sm overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="/images/spiritual-healing.jpg" 
                    alt="Spiritual Healing" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  {/* Bottom Icon Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-14 h-14 bg-gold-500/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-3xl">🌟</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-800 dark:text-white mb-3">Spiritual Healing</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Expert in spiritual healing through Quranic verses, prophetic traditions, and traditional Islamic practices.
                  </p>
                </div>
              </div>

              {/* Traditional Medicine Card */}
              <div className="bg-gradient-to-br from-white to-primary-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary-200 dark:border-primary-800 backdrop-blur-sm overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="/images/hikmat-medicine.jpg" 
                    alt="Hikmat Medicine" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  {/* Bottom Icon Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-14 h-14 bg-primary-500/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-3xl">🌿</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-800 dark:text-white mb-3">Hikmat Medicine</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Traditional Islamic medicine practitioner with extensive knowledge of natural remedies and healing methods.
                  </p>
                </div>
              </div>

              {/* Guidance Card */}
              <div className="bg-gradient-to-br from-white to-gold-50 dark:from-gray-800 dark:to-gray-800/80 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gold-200 dark:border-gold-800 backdrop-blur-sm overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="/images/spiritual-guidance.jpg" 
                    alt="Spiritual Guidance" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  {/* Bottom Icon Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-14 h-14 bg-gold-500/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-3xl">📖</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary-800 dark:text-white mb-3">Spiritual Guidance</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Provides comprehensive spiritual guidance rooted in Islamic teachings and Sufi traditions.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
