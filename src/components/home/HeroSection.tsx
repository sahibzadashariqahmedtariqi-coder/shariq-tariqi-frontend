import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BookOpen, Video, Heart } from 'lucide-react'
import api from '@/services/api'

// Typing animation component - Simple and stable
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          
          const startDelay = setTimeout(() => {
            let currentIndex = 0
            const typingInterval = setInterval(() => {
              if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex))
                currentIndex++
              } else {
                clearInterval(typingInterval)
                setIsTypingComplete(true)
              }
            }, 30)

            return () => clearInterval(typingInterval)
          }, delay)

          return () => clearTimeout(startDelay)
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
  }, [text, delay, hasStarted])

  return (
    <span 
      ref={ref} 
      className="inline-block"
      style={{ 
        minHeight: '1.5em'
      }}
    >
      <span className="whitespace-pre-wrap">
        {displayedText}
      </span>
      {hasStarted && !isTypingComplete && displayedText && (
        <span className="inline-block w-0.5 h-5 md:h-6 lg:h-8 bg-primary-600 dark:bg-gold-400 animate-pulse ml-0.5 align-middle" />
      )}
    </span>
  )
}

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch hero slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get('/hero-slides')
        console.log('Hero Slides Response:', response.data)
        
        // API returns {success, count, data: [...]}
        const slidesData = response.data.data || response.data
        const activeSlides = slidesData.filter((slide: any) => slide.isActive)
        
        console.log('Active Slides:', activeSlides.length)
        
        setSlides(activeSlides.length > 0 ? activeSlides : [
          // Fallback to local images if no slides in database
          { image: '/images/hero-1.jpg', title: 'Welcome', subtitle: '', buttonText: '', buttonLink: '', order: 1 },
          { image: '/images/hero-2.jpg', title: 'Spiritual Guidance', subtitle: '', buttonText: '', buttonLink: '', order: 2 },
          { image: '/images/hero-3.jpg', title: 'Traditional Healing', subtitle: '', buttonText: '', buttonLink: '', order: 3 },
        ])
      } catch (error) {
        console.error('Error fetching hero slides:', error)
        // Fallback to local images on error
        setSlides([
          { image: '/images/hero-1.jpg', title: 'Welcome', subtitle: '', buttonText: '', buttonLink: '', order: 1 },
          { image: '/images/hero-2.jpg', title: 'Spiritual Guidance', subtitle: '', buttonText: '', buttonLink: '', order: 2 },
          { image: '/images/hero-3.jpg', title: 'Traditional Healing', subtitle: '', buttonText: '', buttonLink: '', order: 3 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <section className="relative w-full overflow-hidden">
      {/* Full Width Image Carousel - WITHOUT Text Overlay */}
      <div className="relative w-full h-[280px] md:h-[350px] lg:h-[400px] bg-gradient-to-b from-primary-900 to-primary-800">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400"></div>
          </div>
        ) : (
          <>
            {slides.map((slide, index) => (
              <motion.div
                key={slide._id || index}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentImageIndex === index ? 1 : 0,
                  scale: currentImageIndex === index ? 1 : 1.05
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <img
                  src={slide.image}
                  alt={slide.title || `Sahibzada Shariq Ahmed Tariqi - Slide ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    currentImageIndex === index
                      ? 'w-12 bg-gold-400 shadow-lg'
                      : 'w-3 bg-white/50 hover:bg-white/80 hover:w-6'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Text Content BELOW Images */}
      <div className="relative bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 py-10 md:py-12 overflow-hidden min-h-[500px]">
        {/* Background Logo - Transparent and Fixed */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 dark:opacity-15 pointer-events-none">
          <img 
            src="/images/logo.png" 
            alt="Background Logo" 
            className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] object-contain"
            style={{ display: 'block' }}
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center min-h-[450px] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4 w-full"
            >
              <div className="h-[100px] md:h-[120px] flex items-center justify-center overflow-hidden">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-800 dark:text-white leading-relaxed text-center">
                  <TypingText text="Welcome to" delay={0} />
                  <br />
                  <span className="text-gold-500">
                    <TypingText text="Sahibzada Shariq Ahmed Tariqi" delay={200} />
                  </span>
                </h1>
              </div>
              
              <div className="h-[120px] md:h-[140px] flex items-center justify-center overflow-hidden px-4">
                <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 font-light text-center max-w-4xl leading-relaxed">
                  <TypingText 
                    text="Deeply rooted in the timeless wisdom of Sufism and the ancient healing sciences of Hikmat, Sahibzada Shariq Ahmed Tariqi illuminates hearts and minds with profound divine knowledge of spirituality, traditional healing practices, and spiritual guidance."
                    delay={500}
                  />
                </p>
              </div>

              <div className="h-[80px] flex items-center justify-center overflow-hidden px-4">
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center max-w-3xl leading-relaxed">
                  <TypingText 
                    text="Discover the sacred path to spiritual enlightenment, inner peace, and physical well-being through authentic traditional Islamic healing methods and comprehensive spiritual guidance."
                    delay={1500}
                  />
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Link to="/courses">
                  <Button size="lg" className="gap-2 shadow-xl">
                    <BookOpen className="h-5 w-5" />
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/services">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2"
                  >
                    <Heart className="h-5 w-5" />
                    Our Services
                  </Button>
                </Link>
                <Link to="/media">
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="gap-2"
                  >
                    <Video className="h-5 w-5" />
                    Watch Videos
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
