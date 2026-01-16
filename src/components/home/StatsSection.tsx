import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { Users, Star, BookOpen, Award, Youtube } from 'lucide-react'
import apiClient from '@/services/api'

interface StatProps {
  end: number
  suffix?: string
  prefix?: string
  decimal?: boolean
}

interface StatsData {
  studentsTrained: number
  averageRating: number
  coursesOffered: number
  subscribers: number
  yearsOfExperience: number
}

function AnimatedNumber({ end, suffix = '', prefix = '', decimal = false }: StatProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const duration = 2500 // 2.5 seconds for smoother animation
    const startTime = Date.now()
    
    // Easing function for smooth deceleration (ease-out-cubic)
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)
      const currentValue = easedProgress * end

      if (progress < 1) {
        setCount(currentValue)
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [hasAnimated, end])

  return (
    <motion.div 
      ref={ref} 
      className="text-2xl sm:text-4xl md:text-5xl font-bold text-gold-400"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={hasAnimated ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {prefix}
      {decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
      {suffix}
    </motion.div>
  )
}

export default function StatsSection() {
  const [statsData, setStatsData] = useState<StatsData>({
    studentsTrained: 4000,
    averageRating: 4.9,
    coursesOffered: 25,
    subscribers: 27.4,
    yearsOfExperience: 15,
  })
  const [loading, setLoading] = useState(true)

  // Fetch stats from API first
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/stats')
        const data = response.data.data || response.data
        setStatsData({
          studentsTrained: data.studentsTrained,
          averageRating: data.averageRating,
          coursesOffered: data.coursesOffered,
          subscribers: data.subscribers,
          yearsOfExperience: data.yearsOfExperience,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  // Fetch YouTube subscribers - overrides database value with live data
  useEffect(() => {
    const fetchYouTubeSubscribers = async () => {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
      const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID
      
      if (!apiKey || !channelId) {
        console.warn('YouTube API key or Channel ID not configured')
        return
      }

      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
        )
        const data = await response.json()
        
        if (data.items && data.items[0]?.statistics?.subscriberCount) {
          const subscriberCount = parseInt(data.items[0].statistics.subscriberCount)
          const subscribersInK = subscriberCount / 1000
          setStatsData(prev => ({
            ...prev,
            subscribers: parseFloat(subscribersInK.toFixed(1))
          }))
        }
      } catch (error) {
        console.error('Error fetching YouTube subscribers:', error)
      }
    }

    fetchYouTubeSubscribers()
  }, [])

  const stats = [
    {
      icon: Users,
      label: 'Students Trained',
      value: statsData.studentsTrained,
      suffix: '+',
      prefix: '',
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: statsData.averageRating,
      suffix: '',
      prefix: '',
      decimal: true,
    },
    {
      icon: BookOpen,
      label: 'Courses Offered',
      value: statsData.coursesOffered,
      suffix: '+',
      prefix: '',
    },
    {
      icon: Youtube,
      label: 'Subscribers',
      value: statsData.subscribers,
      suffix: 'K+',
      prefix: '',
      decimal: true,
    },
    {
      icon: Award,
      label: 'Years of Experience',
      value: statsData.yearsOfExperience,
      suffix: '+',
      prefix: '',
    },
  ]

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse text-white">Loading stats...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
      <div className="container mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Our Achievements
          </h2>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto px-2">
            Transforming lives through spiritual guidance and healing
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-primary-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:bg-primary-800/80 transition-all duration-300 border-2 border-primary-700 hover:border-gold-400 shadow-xl">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 mb-3 sm:mb-6 rounded-full bg-gold-400/20 text-gold-400"
                >
                  <stat.icon className="w-5 h-5 sm:w-8 sm:h-8" />
                </motion.div>

                {/* Animated Number */}
                <AnimatedNumber
                  end={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimal={stat.decimal}
                />

                {/* Label */}
                <p className="mt-2 sm:mt-4 text-gray-200 font-medium text-xs sm:text-lg">
                  {stat.label}
                </p>

                {/* Decorative element */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400/0 to-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative Bottom Border */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent rounded-full"
        />
      </div>
    </section>
  )
}
