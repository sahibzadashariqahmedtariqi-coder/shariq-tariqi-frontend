import { motion } from 'framer-motion'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { getYouTubeVideoId } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { videosApi } from '@/services/apiService'

export default function LatestVideos() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allVideos, setAllVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const videosPerPage = 4

  // Fetch videos from YouTube API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videosApi.getLatestFromYouTube()
        
        if (response.items && response.items.length > 0) {
          const formattedVideos = response.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          }))
          setAllVideos(formattedVideos)
        } else {
          // Fallback to hardcoded videos if API fails
          setAllVideos(getFallbackVideos())
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
        setAllVideos(getFallbackVideos())
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  // Fallback videos if YouTube API is not configured
  const getFallbackVideos = () => [
    {
      id: 'L86pSu3ozTc',
      title: 'Neend Mein Ghabrahat Bechaini Ka Shikar Hona | Bar Bar Chok Kar Uth Jana',
      url: 'https://www.youtube.com/watch?v=L86pSu3ozTc',
    },
    {
      id: 'o17kvE6QaCQ',
      title: 'Kya Ghar Se Sona Chandi Ya Paisay Ghaib Hona Jadu Ka Asar Hai?',
      url: 'https://www.youtube.com/watch?v=o17kvE6QaCQ',
    },
    {
      id: 'npJWT1XBAUY',
      title: 'JASHN E USMAN 2025 | Introduction About Khidmat e Khalq',
      url: 'https://www.youtube.com/watch?v=npJWT1XBAUY',
    },
    {
      id: 'd4jdFLvHE7o',
      title: 'Har Ranj o Gham Se Hifazat Ka Khaas Amal',
      url: 'https://www.youtube.com/watch?v=d4jdFLvHE7o',
    },
    {
      id: 'oi8tTQJq7vw',
      title: 'Kya Naya Ghar Aapke Liye Barkat Laye Ga? Janiye Istikhara Ka Sahi Tariqa',
      url: 'https://www.youtube.com/watch?v=oi8tTQJq7vw',
    },
    {
      id: '12_rXoBNtTE',
      title: '11vi Sharif Ka Amal | Taqdeer Badalne Ka Khas Nuskha',
      url: 'https://www.youtube.com/watch?v=12_rXoBNtTE',
    },
    {
      id: 'Dvc20qmCnEw',
      title: 'Aik Aisa Tareeqa — Jo Shayateen Ko Jalane Aur Khaufzda Karne Ke Liye Kaafi Hai',
      url: 'https://www.youtube.com/watch?v=Dvc20qmCnEw',
    },
    {
      id: 'DYkHtvqXKcA',
      title: 'Naag Phani Hisar Ka Keel aur Jadu Ka Palta War',
      url: 'https://www.youtube.com/watch?v=DYkHtvqXKcA',
    },
    {
      id: 'u1Jl5nFfVdE',
      title: 'Ek Tibbī Nuskha | Shayāteen Ko Khatm Karne Ka Anokha Raaz',
      url: 'https://www.youtube.com/watch?v=u1Jl5nFfVdE',
    },
    {
      id: 'z_ibZAuP6XY',
      title: 'Kya Jari Booti Se Bhi Jinnat Jalaye Ja Sakte Hain?',
      url: 'https://www.youtube.com/watch?v=z_ibZAuP6XY',
    },
    {
      id: 'MeiIVNKzMWo',
      title: 'Apke Sath Masla Kya Hai? | Khoi Hui Cheez Ka Pata Khud Lagaiye',
      url: 'https://www.youtube.com/watch?v=MeiIVNKzMWo',
    },
    {
      id: 'uevKm_TdTyI',
      title: 'Jadu ki Waja se Be-Wajah Udasi aur Mayosi | Rohani Hal aur Asan Amal',
      url: 'https://www.youtube.com/watch?v=uevKm_TdTyI',
    },
  ]

  const totalPages = Math.ceil(allVideos.length / videosPerPage)
  const videos = allVideos.slice(currentIndex * videosPerPage, (currentIndex + 1) * videosPerPage)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
  }

  return (
    <section className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary-800 dark:text-white mb-4">
          Recently Uploaded Videos
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Watch our latest spiritual lectures and guidance videos
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="relative">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Previous videos"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Next videos"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => {
          const videoId = getYouTubeVideoId(video.url)
          const thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

          return (
            <motion.a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <img
                  src={thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" fill="white" />
                </div>
              </div>
              <h3 className="mt-3 text-sm font-medium text-gray-800 dark:text-white line-clamp-2">
                {video.title}
              </h3>
            </motion.a>
          )
        })}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
      )}
    </section>
  )
}
