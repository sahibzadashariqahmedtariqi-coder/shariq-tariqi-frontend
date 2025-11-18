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

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = end / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [hasAnimated, end])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-gold-400">
      {prefix}
      {decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
      {suffix}
    </div>
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

  // Fetch stats from API
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
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
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
    <section className="py-16 bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Achievements
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Transforming lives through spiritual guidance and healing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-primary-800/60 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-primary-800/80 transition-all duration-300 border-2 border-primary-700 hover:border-gold-400 shadow-xl">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gold-400/20 text-gold-400"
                >
                  <stat.icon className="w-8 h-8" />
                </motion.div>

                {/* Animated Number */}
                <AnimatedNumber
                  end={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimal={stat.decimal}
                />

                {/* Label */}
                <p className="mt-4 text-gray-200 font-medium text-lg">
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
