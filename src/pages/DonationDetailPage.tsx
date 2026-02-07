import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Heart, Play } from 'lucide-react'
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
        {/* Hero */}
        <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
          <img
            src={page.coverImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-10">
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
          {/* Description */}
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

          {/* YouTube Shorts */}
          {youtubeId && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10 mb-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Impact Video</h3>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Gallery */}
          {page.galleryImages && page.galleryImages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gallery</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {page.galleryImages.map((img, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-2xl group shadow-md">
                    <img src={img} alt={`${page.title} ${idx + 1}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
