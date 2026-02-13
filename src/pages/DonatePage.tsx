import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Heart, Gift, HandHeart, Upload, CheckCircle2, Clock, 
  Download, Sparkles, Star, Users, BookOpen,
  Home, Utensils, GraduationCap, Building2, Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

interface BankDetails {
  bankName: string
  accountTitle: string
  accountNumber: string
  ibanNumber: string
  bankBranch: string
  paymentInstructions: string
}

interface DonationPageData {
  _id: string
  title: string
  slug: string
  shortDescription: string
  coverImage: string
  isPublished: boolean
}

// Animated Number Component (matching Mureed page)
interface AnimatedCounterProps {
  end: number
  suffix?: string
}

function AnimatedCounter({ end, suffix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.1 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current)
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
    <span ref={counterRef} className="text-3xl font-bold">
      {Math.floor(count).toLocaleString()}{suffix}
    </span>
  )
}

// Floating hearts animation component
const FloatingHearts = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: '100%', 
            opacity: 0.3,
            scale: 0.5 + Math.random() * 0.5
          }}
          animate={{ 
            y: '-20%',
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeInOut'
          }}
        >
          <Heart className={`w-6 h-6 ${i % 2 === 0 ? 'text-pink-400' : 'text-gold-400'} fill-current opacity-40`} />
        </motion.div>
      ))}
    </div>
  )
}

const donationPurposes = [
  { id: 'general', label: 'General Donation', icon: Heart, color: 'from-pink-500 to-rose-500', description: 'Support our mission and activities' },
  { id: 'madrasa', label: 'Madrasa Support', icon: BookOpen, color: 'from-blue-500 to-indigo-500', description: 'Education and Islamic learning' },
  { id: 'orphans', label: 'Orphan Care', icon: Users, color: 'from-purple-500 to-violet-500', description: 'Support orphan children' },
  { id: 'poor', label: 'Help the Poor', icon: Utensils, color: 'from-orange-500 to-amber-500', description: 'Provide food and essentials' },
  { id: 'mosque', label: 'Mosque Development', icon: Building2, color: 'from-emerald-500 to-teal-500', description: 'Build and maintain mosques' },
  { id: 'education', label: 'Education Fund', icon: GraduationCap, color: 'from-cyan-500 to-sky-500', description: 'Scholarships and learning materials' },
]

// Fallback donation images (used only when API fails)
const fallbackDonationImages = [
  {
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop',
    title: 'Helping Communities',
    description: 'Supporting families in need',
    slug: 'helping-communities'
  },
  {
    url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=300&fit=crop',
    title: 'Education for All',
    description: 'Providing quality education',
    slug: 'education-for-all'
  },
  {
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop',
    title: 'Food Distribution',
    description: 'Feeding the hungry',
    slug: 'food-distribution'
  },
  {
    url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop',
    title: 'Building Hope',
    description: 'Creating better futures',
    slug: 'building-hope'
  },
]

// Purpose labels for display
const purposeLabels: { [key: string]: string } = {
  general: 'General Donation',
  madrasa: 'Madrasa Support',
  orphans: 'Orphan Care',
  poor: 'Help the Poor',
  mosque: 'Mosque Development',
  education: 'Education Fund',
}

const suggestedAmounts = {
  PKR: [1000, 2500, 5000, 10000, 25000, 50000],
  INR: [500, 1000, 2500, 5000, 10000, 25000],
}

export default function DonatePage() {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [donationId, setDonationId] = useState<string | null>(null)
  const [donationNumber, setDonationNumber] = useState<string>('')
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  // Form data
  const [currency, setCurrency] = useState<'PKR' | 'INR'>('PKR')
  const [amount, setAmount] = useState<number>(5000)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [purpose, setPurpose] = useState<string>('general')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+92')
  const [donorMessage, setDonorMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  // Payment proof
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [senderAccount, setSenderAccount] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)

  // Donation pages from API (for gallery images)
  const [donationPages, setDonationPages] = useState<DonationPageData[]>([])

  const donationImages = donationPages.length > 0
    ? donationPages.map(p => ({
        url: p.coverImage,
        title: p.title,
        description: p.shortDescription,
        slug: p.slug
      }))
    : fallbackDonationImages

  useEffect(() => {
    fetchBankDetails()
    fetchDonationPages()
  }, [])

  useEffect(() => {
    // Update country code based on currency
    if (currency === 'INR') {
      setCountryCode('+91')
    } else {
      setCountryCode('+92')
    }
  }, [currency])

  const fetchBankDetails = async () => {
    try {
      const response = await apiClient.get('/settings')
      if (response.data.success) {
        setBankDetails(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch bank details:', error)
    }
  }

  const fetchDonationPages = async () => {
    try {
      const response = await apiClient.get('/donation-pages')
      if (response.data.success && response.data.data?.length > 0) {
        setDonationPages(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch donation pages:', error)
    }
  }

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    if (value) {
      setAmount(parseInt(value) || 0)
    }
  }

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!donorName || !donorEmail || !donorPhone || amount <= 0) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      const fullPhone = `${countryCode}${donorPhone.replace(/\D/g, '')}`

      const response = await apiClient.post('/donations', {
        donorName: isAnonymous ? 'Anonymous Donor' : donorName,
        donorEmail,
        donorPhone: fullPhone,
        donorCountry: currency === 'INR' ? 'India' : 'Pakistan',
        amount,
        currency,
        purpose,
        donorMessage,
        isAnonymous,
      })

      if (response.data.success) {
        setDonationId(response.data.data._id)
        setDonationNumber(response.data.data.donationNumber)
        setStep('payment')
        toast.success('Donation initiated! Please complete payment.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate donation')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPaymentProof(file)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleUploadPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentProof) {
      toast.error('Please upload payment proof')
      return
    }

    try {
      setUploadLoading(true)

      // Upload image
      const formData = new FormData()
      formData.append('image', paymentProof)

      const uploadResponse = await apiClient.post('/upload/payment-proof?folder=donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const imageUrl = uploadResponse.data.data.url

      // Submit payment proof
      const response = await apiClient.put(`/donations/${donationId}/payment`, {
        paymentProof: imageUrl,
        transactionId,
        senderAccountNumber: senderAccount,
      })

      if (response.data.success) {
        setStep('success')
        toast.success('JazakAllah Khair! Your donation has been received.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload payment proof')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return

    try {
      setDownloadingReceipt(true)
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `Donation-Receipt-${donationNumber}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      toast.error('Failed to download receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount

  return (
    <>
      <Helmet>
        <title>Donate | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section with Animation */}
        <section className="relative min-h-[50vh] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[url('/images/islamic-pattern.png')] opacity-5"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl"></div>
          
          <FloatingHearts />
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Animated Heart Icon with Urdu Text */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6"
              >
                {/* Left Text - خلق */}
                <motion.span 
                  className="text-3xl sm:text-5xl md:text-6xl font-bold text-gold-400 font-urdu"
                  style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  خلقِ
                </motion.span>
                
                <div className="relative">
                  <Heart className="w-12 h-12 sm:w-20 sm:h-20 text-gold-400 fill-gold-400" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0"
                  >
                    <Heart className="w-12 h-12 sm:w-20 sm:h-20 text-gold-400" />
                  </motion.div>
                </div>
                
                {/* Right Text - خدمتِ */}
                <motion.span 
                  className="text-3xl sm:text-5xl md:text-6xl font-bold text-gold-400 font-urdu"
                  style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  خدمتِ
                </motion.span>
              </motion.div>
              
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent">
                  Support Our Mission
                </span>
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base px-2">
                Your generous donation helps us spread spiritual knowledge, support the needy, and build a better tomorrow.
                <span className="block mt-2 text-gold-300 font-semibold">Every contribution is a seed of blessings.</span>
              </p>
              
              {/* Quick Stats - Matching Mureed Page Style */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-6 sm:mt-10 mb-8 sm:mb-16 px-2"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gold-400">
                    <Home className="h-5 w-5" />
                    <AnimatedCounter end={5000} suffix="+" />
                  </div>
                  <p className="text-gray-300 text-sm mt-1">Families Helped</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gold-400">
                    <GraduationCap className="h-5 w-5" />
                    <AnimatedCounter end={200} suffix="+" />
                  </div>
                  <p className="text-gray-300 text-sm mt-1">Students Sponsored</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gold-400">
                    <Building2 className="h-5 w-5" />
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <p className="text-gray-300 text-sm mt-1">Mosques Built</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gold-400">
                    <Utensils className="h-5 w-5" />
                    <AnimatedCounter end={10000} suffix="+" />
                  </div>
                  <p className="text-gray-300 text-sm mt-1">Meals Provided</p>
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

        {/* Image Gallery Section */}
        <div className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {donationImages.map((image, index) => (
              <Link key={index} to={`/donate/${image.slug}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                >
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white">
                      <h4 className="font-bold text-sm sm:text-lg">{image.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-200">{image.description}</p>
                    </div>
                  </div>
                  {/* Click indicator */}
                  <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Why Donate Section - Moved below images */}
        <div className="container mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gold-50 via-amber-50 to-orange-50 dark:from-gold-900/20 dark:via-amber-900/20 dark:to-orange-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-gold-200 dark:border-gold-800"
          >
            <div className="text-center mb-4 sm:mb-8">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-gold-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Why Your Donation Matters</h3>
              <p className="text-gray-600 dark:text-gray-400">Every contribution creates ripples of positive change</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Sadaqah Jariyah</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Your donation becomes continuous charity, benefiting you even after you're gone</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Direct Impact</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">100% of your donation goes directly to those in need - no middlemen</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:col-span-2 md:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Blessings Multiplied</h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Allah multiplies the reward of charity many times over</p>
              </div>
            </div>
            
            {/* Hadith Quote */}
            <div className="mt-4 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-gold-200 dark:border-gold-800">
              <p className="text-sm sm:text-lg italic text-gray-700 dark:text-gray-300">
                "Charity does not decrease wealth. No one forgives another except that Allah increases his honor."
              </p>
              <p className="text-gold-600 dark:text-gold-400 font-semibold mt-2">- Prophet Muhammad ﷺ (Muslim)</p>
            </div>
          </motion.div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {step === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Donation Form */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="relative bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 px-8 py-8 overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <HandHeart className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Make a Donation</h2>
                        <p className="text-gray-300 text-sm">Your kindness changes lives</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-white/90 italic text-sm leading-relaxed">
                        "The example of those who spend their wealth in the way of Allah is like a seed which grows seven spikes; in each spike is a hundred grains. And Allah multiplies for whom He wills."
                        <span className="block text-gold-300 font-semibold mt-2 not-italic">- Quran 2:261</span>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitDonation} className="p-8 space-y-8">
                  {/* Currency Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Select Your Region
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        onClick={() => setCurrency('PKR')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                          currency === 'PKR'
                            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-green-50 dark:from-primary-900/30 dark:to-green-900/30 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
                        }`}
                      >
                        {currency === 'PKR' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3"
                          >
                            <CheckCircle2 className="w-6 h-6 text-primary-600" />
                          </motion.div>
                        )}
                        <span className="text-5xl mb-3 block">🇵🇰</span>
                        <span className="font-bold text-gray-900 dark:text-white text-lg block">Pakistan</span>
                        <span className="text-primary-600 font-semibold">PKR - Pakistani Rupee</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setCurrency('INR')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                          currency === 'INR'
                            ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:shadow-md'
                        }`}
                      >
                        {currency === 'INR' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3"
                          >
                            <CheckCircle2 className="w-6 h-6 text-orange-600" />
                          </motion.div>
                        )}
                        <span className="text-5xl mb-3 block">🇮🇳</span>
                        <span className="font-bold text-gray-900 dark:text-white text-lg block">India</span>
                        <span className="text-orange-600 font-semibold">INR - Indian Rupee</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Sparkles className="w-5 h-5 inline mr-2 text-gold-500" />
                      Donation Amount ({currency})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-4">
                      {suggestedAmounts[currency].map((amt, index) => (
                        <motion.button
                          key={amt}
                          type="button"
                          onClick={() => handleAmountSelect(amt)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`relative py-4 px-3 rounded-xl border-2 font-bold transition-all overflow-hidden ${
                            amount === amt && !customAmount
                              ? 'border-primary-500 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 text-gray-700 dark:text-gray-300 hover:shadow-md'
                          }`}
                        >
                          {amount === amt && !customAmount && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <span className="relative z-10">
                            {currency === 'PKR' ? 'Rs.' : '₹'} {amt.toLocaleString()}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        {currency === 'PKR' ? 'Rs.' : '₹'}
                      </span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 text-lg font-semibold"
                        placeholder="Or enter custom amount"
                      />
                    </div>
                  </div>

                  {/* Purpose Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <Gift className="w-5 h-5 inline mr-2 text-primary-600" />
                      Where Would You Like Your Donation to Go?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {donationPurposes.map((p) => {
                        const IconComponent = p.icon
                        return (
                          <motion.button
                            key={p.id}
                            type="button"
                            onClick={() => setPurpose(p.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-5 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                              purpose === p.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
                            }`}
                          >
                            <div className="relative z-10">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white block">{p.label}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{p.description}</span>
                            </div>
                            {purpose === p.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 z-20"
                              >
                                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Information</h3>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-5 h-5 text-primary-600 rounded"
                      />
                      <label htmlFor="anonymous" className="text-gray-700 dark:text-gray-300">
                        Make this donation anonymous
                      </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number (WhatsApp) *
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        >
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                        </select>
                        <input
                          type="tel"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                          placeholder="3001234567"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                        rows={3}
                        placeholder="Any special prayer request or message..."
                      />
                    </div>
                  </div>

                  {/* Total & Submit */}
                  <motion.div 
                    className="relative bg-gradient-to-br from-primary-50 via-green-50 to-primary-50 dark:from-primary-900/30 dark:via-green-900/30 dark:to-primary-900/30 rounded-2xl p-8 border-2 border-primary-200 dark:border-primary-800 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 block">Your Donation</span>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {purposeLabels[purpose] || 'General'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600 dark:text-gray-400 block">Total Amount</span>
                          <motion.span 
                            key={finalAmount}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"
                          >
                            {currency === 'PKR' ? 'Rs.' : '₹'} {finalAmount.toLocaleString()}
                          </motion.span>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={loading || finalAmount <= 0}
                        className="w-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 hover:from-primary-700 hover:via-primary-600 hover:to-primary-800 text-white py-6 text-lg font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:shadow-xl hover:shadow-primary-500/40"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-3">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Clock className="w-6 h-6" />
                            </motion.div>
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-3">
                            <Heart className="w-6 h-6" />
                            Proceed to Payment
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </span>
                        )}
                      </Button>
                      
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary-500" />
                        Your donation is secure and goes directly to those in need
                      </p>
                    </div>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Upload className="w-7 h-7" />
                    Complete Your Donation
                  </h2>
                  <p className="text-gray-200 mt-1">
                    Donation #{donationNumber}
                  </p>
                </div>

                <div className="p-8">
                  {/* Amount Summary */}
                  <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-6 mb-6">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400">Amount to Transfer</p>
                      <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                        {currency === 'PKR' ? 'Rs.' : '₹'} {finalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Purpose: {donationPurposes.find(p => p.id === purpose)?.label}
                      </p>
                    </div>
                  </div>

                  {/* Bank Details */}
                  {bankDetails && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Bank Transfer Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Bank Name:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Account Title:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{bankDetails.accountTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{bankDetails.accountNumber}</span>
                        </div>
                        {bankDetails.ibanNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">IBAN:</span>
                            <span className="font-medium text-gray-900 dark:text-white text-xs">{bankDetails.ibanNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Proof Upload */}
                  <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload Payment Screenshot *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="payment-proof"
                        />
                        <label htmlFor="payment-proof" className="cursor-pointer block">
                          {paymentProof && imagePreview ? (
                            <div className="space-y-3">
                              <img 
                                src={imagePreview} 
                                alt="Payment Screenshot Preview" 
                                className="max-h-48 mx-auto rounded-lg shadow-md border border-gray-200"
                              />
                              <div className="flex items-center justify-center gap-2 text-primary-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-medium">{paymentProof.name}</span>
                              </div>
                              <p className="text-xs text-gray-500">Click to change image</p>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              <Upload className="w-10 h-10 mx-auto mb-2" />
                              <p>Click to upload payment screenshot</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction ID / Reference Number
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                        placeholder="Enter transaction ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Account Number (Last 4 digits)
                      </label>
                      <input
                        type="text"
                        value={senderAccount}
                        onChange={(e) => setSenderAccount(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                        placeholder="XXXX"
                        maxLength={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={uploadLoading || !paymentProof}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg font-semibold rounded-xl"
                    >
                      {uploadLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5 animate-spin" />
                          Uploading...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Confirm Donation
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              {/* Receipt Card */}
              <div ref={receiptRef} className="bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-2xl overflow-hidden border border-gold-200">
                {/* Header with Pattern */}
                <div className="relative bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 px-8 py-14 text-center overflow-hidden">
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.5"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                  </div>
                  
                  {/* Glowing Effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-400/30 rounded-full blur-3xl"></div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="relative z-10"
                  >
                    {/* Golden Checkmark Circle */}
                    <motion.div 
                      animate={{ boxShadow: ['0 0 20px rgba(212, 175, 55, 0.5)', '0 0 40px rgba(212, 175, 55, 0.8)', '0 0 20px rgba(212, 175, 55, 0.5)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-28 h-28 bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl"
                    >
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    </motion.div>
                    <p className="text-gold-300 text-xl mb-2 font-medium">Dear {isAnonymous ? 'Generous Donor' : donorName},</p>
                    <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">JazakAllah Khair!</h1>
                    <p className="text-gray-200 text-lg">Your donation has been received</p>
                  </motion.div>
                </div>

                {/* Appreciation Message */}
                <div className="px-8 py-8 bg-gradient-to-b from-gold-50/50 to-white">
                  <div className="text-center mb-8">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex justify-center gap-1 mb-4"
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-7 h-7 text-gold-500 fill-gold-500 drop-shadow-md" />
                      ))}
                    </motion.div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 via-gold-600 to-primary-700 bg-clip-text text-transparent mb-3">
                      May Allah Bless You Abundantly
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      Your generosity is a beacon of hope. The rewards of charity are multiplied manifold, 
                      and your kindness will surely be rewarded in this life and the hereafter.
                    </p>
                  </div>

                  {/* Quranic Verse */}
                  <div className="bg-gradient-to-r from-primary-50 via-white to-primary-50 rounded-2xl p-6 border-2 border-gold-200 shadow-lg mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-16 h-16 bg-gold-400/10 rounded-full -translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-gold-400/10 rounded-full translate-x-8 translate-y-8"></div>
                    <p className="text-primary-800 italic text-center text-lg relative z-10 leading-relaxed">
                      "Those who spend their wealth in the way of Allah and then do not follow up what they have spent with reminders or injury will have their reward with their Lord, and there will be no fear concerning them, nor will they grieve."
                    </p>
                    <p className="text-gold-600 text-center mt-3 font-bold text-lg">- Quran 2:262</p>
                  </div>

                  {/* Donation Details */}
                  <div className="bg-gradient-to-br from-gray-50 to-gold-50/30 rounded-2xl p-6 mb-6 border border-gold-100 shadow-md">
                    <h3 className="font-bold text-gray-900 mb-5 text-center text-lg flex items-center justify-center gap-2">
                      <Receipt className="w-5 h-5 text-gold-600" />
                      Donation Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gold-200/50 bg-white/50 rounded-lg px-4">
                        <span className="text-gray-600 font-medium">Donation Number:</span>
                        <div className="text-right">
                          <span className="font-bold text-primary-600 text-lg">{donationNumber}</span>
                          <p className="text-xs text-gold-600 font-medium">(Tracking ID)</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gold-200/50 bg-white/50 rounded-lg px-4">
                        <span className="text-gray-600 font-medium">Amount:</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-primary-600 to-gold-600 bg-clip-text text-transparent">
                          {currency === 'PKR' ? 'Rs.' : '₹'} {finalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gold-200/50 bg-white/50 rounded-lg px-4">
                        <span className="text-gray-600 font-medium">Purpose:</span>
                        <span className="font-semibold text-gray-800 bg-gold-100 px-3 py-1 rounded-full">
                          {donationPurposes.find(p => p.id === purpose)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-amber-50 rounded-lg px-4">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className="flex items-center gap-2 text-amber-600 font-bold">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                            <Clock className="w-5 h-5" />
                          </motion.div>
                          Pending Verification
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-primary-100 to-gold-100 rounded-xl p-4 mt-4 border border-primary-200">
                        <p className="text-sm text-primary-800 text-center font-medium">
                          📍 Track your donation: Go to <span className="font-bold text-gold-700">Track Order</span> and enter <span className="font-mono bg-white px-2 py-1 rounded-lg shadow-sm font-bold">{donationNumber}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Special Thanks */}
                  <div className="text-center py-6 relative">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="w-10 h-10 text-gold-500 mx-auto mb-4 drop-shadow-lg" />
                    </motion.div>
                    <p className="text-gray-800 font-semibold text-lg">
                      We are grateful for your support and trust in our mission.
                    </p>
                    <p className="text-gold-600 text-sm mt-2 font-medium">
                      ✨ May Allah reward you with the best of rewards ✨
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 px-8 py-5 text-center">
                  <p className="text-gold-300 text-sm font-medium">
                    Sahibzada Shariq Ahmed Tariqi - Spiritual Healing & Guidance
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={handleDownloadReceipt}
                  disabled={downloadingReceipt}
                  className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg shadow-gold-500/30 font-semibold py-6"
                >
                  {downloadingReceipt ? (
                    <Clock className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Download className="w-5 h-5 mr-2" />
                  )}
                  Download Receipt
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1 border-2 border-primary-600 text-primary-700 hover:bg-primary-50 font-semibold py-6"
                >
                  Return Home
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
