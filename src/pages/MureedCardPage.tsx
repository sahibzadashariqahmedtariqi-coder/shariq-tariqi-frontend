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
    if (!cardRef.current || !mureed) return
    
    try {
      setDownloading(true)
      
      // Create a completely new card element with fixed desktop styles inline
      const downloadCard = document.createElement('div')
      downloadCard.innerHTML = `
        <div style="width: 800px; min-width: 800px; background: linear-gradient(to bottom right, #fefefe, #f8f6f0, #f0ebe0); position: relative; overflow: hidden; font-family: system-ui, -apple-system, sans-serif;">
          <!-- Top Border -->
          <div style="height: 12px; background: linear-gradient(to right, #1B4332, #D4AF37, #1B4332);"></div>
          
          <!-- Watermark -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0.18;">
            <img src="/images/logo.png" alt="Watermark" style="width: 550px; height: 550px; object-fit: contain;" crossorigin="anonymous" />
          </div>
          
          <!-- Corner Decorations -->
          <div style="position: absolute; top: 0; left: 0; width: 96px; height: 96px; border-left: 4px solid rgba(212, 175, 55, 0.3); border-top: 4px solid rgba(212, 175, 55, 0.3); border-radius: 24px 0 0 0; z-index: 5;"></div>
          <div style="position: absolute; top: 0; right: 0; width: 96px; height: 96px; border-right: 4px solid rgba(212, 175, 55, 0.3); border-top: 4px solid rgba(212, 175, 55, 0.3); border-radius: 0 24px 0 0; z-index: 5;"></div>
          <div style="position: absolute; bottom: 0; left: 0; width: 96px; height: 96px; border-left: 4px solid rgba(212, 175, 55, 0.3); border-bottom: 4px solid rgba(212, 175, 55, 0.3); border-radius: 0 0 0 24px; z-index: 5;"></div>
          <div style="position: absolute; bottom: 0; right: 0; width: 96px; height: 96px; border-right: 4px solid rgba(212, 175, 55, 0.3); border-bottom: 4px solid rgba(212, 175, 55, 0.3); border-radius: 0 0 24px 0; z-index: 5;"></div>
          
          <div style="padding: 40px; position: relative; z-index: 10;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #1B4332;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px;">
                <div style="padding: 8px; background: linear-gradient(to bottom right, #dcfce7, #fef3c7); border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <img src="/images/logo.png" alt="Logo" style="width: 64px; height: 64px; object-fit: contain;" crossorigin="anonymous" />
                </div>
                <h1 style="font-size: 32px; color: #1B4332; margin: 0; font-family: 'Noto Nastaliq Urdu', serif;">طارقی روحانی درسگاہ</h1>
              </div>
              <p style="font-size: 18px; color: #4b5563; margin: 0;">Oath Taken Under: <strong style="color: #1B4332;">Sahibzada Shariq Ahmed Tariqi</strong></p>
              <p style="font-size: 20px; color: #D4AF37; margin-top: 8px; font-family: 'Noto Nastaliq Urdu', serif;">( دامت برکاتہم العالیہ )</p>
            </div>
            
            <!-- Mureed ID Badge -->
            <div style="text-align: center; margin-bottom: 32px;">
              <span style="display: inline-block; background: linear-gradient(to right, #1B4332, #14532d, #1B4332); color: white; padding: 12px 24px; border-radius: 9999px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ✨ Reg. No: Mureed ID - ${mureed.mureedId} ✨
              </span>
            </div>
            
            <!-- Body - Details and Photo -->
            <div style="display: flex; flex-direction: row; gap: 32px;">
              <!-- Details -->
              <div style="flex: 1; padding: 24px; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px;">
                <div style="border-bottom: 1px solid #fde68a; padding-bottom: 12px; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #1B4332; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%;"></span>Full Name:
                  </span>
                  <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 4px 0 0 0;">${mureed.fullName}</p>
                </div>
                <div style="border-bottom: 1px solid #fde68a; padding-bottom: 12px; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #1B4332; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%;"></span>Father Name:
                  </span>
                  <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 4px 0 0 0;">${mureed.fatherName}</p>
                </div>
                <div style="border-bottom: 1px solid #fde68a; padding-bottom: 12px; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #1B4332; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%;"></span>Date Of Birth:
                  </span>
                  <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 4px 0 0 0;">${new Date(mureed.dateOfBirth).toISOString().split('T')[0]}</p>
                </div>
                <div style="border-bottom: 1px solid #fde68a; padding-bottom: 12px; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #1B4332; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%;"></span>Country:
                  </span>
                  <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 4px 0 0 0;">${mureed.country}</p>
                </div>
                <div style="border-bottom: 1px solid #fde68a; padding-bottom: 12px; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #1B4332; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%;"></span>City:
                  </span>
                  <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 4px 0 0 0;">${mureed.city}</p>
                </div>
                <div style="border-bottom: 1px solid #fde68a; padding-bottom: 12px; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #1B4332; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%;"></span>Address:
                  </span>
                  <p style="font-size: 16px; color: #1f2937; margin: 4px 0 0 0;">${mureed.address}</p>
                </div>
                <div style="padding-bottom: 8px;">
                  <span style="font-size: 14px; color: #1B4332; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%;"></span>Contact:
                  </span>
                  <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 4px 0 0 0;">${mureed.contactNumber}</p>
                </div>
              </div>
              
              <!-- Profile Picture -->
              <div style="flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 16px;">
                <div style="position: relative;">
                  <div style="position: absolute; inset: -8px; background: linear-gradient(to bottom right, #D4AF37, #1B4332, #D4AF37); border-radius: 50%; opacity: 0.75; filter: blur(4px);"></div>
                  <div style="position: relative; width: 160px; height: 160px; border-radius: 50%; overflow: hidden; border: 4px solid white; box-shadow: 0 25px 50px rgba(0,0,0,0.25);">
                    <img src="${mureed.profilePicture}" alt="${mureed.fullName}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #1B4332; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-size: 14px; color: #1B4332; margin: 0; font-family: 'Noto Nastaliq Urdu', serif;">ہراسلامی ماہ کی چوتھی تاریخ کو شائع کو شیخ شانی و روحانی درس گاہ پر عزائے کا اہتمام کیا جاتا ہے۔</p>
                <p style="font-size: 14px; color: #D4AF37; margin-top: 8px;">🌐 www.shariqahmedtariqi.com</p>
              </div>
              <div style="text-align: center;">
                <div style="width: 140px; height: 60px; border: 1px solid #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; padding: 4px;">
                  <img src="https://res.cloudinary.com/du7qzhimu/image/upload/e_background_removal,f_png/v1769484522/shariq-website/products/nq2ruu8psj6wpzrv6dqe.jpg" alt="Signature" style="width: 100%; height: 100%; object-fit: contain;" crossorigin="anonymous" />
                </div>
                <p style="font-size: 12px; color: #6b7280; margin-top: 6px; font-style: italic;">Signature</p>
              </div>
            </div>
          </div>
          
          <!-- Bottom Border -->
          <div style="height: 12px; background: linear-gradient(to right, #1B4332, #D4AF37, #1B4332);"></div>
        </div>
      `
      
      // Create wrapper
      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 800px; background: white; z-index: -9999;'
      wrapper.appendChild(downloadCard)
      document.body.appendChild(wrapper)
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const cardElement = downloadCard.firstElementChild as HTMLElement
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 800,
        height: cardElement.scrollHeight + 50,
        windowWidth: 800,
        windowHeight: cardElement.scrollHeight + 50,
        imageTimeout: 15000,
      })
      
      document.body.removeChild(wrapper)
      
      const link = document.createElement('a')
      link.download = `Mureed-Card-${mureed.mureedId}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
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
            className="rounded-3xl shadow-2xl overflow-hidden overflow-x-auto"
          >
            {/* Mureed Card - This is what gets downloaded */}
            <div ref={cardRef} data-card-ref="true" className="relative bg-gradient-to-br from-[#fefefe] via-[#f8f6f0] to-[#f0ebe0] overflow-hidden min-w-[320px] md:min-w-[600px]">
              {/* Decorative Top Border */}
              <div className="h-2 md:h-3 bg-gradient-to-r from-primary-600 via-gold-500 to-primary-600"></div>
              
              {/* Background Logo - Watermark Style - Like Homepage */}
              <div 
                className="absolute pointer-events-none"
                style={{ 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                  opacity: 0.18
                }}
              >
                <img 
                  src="/images/logo.png" 
                  alt="Background Watermark" 
                  className="w-[280px] h-[280px] md:w-[550px] md:h-[550px] object-contain"
                  style={{ display: 'block', filter: 'none' }}
                />
              </div>

              {/* Corner Decorations - Hidden on mobile */}
              <div className="hidden md:block absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-gold-400/30 rounded-tl-3xl" style={{ zIndex: 5 }}></div>
              <div className="hidden md:block absolute top-0 right-0 w-24 h-24 border-r-4 border-t-4 border-gold-400/30 rounded-tr-3xl" style={{ zIndex: 5 }}></div>
              <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 border-l-4 border-b-4 border-gold-400/30 rounded-bl-3xl" style={{ zIndex: 5 }}></div>
              <div className="hidden md:block absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-gold-400/30 rounded-br-3xl" style={{ zIndex: 5 }}></div>
              
              <div className="p-4 md:p-10">
                {/* Card Header with Islamic Design */}
                <div className="text-center mb-4 md:mb-8 pb-4 md:pb-6 border-b-2 border-primary-600 relative z-10">
                  {/* Logo and Arabic Text */}
                  <div className="flex items-center justify-center gap-2 md:gap-4 mb-2 md:mb-4">
                    <div className="p-1 md:p-2 bg-gradient-to-br from-primary-100 to-gold-100 rounded-xl md:rounded-2xl shadow-lg">
                      <img 
                        src="/images/logo.png" 
                        alt="Tariqi Logo" 
                        className="w-10 h-10 md:w-16 md:h-16 object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl md:text-4xl font-arabic text-primary-800 leading-tight">
                        طارقی روحانی درسگاہ
                      </h1>
                    </div>
                  </div>
                  
                  {/* English Title */}
                  <p className="text-sm md:text-lg text-gray-600">
                    Oath Taken Under: <span className="font-bold text-primary-800">Sahibzada Shariq Ahmed Tariqi</span>
                  </p>
                  <p className="text-base md:text-xl text-gold-600 font-arabic mt-1 md:mt-2 tracking-wide font-semibold">( دامت برکاتہم العالیہ )</p>
                </div>

                {/* Mureed ID */}
                <div className="text-center mb-4 md:mb-8 relative z-10">
                  <span className="inline-block bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-lg font-bold shadow-lg">
                    ✨ Reg. No: Mureed ID - {mureed.mureedId} ✨
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 relative" style={{ zIndex: 10 }}>
                  {/* Details */}
                  <div className="flex-1 space-y-2 md:space-y-4 bg-transparent rounded-2xl p-3 md:p-6 border border-gold-200/30">
                    <div className="border-b border-gold-200 pb-2 md:pb-3 group">
                      <span className="text-xs md:text-sm text-primary-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-400"></span>
                        Full Name:
                      </span>
                      <p className="text-sm md:text-lg font-semibold text-gray-800 mt-0.5 md:mt-1">{mureed.fullName}</p>
                    </div>
                    
                    <div className="border-b border-gold-200 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-primary-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-400"></span>
                        Father Name:
                      </span>
                      <p className="text-sm md:text-lg font-semibold text-gray-800 mt-0.5 md:mt-1">{mureed.fatherName}</p>
                    </div>
                    
                    <div className="border-b border-gold-200 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-primary-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-400"></span>
                        Date Of Birth:
                      </span>
                      <p className="text-sm md:text-lg font-semibold text-gray-800 mt-0.5 md:mt-1">
                        {new Date(mureed.dateOfBirth).toISOString().split('T')[0]}
                      </p>
                    </div>
                    
                    <div className="border-b border-gold-200 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-primary-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-400"></span>
                        Country:
                      </span>
                      <p className="text-sm md:text-lg font-semibold text-gray-800 mt-0.5 md:mt-1">{mureed.country}</p>
                    </div>
                    
                    <div className="border-b border-gold-200 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-primary-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-400"></span>
                        City:
                      </span>
                      <p className="text-sm md:text-lg font-semibold text-gray-800 mt-0.5 md:mt-1">{mureed.city}</p>
                    </div>
                    
                    <div className="border-b border-gold-200 pb-2 md:pb-3">
                      <span className="text-xs md:text-sm text-primary-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-400"></span>
                        Address:
                      </span>
                      <p className="text-xs md:text-base text-gray-800 mt-0.5 md:mt-1">{mureed.address}</p>
                    </div>
                    
                    <div className="pb-1 md:pb-2">
                      <span className="text-xs md:text-sm text-primary-600 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold-400"></span>
                        Contact:
                      </span>
                      <p className="text-sm md:text-lg font-semibold text-gray-800 mt-0.5 md:mt-1">{mureed.contactNumber}</p>
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-start pt-2 md:pt-4 order-first md:order-last">
                    <div className="relative">
                      {/* Decorative ring */}
                      <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-br from-gold-400 via-primary-500 to-gold-400 rounded-full opacity-75 blur-sm"></div>
                      <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-2 md:border-4 border-white shadow-2xl">
                        <img
                          src={mureed.profilePicture}
                          alt={mureed.fullName}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t-2 border-primary-600 relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
                    <div className="text-center md:text-left">
                      <p className="text-xs md:text-sm text-primary-700 font-arabic leading-relaxed">
                        ہراسلامی ماہ کی چوتھی تاریخ کو شائع کو شیخ شانی و روحانی درس گاہ پر عزائے کا اہتمام کیا جاتا ہے۔
                      </p>
                      <p className="text-xs md:text-sm text-gold-600 mt-1 md:mt-2 font-medium">
                        🌐 www.shariqahmedtariqi.com
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-24 h-12 md:w-32 md:h-16 border border-gray-300 rounded-lg flex items-center justify-center bg-white shadow-sm overflow-hidden p-1">
                        <img 
                          src="https://res.cloudinary.com/du7qzhimu/image/upload/e_background_removal,f_png/v1769484522/shariq-website/products/nq2ruu8psj6wpzrv6dqe.jpg" 
                          alt="Signature" 
                          className="w-full h-full object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1 italic">Signature</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Bottom Border */}
              <div className="h-2 md:h-3 bg-gradient-to-r from-primary-600 via-gold-500 to-primary-600"></div>
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
