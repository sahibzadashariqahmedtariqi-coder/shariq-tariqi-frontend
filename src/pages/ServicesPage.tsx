import { Helmet } from 'react-helmet-async'
import { Heart, BookOpen, Stethoscope, MessageCircle, Star, Users, Clock, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect, useMemo, useRef } from 'react'

// Animated Number Component for counting animation
interface AnimatedCounterProps {
  end: number
  suffix?: string
  decimal?: boolean
}

function AnimatedCounter({ end, suffix = '', decimal = false }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

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

    const duration = 2000
    const startTime = Date.now()
    
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
    <span ref={ref} className="text-xl sm:text-3xl font-bold">
      {decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}
    </span>
  )
}

// Default services data
const defaultServices = [
  {
    id: 'istikhara',
    icon: 'heart',
    title: 'Istikhara Services',
    description: 'Seeking divine guidance for important life decisions through authentic Islamic prayer',
    features: ['Marriage guidance', 'Business decisions', 'Travel consultation', 'Life path direction'],
    price: 'FREE',
    isFree: true,
    whatsappMessage: 'Assalam o Alaikum, I want to request Istikhara service for guidance.',
    gradient: 'from-emerald-500 to-teal-600',
    stats: { served: '5000+', rating: '4.9' },
  },
  {
    id: 'hikmat',
    icon: 'stethoscope',
    title: 'Traditional Hikmat',
    description: 'Prophetic medicine and natural healing treatments based on ancient wisdom',
    features: ['Herbal remedies', 'Natural cures', 'Holistic healing'],
    price: 'PKR 2,000',
    priceLabel: '/consultation',
    videoCallPrice: 'PKR 3,000',
    priceINR: '₹700',
    videoCallPriceINR: '₹1,000',
    isFree: false,
    appointmentService: 'Hikmat Consultation',
    gradient: 'from-amber-500 to-orange-600',
    stats: { served: '3500+', rating: '4.8' },
  },
  {
    id: 'consultation',
    icon: 'book',
    title: 'Spiritual Consultation',
    description: 'One-on-one spiritual guidance and mentorship for personal transformation',
    features: ['Life coaching', 'Spiritual development', 'Problem solving', 'Personal growth'],
    price: 'PKR 2,000',
    priceLabel: '/consultation',
    videoCallPrice: 'PKR 3,000',
    priceINR: '₹700',
    videoCallPriceINR: '₹1,000',
    isFree: false,
    appointmentService: 'Spiritual Consultation',
    gradient: 'from-primary-500 to-primary-700',
    stats: { served: '4200+', rating: '4.9' },
  },
]

// Icon mapping (supports both lowercase from admin and PascalCase)
const iconMap: { [key: string]: React.ReactNode } = {
  heart: <Heart className="h-10 w-10" />,
  Heart: <Heart className="h-10 w-10" />,
  book: <BookOpen className="h-10 w-10" />,
  BookOpen: <BookOpen className="h-10 w-10" />,
  stethoscope: <Stethoscope className="h-10 w-10" />,
  Stethoscope: <Stethoscope className="h-10 w-10" />,
}

// Gradient to background/icon background mapping
const gradientStyles: { [key: string]: { bgGradient: string, iconBg: string, colorClass: string } } = {
  'from-emerald-500 to-teal-600': {
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    colorClass: 'text-emerald-600 dark:text-emerald-400'
  },
  'from-amber-500 to-orange-600': {
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    colorClass: 'text-amber-600 dark:text-amber-400'
  },
  'from-primary-500 to-primary-700': {
    bgGradient: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
    iconBg: 'bg-primary-100 dark:bg-primary-900/50',
    colorClass: 'text-primary-600 dark:text-primary-400'
  },
  'from-purple-500 to-indigo-600': {
    bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    colorClass: 'text-purple-600 dark:text-purple-400'
  },
  'from-rose-500 to-pink-600': {
    bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    colorClass: 'text-rose-600 dark:text-rose-400'
  },
  'from-blue-500 to-cyan-600': {
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    colorClass: 'text-blue-600 dark:text-blue-400'
  },
}

export default function ServicesPage() {
  const navigate = useNavigate()
  const [servicesData, setServicesData] = useState(defaultServices)

  // Load services from localStorage (synced with AdminServicesPage)
  useEffect(() => {
    const loadServices = () => {
      const saved = localStorage.getItem('adminServices')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Merge with defaults to ensure all fields exist and filter out inactive services
          const mergedServices = parsed
            .filter((s: any) => s.isActive !== false)
            .map((service: any) => {
              const defaultService = defaultServices.find(d => d.id === service.id)
              return {
                ...defaultService,
                ...service,
                // Handle iconName vs icon field compatibility
                icon: service.icon || service.iconName || 'heart',
              }
            })
          setServicesData(mergedServices.length > 0 ? mergedServices : defaultServices)
        } catch {
          setServicesData(defaultServices)
        }
      } else {
        setServicesData(defaultServices)
      }
    }

    loadServices()

    // Listen for storage changes (for live updates if admin is in another tab)
    window.addEventListener('storage', loadServices)
    return () => window.removeEventListener('storage', loadServices)
  }, [])

  // Convert servicesData to include React icons and gradient styles
  const services = useMemo(() => {
    return servicesData.map(service => {
      const gradientStyle = gradientStyles[service.gradient] || gradientStyles['from-primary-500 to-primary-700']
      return {
        ...service,
        iconElement: iconMap[service.icon] || <Heart className="h-10 w-10" />,
        bgGradient: gradientStyle.bgGradient,
        iconBg: gradientStyle.iconBg,
        colorClass: gradientStyle.colorClass,
      }
    })
  }, [servicesData])

  const handleBookNow = (service: typeof services[0]) => {
    if (service.isFree) {
      const whatsappNumber = '923001234567'
      const message = encodeURIComponent(service.whatsappMessage || '')
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
    } else {
      navigate(`/appointments?service=${encodeURIComponent(service.appointmentService || service.title)}`)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <>
      <Helmet>
        <title>Our Services | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-gold-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">Trusted by Thousands</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Our <span className="text-gold-400">Services</span>
            </h1>
            <p className="text-sm sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
              Discover comprehensive spiritual healing and traditional Islamic medicine services 
              guided by authentic knowledge and years of experience
            </p>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-12"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Users className="h-5 w-5" />
                  <AnimatedCounter end={12000} suffix="+" />
                </div>
                <p className="text-gray-400 text-sm mt-1">Happy Clients</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Star className="h-5 w-5 fill-current" />
                  <AnimatedCounter end={4.9} decimal />
                </div>
                <p className="text-gray-400 text-sm mt-1">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Clock className="h-5 w-5" />
                  <AnimatedCounter end={15} suffix="+" />
                </div>
                <p className="text-gray-400 text-sm mt-1">Years Experience</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-10 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {services.map((service, _index) => (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`relative bg-gradient-to-br ${service.bgGradient} rounded-3xl shadow-xl overflow-hidden group`}
              >
                {/* Free Badge */}
                {service.isFree && (
                  <motion.div 
                    initial={{ x: 100 }}
                    animate={{ x: 0 }}
                    className="absolute top-4 right-4 z-10"
                  >
                    <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      FREE
                    </span>
                  </motion.div>
                )}

                {/* Card Content */}
                <div className="p-8">
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-20 h-20 ${service.iconBg} rounded-2xl flex items-center justify-center mb-6 ${service.colorClass} shadow-lg`}
                  >
                    {service.iconElement}
                  </motion.div>

                  {/* Title & Description */}
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className={`w-6 h-6 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center mr-3 flex-shrink-0`}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{service.stats.served} served</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{service.stats.rating} rating</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  {!service.isFree && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/30 dark:to-emerald-900/30 rounded-xl border border-primary-100 dark:border-primary-800">
                      {/* In-Person Consultation */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                          In-Person Consultation
                        </p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-primary-700 dark:text-gold-400">
                            {service.price}
                          </span>
                          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {service.priceINR}
                          </span>
                        </div>
                      </div>
                      
                      {/* Video Call */}
                      <div className="pt-3 border-t border-primary-200 dark:border-primary-700">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          Video Call Consultation
                        </p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                            {service.videoCallPrice}
                          </span>
                          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {service.videoCallPriceINR}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Free Service Price */}
                  {service.isFree && (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {service.price}
                      </span>
                    </div>
                  )}

                  {/* Button */}
                  <div className="flex justify-end">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={() => handleBookNow(service)}
                        className={`${service.isFree 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700' 
                          : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
                        } text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 gap-2`}
                      >
                        {service.isFree && <MessageCircle className="h-4 w-4" />}
                        {service.isFree ? 'WhatsApp' : 'Book Now'}
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative gradient line at bottom */}
                <div className={`h-1.5 bg-gradient-to-r ${service.gradient}`}></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Services?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience authentic spiritual guidance backed by years of expertise and thousands of satisfied clients
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="h-8 w-8" />, title: 'Authentic Methods', desc: 'Based on Quran, Hadith, and traditional Islamic practices' },
              { icon: <Clock className="h-8 w-8" />, title: 'Quick Response', desc: 'Get responses within 24-48 hours for all inquiries' },
              { icon: <Star className="h-8 w-8" />, title: 'Proven Results', desc: 'Thousands of successful cases with positive outcomes' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-gold-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
