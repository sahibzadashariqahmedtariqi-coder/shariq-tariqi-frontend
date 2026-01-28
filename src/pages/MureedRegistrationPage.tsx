import { useState, useCallback, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Cropper from 'react-easy-crop'
import { 
  User, Users, Phone, MapPin, Calendar, Home, Upload, 
  CheckCircle, Sparkles, Heart, Star, ChevronDown, X, Crop
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'

// Animated Number Component
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

// Countries list with codes
const countries = [
  'Pakistan', 'India', 'Bangladesh', 'Saudi Arabia', 'UAE', 'Qatar', 
  'Kuwait', 'Bahrain', 'Oman', 'UK', 'USA', 'Canada', 'Australia',
  'Germany', 'France', 'Malaysia', 'Indonesia', 'Turkey', 'South Africa',
  'Kenya', 'Nigeria', 'Egypt', 'Morocco', 'Other'
]

// Country codes mapping
const countryCodes: { [key: string]: string } = {
  'Pakistan': '+92',
  'India': '+91',
  'Bangladesh': '+880',
  'Saudi Arabia': '+966',
  'UAE': '+971',
  'Qatar': '+974',
  'Kuwait': '+965',
  'Bahrain': '+973',
  'Oman': '+968',
  'UK': '+44',
  'USA': '+1',
  'Canada': '+1',
  'Australia': '+61',
  'Germany': '+49',
  'France': '+33',
  'Malaysia': '+60',
  'Indonesia': '+62',
  'Turkey': '+90',
  'South Africa': '+27',
  'Kenya': '+254',
  'Nigeria': '+234',
  'Egypt': '+20',
  'Morocco': '+212',
  'Other': '+',
}

// Cities by country
const citiesByCountry: { [key: string]: string[] } = {
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Hyderabad', 'Gujranwala', 'Bahawalpur', 'Other'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Lucknow', 'Other'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Other'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Other'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Other'],
  'UK': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Other'],
  'USA': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Other'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Other'],
  'Other': ['Other'],
}

// Helper function to create cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('No 2d context')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
    }, 'image/jpeg', 0.9)
  })
}

export default function MureedRegistrationPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    countryCode: '+92',
    contactNumber: '',
    country: 'Pakistan',
    city: '',
    dateOfBirth: '',
    address: '',
    email: '',
  })
  
  // Image cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [showCropper, setShowCropper] = useState(false)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [checkingContact, setCheckingContact] = useState(false)

  // Check if contact already exists when user leaves the contact field
  const checkExistingMureed = async (contact: string) => {
    if (!contact || contact.length < 10) return
    
    try {
      setCheckingContact(true)
      const response = await apiClient.get(`/mureeds/check-contact/${contact}`)
      
      if (response.data.exists) {
        toast.success(`You are already registered! Redirecting to your card...`)
        setTimeout(() => {
          navigate(`/mureed/card/${response.data.mureedId}`)
        }, 1500)
      }
    } catch (error) {
      // Contact not found, user can continue registration
      console.log('Contact not found, new registration allowed')
    } finally {
      setCheckingContact(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Reset city and update country code when country changes
    if (name === 'country') {
      setFormData(prev => ({ 
        ...prev, 
        city: '',
        countryCode: countryCodes[value] || '+'
      }))
    }
  }

  const handleContactBlur = () => {
    if (formData.contactNumber) {
      checkExistingMureed(formData.contactNumber)
    }
  }

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string)
        setShowCropper(true)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const croppedUrl = URL.createObjectURL(croppedBlob)
      setCroppedImage(croppedUrl)
      setShowCropper(false)
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to crop image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName || !formData.fatherName || !formData.contactNumber || 
        !formData.country || !formData.city || !formData.dateOfBirth || !formData.address) {
      toast.error('Please fill all required fields')
      return
    }
    
    if (!croppedImage) {
      toast.error('Please upload and crop your profile picture')
      return
    }
    
    try {
      setLoading(true)
      
      // First upload the image to separate Mureed Cloudinary
      const blob = await fetch(croppedImage).then(r => r.blob())
      const imageFormData = new FormData()
      imageFormData.append('image', blob, 'profile.jpg')
      
      const uploadResponse = await apiClient.post('/upload/mureed-image', imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const profilePictureUrl = uploadResponse.data.data.url
      
      // Register the mureed
      const response = await apiClient.post('/mureeds/register', {
        ...formData,
        contactNumber: formData.countryCode + formData.contactNumber,
        profilePicture: profilePictureUrl,
      })
      
      if (response.data.success) {
        toast.success('Registration successful!')
        // Navigate to the card page
        navigate(`/mureed/card/${response.data.data.mureedId}`)
      }
    } catch (error: any) {
      console.error('Error:', error)
      if (error.response?.data?.existingMureedId) {
        toast.error(`You are already registered. Your Mureed ID is: ${error.response.data.existingMureedId}`)
        navigate(`/mureed/card/${error.response.data.existingMureedId}`)
      } else {
        toast.error(error.response?.data?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const availableCities = formData.country ? (citiesByCountry[formData.country] || citiesByCountry['Other']) : []

  return (
    <>
      <Helmet>
        <title>Mureed Registration | Sahibzada Shariq Ahmed Tariqi</title>
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
              <span className="text-xs sm:text-sm font-medium">Join Our Spiritual Family</span>
            </motion.div>

            {/* Arabic Text */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl md:text-4xl font-arabic text-gold-400 mb-3 sm:mb-4"
            >
              بیعت کریں
            </motion.h2>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-4">
              Enroll as a Devoted <span className="text-gold-400">Mureed</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gold-300 font-serif mb-3 sm:mb-4">
              of Sahibzada Shariq Ahmed Tariqi
            </p>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-2">
              Join our spiritual family and receive blessings, guidance, and a unique Mureed ID card
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
                  <AnimatedCounter end={5000} suffix="+" />
                </div>
                <p className="text-gray-300 text-sm mt-1">Registered Mureeds</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Heart className="h-5 w-5 fill-current" />
                  <AnimatedCounter end={50} suffix="+" />
                </div>
                <p className="text-gray-300 text-sm mt-1">Countries</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gold-400">
                  <Star className="h-5 w-5 fill-current" />
                  <AnimatedCounter end={100} suffix="%" />
                </div>
                <p className="text-gray-300 text-sm mt-1">Blessed Family</p>
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

      {/* Registration Form Section */}
      <section className="relative py-10 sm:py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Section Background Image */}
        <div 
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/du7qzhimu/image/upload/v1769593982/shariq-website/products/kot50flxk9xv0gg35fvr.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="relative container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                <h2 className="text-2xl font-bold text-white">Mureed Registration Form</h2>
                <p className="text-primary-100">Fill in your details to receive your Mureed Card</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="h-4 w-4" />
                      Father's Name *
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="Enter father's name"
                      required
                    />
                  </div>
                </div>

                {/* Contact & Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="h-4 w-4" />
                      Contact Number *
                      {checkingContact && <span className="text-xs text-gold-500 ml-2">Checking...</span>}
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="w-24 px-2 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all text-sm"
                      >
                        {Object.entries(countryCodes).map(([country, code]) => (
                          <option key={country} value={code}>{code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        onBlur={handleContactBlur}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                        placeholder="3001234567"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="h-4 w-4" />
                      Country *
                    </label>
                    <div className="relative">
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all appearance-none"
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* City & DOB */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Home className="h-4 w-4" />
                      City *
                    </label>
                    <div className="relative">
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all appearance-none"
                        required
                        disabled={!formData.country}
                      >
                        <option value="">Select City</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="h-4 w-4" />
                    Full Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                    placeholder="Enter your complete address"
                    required
                  />
                </div>

                {/* Profile Picture Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Upload className="h-4 w-4" />
                    Profile Picture *
                  </label>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {croppedImage ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={croppedImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                      />
                      <div className="space-y-2">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ Image selected and cropped
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm"
                        >
                          Change Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload your photo</p>
                      <p className="text-xs text-gray-500">You will be able to crop and adjust</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Submit & Generate Mureed Card
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && imageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Crop className="h-5 w-5" />
                  Crop Your Photo
                </h3>
                <button
                  onClick={() => setShowCropper(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative h-96 bg-gray-900">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCropper(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCropSave}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Select Photo
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
