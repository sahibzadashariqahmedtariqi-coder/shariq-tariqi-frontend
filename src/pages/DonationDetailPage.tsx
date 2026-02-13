import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { ArrowLeft, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '@/services/api'

interface DonationPage {
  _id?: string
  title: string
  slug: string
  shortDescription: string
  description: string
  coverImage: string
  galleryImages?: string[]
  youtubeShortsUrl?: string
  isPublished?: boolean
}

const fallbackPages: DonationPage[] = [
  {
    title: 'Helping Communities',
    slug: 'helping-communities',
    shortDescription: 'Supporting families in need',
    description: 'Your support helps provide food, clothing, and essential care to families who need it most. Together, we can uplift communities and restore hope.',
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=800&fit=crop',
    galleryImages: [],
  },
  {
    title: 'Education for All',
    slug: 'education-for-all',
    shortDescription: 'Providing quality education',
    description: 'Education transforms lives. Your donation supports learning materials, teachers, and access to schools for children who deserve a brighter future.',
    coverImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&h=800&fit=crop',
    galleryImages: [],
  },
  {
    title: 'Food Distribution',
    slug: 'food-distribution',
    shortDescription: 'Feeding the hungry',
    description: 'We deliver meals to families and individuals facing hunger. Your generosity ensures that no one sleeps hungry.',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&h=800&fit=crop',
    galleryImages: [],
  },
  {
    title: 'Building Hope',
    slug: 'building-hope',
    shortDescription: 'Creating better futures',
    description: 'Support initiatives that create long-term impact — from shelters to healthcare and community support programs.',
    coverImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=800&fit=crop',
    galleryImages: [],
  },
]

const getYouTubeId = (url?: string) => {
  if (!url) return ''
  const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/)
  if (shortsMatch) return shortsMatch[1]
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watchMatch) return watchMatch[1]
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]+)/)
  if (embedMatch) return embedMatch[1]
  return ''
}

export default function DonationDetailPage() {
  const { slug } = useParams()
  const [page, setPage] = useState<DonationPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Build hero slides array - cover image + gallery images
  const heroSlides = useMemo(() => {
    if (!page) return []
    const slides = [page.coverImage]
    if (page.galleryImages && page.galleryImages.length > 0) {
      slides.push(...page.galleryImages.filter(Boolean))
    }
    return slides
  }, [page])

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [heroSlides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [heroSlides.length])

  useEffect(() => {
    const fetchPage = async () => {
      try {
        if (!slug) return
        const response = await apiClient.get(`/donation-pages/slug/${slug}`)
        if (response.data.success) {
          setPage(response.data.data)
        }
      } catch (error) {
        const fallback = fallbackPages.find((p) => p.slug === slug)
        if (fallback) setPage(fallback)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  const youtubeId = useMemo(() => getYouTubeId(page?.youtubeShortsUrl), [page?.youtubeShortsUrl])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
        <p className="text-gray-600 mt-2">This donation page is not available.</p>
        <Link to="/donate" className="mt-6 inline-flex items-center gap-2 text-primary-600 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Donate
        </Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{page.title} | Donation</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Slider */}
        <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={heroSlides[currentSlide] || page.coverImage}
              alt={page.title}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7 }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Slider Controls */}
          {heroSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Slide Counter */}
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm">
                {currentSlide + 1} / {heroSlides.length}
              </div>
            </>
          )}

          <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-10 z-10">
            <Link to="/donate" className="inline-flex items-center gap-2 text-white/90 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Donate
            </Link>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">{page.title}</h1>
            <p className="text-white/90 max-w-2xl text-sm sm:text-base">
              {page.shortDescription}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Main Content Section - Video + Description */}
          {youtubeId ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10 mb-10 border border-gray-100 dark:border-gray-700">
              {/* Two column layout - Video LEFT, Description RIGHT */}
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                {/* Left side - Video (bigger) */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="w-full aspect-[9/16] max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
                
                {/* Right side - Description */}
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">{page.title}</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base mb-6">
                    {page.description}
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Heart className="w-5 h-5 text-pink-500" />
                      <span>Your donation makes a real difference</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Heart className="w-5 h-5 text-pink-500" />
                      <span>100% of donations go to those in need</span>
                    </div>
                  </div>
                  <div>
                    <Link
                      to="/donate"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg hover:from-primary-700 hover:to-primary-800"
                    >
                      <Heart className="w-5 h-5" /> Donate Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No video - show description only */
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10 mb-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why this matters</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {page.description}
              </p>
              <div className="mt-8">
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg hover:from-primary-700 hover:to-primary-800"
                >
                  <Heart className="w-5 h-5" /> Donate Now
                </Link>
              </div>
            </div>
          )}

          {/* Thumbnail Gallery - for quick navigation */}
          {heroSlides.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gallery ({heroSlides.length} Images)</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {heroSlides.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative overflow-hidden rounded-xl group shadow-md ${
                      idx === currentSlide ? 'ring-4 ring-primary-500' : ''
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${page.title} ${idx + 1}`} 
                      className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className={`absolute inset-0 ${idx === currentSlide ? 'bg-primary-500/20' : 'bg-black/0 group-hover:bg-black/20'} transition-colors`} />
                    {idx === currentSlide && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
