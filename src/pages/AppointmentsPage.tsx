import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, DollarSign, Sparkles, Heart, Star, Users, Video, MapPin } from 'lucide-react'
import CheckoutModal from '@/components/checkout/CheckoutModal'
import apiClient from '@/services/api'

// Animated Number Component
interface AnimatedCounterProps {
  end: number
  suffix?: string
}

function AnimatedCounter({ end, suffix = '' }: AnimatedCounterProps) {
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
      {Math.floor(count).toLocaleString()}{suffix}
    </span>
  )
}

// Settings are now fetched from backend API - v2
interface AppointmentSettings {
  consultationFee: number
  healingFee: number
  hikmatFee: number
  ruqyahFee: number
  taveezFee: number
  // Video Call Fees (PKR)
  consultationFeeVideoCall: number
  healingFeeVideoCall: number
  hikmatFeeVideoCall: number
  ruqyahFeeVideoCall: number
  taveezFeeVideoCall: number
  // INR Fees
  consultationFeeINR: number
  healingFeeINR: number
  hikmatFeeINR: number
  ruqyahFeeINR: number
  taveezFeeINR: number
  // Video Call INR
  consultationFeeVideoCallINR: number
  healingFeeVideoCallINR: number
  hikmatFeeVideoCallINR: number
  ruqyahFeeVideoCallINR: number
  taveezFeeVideoCallINR: number
  workingHoursStart: string
  workingHoursEnd: string
  workingDays: string[]
  appointmentDuration: number
  advanceBookingDays: number
  instructions: string
  phone: string
  email: string
}

export default function AppointmentsPage() {
  const [searchParams] = useSearchParams()
  const preSelectedService = searchParams.get('service') || 'Spiritual Consultation'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: preSelectedService,
    consultationType: 'in-person', // 'in-person' or 'video-call'
    message: '',
  })
  const [isSubmitted, _setIsSubmitted] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [_loadingSettings, setLoadingSettings] = useState(true)
  const [settings, setSettings] = useState<AppointmentSettings>({
    consultationFee: 2000,
    healingFee: 2000,
    hikmatFee: 2000,
    ruqyahFee: 2000,
    taveezFee: 2000,
    // Video Call PKR
    consultationFeeVideoCall: 3000,
    healingFeeVideoCall: 3000,
    hikmatFeeVideoCall: 3000,
    ruqyahFeeVideoCall: 3000,
    taveezFeeVideoCall: 3000,
    // INR In-Person
    consultationFeeINR: 700,
    healingFeeINR: 700,
    hikmatFeeINR: 700,
    ruqyahFeeINR: 700,
    taveezFeeINR: 700,
    // Video Call INR
    consultationFeeVideoCallINR: 1000,
    healingFeeVideoCallINR: 1000,
    hikmatFeeVideoCallINR: 1000,
    ruqyahFeeVideoCallINR: 1000,
    taveezFeeVideoCallINR: 1000,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    appointmentDuration: 60,
    advanceBookingDays: 1,
    instructions: 'Please arrive 10 minutes before your scheduled appointment. Bring any relevant medical documents or previous prescriptions.',
    phone: '+92 318 2392985',
    email: 'sahibzadashariqahmedtariqi@gmail.com',
  })

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        const response = await apiClient.get('/settings/appointments')
        if (response.data.success && response.data.data) {
          setSettings({ ...settings, ...response.data.data })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoadingSettings(false)
      }
    }
    loadSettings()
  }, [])

  const services = [
    { 
      name: 'Spiritual Consultation', 
      fee: settings.consultationFee, 
      videoFee: settings.consultationFeeVideoCall,
      feeINR: settings.consultationFeeINR,
      videoFeeINR: settings.consultationFeeVideoCallINR 
    },
    { 
      name: 'Traditional Healing', 
      fee: settings.healingFee, 
      videoFee: settings.healingFeeVideoCall,
      feeINR: settings.healingFeeINR,
      videoFeeINR: settings.healingFeeVideoCallINR 
    },
    { 
      name: 'Hikmat Consultation', 
      fee: settings.hikmatFee, 
      videoFee: settings.hikmatFeeVideoCall,
      feeINR: settings.hikmatFeeINR,
      videoFeeINR: settings.hikmatFeeVideoCallINR 
    },
    { 
      name: 'Ruqyah Session', 
      fee: settings.ruqyahFee, 
      videoFee: settings.ruqyahFeeVideoCall,
      feeINR: settings.ruqyahFeeINR,
      videoFeeINR: settings.ruqyahFeeVideoCallINR 
    },
    { 
      name: 'Taveez & Amulets', 
      fee: settings.taveezFee, 
      videoFee: settings.taveezFeeVideoCall,
      feeINR: settings.taveezFeeINR,
      videoFeeINR: settings.taveezFeeVideoCallINR 
    },
    { name: 'Other', fee: 0, videoFee: 0, feeINR: 0, videoFeeINR: 0 },
  ]

  // Get current service fee based on consultation type
  const getCurrentFee = () => {
    const selectedService = services.find(s => s.name === formData.service)
    if (!selectedService) return 0
    return formData.consultationType === 'video-call' ? selectedService.videoFee : selectedService.fee
  }

  const getCurrentFeeINR = () => {
    const selectedService = services.find(s => s.name === formData.service)
    if (!selectedService) return 0
    return formData.consultationType === 'video-call' ? selectedService.videoFeeINR : selectedService.feeINR
  }

  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.service) {
      return
    }
    
    // Open checkout modal
    setShowCheckout(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      <Helmet>
        <title>Book Appointment | Sahibzada Shariq Ahmed Tariqi</title>
        <meta
          name="description"
          content="Book an appointment for spiritual consultation, healing, and guidance"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[url('/images/islamic-pattern.png')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl"></div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 right-20 w-16 h-16 bg-gold-500/20 rounded-full hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-24 h-24 bg-primary-400/20 rounded-full hidden lg:block"
        />

        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">Schedule Your Visit</span>
            </motion.div>

            {/* Urdu Text */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl md:text-4xl font-arabic text-gold-400 mb-3 sm:mb-4"
            >
              ملاقات کا وقت مقرر کریں
            </motion.h2>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-4">
              Book Your <span className="text-gold-400">Appointment</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gold-300 font-serif mb-3 sm:mb-4">
              with Sahibzada Shariq Ahmed Tariqi
            </p>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-2">
              Schedule a personalized consultation for spiritual healing, guidance, and traditional remedies
            </p>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-6 sm:mt-10 mb-8 sm:mb-16"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Users className="h-5 w-5" />
                  <AnimatedCounter end={10000} suffix="+" />
                </div>
                <p className="text-gray-300 text-sm mt-1">Consultations Done</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Heart className="h-5 w-5 fill-current" />
                  <AnimatedCounter end={98} suffix="%" />
                </div>
                <p className="text-gray-300 text-sm mt-1">Satisfaction Rate</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Star className="h-5 w-5 fill-current" />
                  <AnimatedCounter end={15} suffix="+" />
                </div>
                <p className="text-gray-300 text-sm mt-1">Years Experience</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-gray-50 dark:text-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Pre-selected Service Banner */}
          {searchParams.get('service') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-4 mb-8 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Selected Service: {preSelectedService}</p>
                  <p className="text-sm text-primary-100">Please fill in your details to complete the booking</p>
                </div>
              </div>
            </motion.div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Appointment Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold mb-6 text-primary-800 dark:text-white">
                  Appointment Details
                </h2>

                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="bg-green-100 dark:bg-green-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-300 mb-2">
                      Appointment Requested!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We have received your appointment request. You will receive a confirmation email shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                        <User className="inline h-4 w-4 mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                          <Mail className="inline h-4 w-4 mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                          <Phone className="inline h-4 w-4 mr-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                          placeholder="+92 300 1234567"
                        />
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                          <Calendar className="inline h-4 w-4 mr-2" />
                          Preferred Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                          <Clock className="inline h-4 w-4 mr-2" />
                          Preferred Time *
                        </label>
                        <select
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                        <DollarSign className="inline h-4 w-4 mr-2" />
                        Service Type *
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                      >
                        {services.map((service) => (
                          <option key={service.name} value={service.name}>
                            {service.name} {service.fee > 0 ? `- PKR ${service.fee}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Consultation Type - In-Person or Video Call */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                        <Video className="inline h-4 w-4 mr-2" />
                        Consultation Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, consultationType: 'in-person' })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.consultationType === 'in-person'
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                          }`}
                        >
                          <MapPin className={`h-6 w-6 mx-auto mb-2 ${formData.consultationType === 'in-person' ? 'text-primary-600' : 'text-gray-400'}`} />
                          <p className={`font-semibold ${formData.consultationType === 'in-person' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>In-Person</p>
                          <p className="text-xs text-gray-500 mt-1">Visit our location</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, consultationType: 'video-call' })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.consultationType === 'video-call'
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                              : 'border-gray-300 dark:border-gray-600 hover:border-amber-300'
                          }`}
                        >
                          <Video className={`h-6 w-6 mx-auto mb-2 ${formData.consultationType === 'video-call' ? 'text-amber-600' : 'text-gray-400'}`} />
                          <p className={`font-semibold ${formData.consultationType === 'video-call' ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'}`}>Video Call</p>
                          <p className="text-xs text-gray-500 mt-1">Online consultation</p>
                        </button>
                      </div>
                      {/* Price Display */}
                      <div className="mt-3 p-3 bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/30 dark:to-emerald-900/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formData.consultationType === 'video-call' ? 'Video Call Fee:' : 'In-Person Fee:'}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary-700 dark:text-gold-400">
                              PKR {getCurrentFee().toLocaleString()}
                            </span>
                            {getCurrentFeeINR() > 0 && (
                              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                / ₹{getCurrentFeeINR().toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                        <MessageSquare className="inline h-4 w-4 mr-2" />
                        Additional Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="Tell us about your concerns or questions..."
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg font-semibold"
                    >
                      Book Appointment
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-primary-800 dark:text-white">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary-600 mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{settings.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary-600 mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{settings.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary-600 mt-1" />
                    <div>
                      <p className="font-medium">Working Hours</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {settings.workingDays.slice(0, 3).join(', ')}: {settings.workingHoursStart} - {settings.workingHoursEnd}
                      </p>
                      {settings.workingDays.length > 3 && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          +{settings.workingDays.length - 3} more days
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services & Charges */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-primary-800 dark:text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Services & Charges
                </h3>
                
                {/* In-Person Charges */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> In-Person
                  </p>
                  <ul className="space-y-2">
                    {services.filter(s => s.fee > 0).map((service) => (
                      <li key={service.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          {service.name}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-primary-600 dark:text-gold-400">
                            PKR {service.fee}
                          </span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            / ₹{service.feeINR}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Video Call Charges */}
                <div className="pt-4 border-t border-primary-200 dark:border-primary-700">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1">
                    <Video className="h-3 w-3" /> Video Call
                  </p>
                  <ul className="space-y-2">
                    {services.filter(s => s.videoFee > 0).map((service) => (
                      <li key={service.name + '-video'} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          {service.name}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            PKR {service.videoFee}
                          </span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            / ₹{service.videoFeeINR}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-gold-50 dark:bg-gold-900/20 rounded-xl shadow-lg p-6 border-l-4 border-gold-500">
                <h3 className="text-lg font-bold mb-2 text-gold-700 dark:text-gold-300">
                  Important Note
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {settings.instructions}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Please book your appointment at least {settings.advanceBookingDays} day(s) in advance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        orderType="appointment"
        itemId="appointment"
        itemTitle={formData.service}
        itemPrice={services.find(s => s.name === formData.service)?.fee || 0}
        appointmentDate={formData.date}
        appointmentTime={formData.time}
        customerMessage={`Service: ${formData.service}\n${formData.message ? `Message: ${formData.message}` : ''}`}
      />
    </>
  )
}
