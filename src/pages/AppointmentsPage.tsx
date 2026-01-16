import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, DollarSign, Loader2 } from 'lucide-react'
import CheckoutModal from '@/components/checkout/CheckoutModal'
import apiClient from '@/lib/apiClient'

// Settings are now fetched from backend API - v2
interface AppointmentSettings {
  consultationFee: number
  healingFee: number
  hikmatFee: number
  ruqyahFee: number
  taveezFee: number
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
    message: '',
  })
  const [isSubmitted, _setIsSubmitted] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [settings, setSettings] = useState<AppointmentSettings>({
    consultationFee: 2000,
    healingFee: 3000,
    hikmatFee: 2500,
    ruqyahFee: 3500,
    taveezFee: 1500,
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
    { name: 'Spiritual Consultation', fee: settings.consultationFee },
    { name: 'Traditional Healing', fee: settings.healingFee },
    { name: 'Hikmat Consultation', fee: settings.hikmatFee },
    { name: 'Ruqyah Session', fee: settings.ruqyahFee },
    { name: 'Taveez & Amulets', fee: settings.taveezFee },
    { name: 'Other', fee: 0 },
  ]

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
      <section className="relative py-12 sm:py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Book Your Appointment
            </h1>
            <p className="text-sm sm:text-xl text-gray-200 max-w-2xl mx-auto px-2">
              Schedule a personalized consultation for spiritual healing, guidance, and traditional remedies
            </p>
          </motion.div>
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
                <ul className="space-y-3">
                  {services.filter(s => s.fee > 0).map((service) => (
                    <li key={service.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        {service.name}
                      </span>
                      <span className="font-bold text-primary-600 dark:text-gold-400">
                        PKR {service.fee}
                      </span>
                    </li>
                  ))}
                </ul>
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
