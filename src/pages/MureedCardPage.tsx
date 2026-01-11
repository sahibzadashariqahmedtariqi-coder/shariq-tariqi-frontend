import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { Download, Share2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api'
import toast from 'react-hot-toast'

interface MureedData {
  _id: string
  mureedId: number
  fullName: string
  fatherName: string
  contactNumber: string
  country: string
  city: string
  dateOfBirth: string
  address: string
  profilePicture: string
  status: string
  cardGeneratedAt: string
}

export default function MureedCardPage() {
  const { id } = useParams()
  const cardRef = useRef<HTMLDivElement>(null)
  const [mureed, setMureed] = useState<MureedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchMureed = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/mureeds/card/${id}`)
        if (response.data.success) {
          setMureed(response.data.data)
        }
      } catch (error: any) {
        console.error('Error fetching mureed:', error)
        setError(error.response?.data?.message || 'Failed to load Mureed card')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMureed()
    }
  }, [id])

  const handleDownload = async () => {
    if (!cardRef.current) return
    
    try {
      setDownloading(true)
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      
      const link = document.createElement('a')
      link.download = `Mureed-Card-${mureed?.mureedId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      toast.success('Card downloaded successfully!')
    } catch (error) {
      console.error('Error downloading card:', error)
      toast.error('Failed to download card')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mureed Card - ${mureed?.fullName}`,
          text: `View my Mureed Card - ID: ${mureed?.mureedId}`,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Mureed Card...</p>
        </div>
      </div>
    )
  }

  if (error || !mureed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Card Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The Mureed card you are looking for does not exist.'}</p>
          <Link to="/mureed">
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">
              Register as Mureed
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Mureed Card - {mureed.fullName} | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link to="/mureed" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Registration
          </Link>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6"
          >
            <p className="text-green-800 dark:text-green-300 text-center font-medium">
              🎉 Congratulations! Your Mureed Card has been generated successfully!
            </p>
          </motion.div>

          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Mureed Card - This is what gets downloaded */}
            <div ref={cardRef} className="bg-white p-8">
              {/* Card Header with Islamic Design */}
              <div className="text-center mb-6 pb-6 border-b-2 border-primary-500">
                {/* Logo and Arabic Text */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gold-400 font-arabic">ش</span>
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-arabic text-primary-800 leading-tight">
                      طریقی روحانی درسگاہ
                    </h1>
                  </div>
                </div>
                
                {/* English Title */}
                <p className="text-lg text-gray-600">
                  Oath Taken Under: <span className="font-bold text-primary-800">Sahibzada Shariq Ahmed Tariqi</span>
                </p>
                <p className="text-sm text-gold-600 font-arabic">( دامت برکاتہم العالیہ )</p>
              </div>

              {/* Mureed ID */}
              <div className="text-center mb-6">
                <span className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-lg font-bold">
                  Reg. No: Mureed ID - {mureed.mureedId}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500 font-medium">Full Name:</span>
                    <p className="text-lg font-semibold text-gray-900">{mureed.fullName}</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500 font-medium">Father Name:</span>
                    <p className="text-lg font-semibold text-gray-900">{mureed.fatherName}</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500 font-medium">Date Of Birth:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(mureed.dateOfBirth).toISOString().split('T')[0]}
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500 font-medium">Country:</span>
                    <p className="text-lg font-semibold text-gray-900">{mureed.country}</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500 font-medium">City:</span>
                    <p className="text-lg font-semibold text-gray-900">{mureed.city}</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-500 font-medium">Address:</span>
                    <p className="text-gray-900">{mureed.address}</p>
                  </div>
                  
                  <div className="pb-3">
                    <span className="text-sm text-gray-500 font-medium">Contact:</span>
                    <p className="text-lg font-semibold text-gray-900">{mureed.contactNumber}</p>
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg">
                    <img
                      src={mureed.profilePicture}
                      alt={mureed.fullName}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-8 pt-6 border-t-2 border-primary-500">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-center md:text-left">
                    <p className="text-sm text-gray-500 font-arabic">
                      ہراسلامی ماہ کی چوتھی تاریخ کو شائع کو شیخ شانی و روحانی درس گاہ پر عزائے کا اہتمام کیا جاتا ہے۔
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      www.shariqahmedtariqi.com
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 border-2 border-primary-600 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
                      <span className="text-2xl font-arabic text-primary-700">ش</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download Card
                </>
              )}
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="px-8 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share Card
            </Button>
          </motion.div>

          {/* Info Note */}
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Save your Mureed ID: <span className="font-bold text-primary-600">{mureed.mureedId}</span> for future reference
          </p>
        </div>
      </div>
    </>
  )
}
