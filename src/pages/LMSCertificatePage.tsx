import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import {
  Award, Download, Share2,
  ChevronLeft, Loader2, X
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

const LMSCertificatePage = () => {
  const { certificateId } = useParams();
  const [searchParams] = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: async () => {
      const res = await api.get(`/lms/certificates/${certificateId}`);
      return res.data.data;
    }
  });

  const handleDownload = async () => {
    if (!certificate) return;
    
    try {
      setDownloading(true);
      
      const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const studentId = certificate.user?.studentId || certificate.user?.lmsStudentId || certificate.certificateNumber;
      
      // Generate QR code using qrcode library - toDataURL method
      let qrDataUrl = '';
      try {
        const QRCode = await import('qrcode');
        qrDataUrl = await QRCode.toDataURL(`https://sahibzadashariqahmedtariqi.com/lms/certificate/${certificate._id}`, {
          width: 150,
          margin: 1,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
        console.log('QR Code generated successfully');
      } catch (qrError) {
        console.error('QR Code generation failed:', qrError);
        // Fallback to external API
        qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://sahibzadashariqahmedtariqi.com/lms/certificate/${certificate._id}`)}`;
      }
      
      // Create fixed-size certificate HTML for download (LANDSCAPE)
      const downloadCard = document.createElement('div');
      
      downloadCard.innerHTML = `
        <div style="width: 1200px; height: 850px; background: linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #ecfdf5 100%); position: relative; overflow: hidden; font-family: Georgia, 'Times New Roman', serif; border: 10px double #d97706; border-radius: 16px; box-sizing: border-box;">
          
          <!-- Background Logo Watermark -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0.08;">
            <img src="${window.location.origin}/images/logo.png" alt="Watermark" style="width: 500px; height: 500px; object-fit: contain;" crossorigin="anonymous" />
          </div>
          
          <!-- Corner Decorations -->
          <div style="position: absolute; top: 20px; left: 20px; width: 100px; height: 100px; border-left: 5px solid #d97706; border-top: 5px solid #d97706; border-radius: 16px 0 0 0;"></div>
          <div style="position: absolute; top: 20px; right: 20px; width: 100px; height: 100px; border-right: 5px solid #d97706; border-top: 5px solid #d97706; border-radius: 0 16px 0 0;"></div>
          <div style="position: absolute; bottom: 20px; left: 20px; width: 100px; height: 100px; border-left: 5px solid #d97706; border-bottom: 5px solid #d97706; border-radius: 0 0 0 16px;"></div>
          <div style="position: absolute; bottom: 20px; right: 20px; width: 100px; height: 100px; border-right: 5px solid #d97706; border-bottom: 5px solid #d97706; border-radius: 0 0 16px 0;"></div>
          
          <div style="padding: 40px 60px; position: relative; z-index: 10; text-align: center; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
            
            <!-- Top Section -->
            <div>
              <!-- Bismillah -->
              <p style="color: #b45309; font-size: 22px; margin: 0 0 12px 0; font-family: serif;">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
              
              <!-- Logo and Name -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 12px;">
                <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 3px solid #059669; background: #065f46; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                  <img src="${window.location.origin}/images/logo.png" alt="Logo" style="width: 42px; height: 42px; object-fit: contain;" crossorigin="anonymous" />
                </div>
                <div style="text-align: left;">
                  <h2 style="font-size: 24px; font-weight: bold; color: #047857; font-style: italic; margin: 0;">
                    Sahibzada Shariq Ahmed Tariqi
                  </h2>
                  <p style="font-size: 11px; color: #059669; letter-spacing: 3px; margin: 2px 0 0 0;">
                    Spiritual Healing & Guidance
                  </p>
                </div>
              </div>
              
              <!-- Award Icon -->
              <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 8px;">
                <div style="width: 80px; height: 2px; background: linear-gradient(to right, transparent, #d97706, #d97706);"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                <div style="width: 80px; height: 2px; background: linear-gradient(to left, transparent, #d97706, #d97706);"></div>
              </div>
              
              <!-- Title -->
              <h1 style="font-size: 42px; font-weight: bold; color: #065f46; letter-spacing: 4px; margin: 0 0 4px 0;">
                Certificate of Completion
              </h1>
              <p style="color: #b45309; font-size: 12px; letter-spacing: 5px; text-transform: uppercase; font-weight: 600; margin: 0;">
                Sahibzada Shariq Ahmed Tariqi Academy
              </p>
            </div>
            
            <!-- Middle Section - Main Content -->
            <div style="margin: 16px 0;">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px 0;">This is to certify that</p>
              
              <h2 style="font-size: 36px; font-weight: bold; color: #047857; border-bottom: 3px solid #fbbf24; padding-bottom: 6px; display: inline-block; margin: 0 0 8px 0;">
                ${certificate.studentName}
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px 0;">has successfully completed the course</p>
              
              <h3 style="font-size: 28px; font-weight: 600; color: #1f2937; font-style: italic; margin: 0 0 10px 0;">
                "${certificate.courseTitle}"
              </h3>
              
              <p style="font-size: 13px; font-weight: 500; color: #374151; max-width: 700px; margin: 0 auto; line-height: 1.5;">
                Special Permission (Ijazat-e-Khaas) is granted for all teachings of this course and for the implementation of all prescribed practices.
              </p>
              
              <div style="margin-top: 10px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">Completed on</p>
                <p style="font-weight: 600; color: #1f2937; font-size: 15px; margin: 2px 0 0 0;">${completionDate}</p>
              </div>
            </div>
            
            <!-- Bottom Section - Signature -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 20px;">
              <!-- Instructor Signature -->
              <div style="text-align: center; flex: 1;">
                <div style="width: 150px; height: 55px; margin: 0 auto 6px auto; border: 1px solid #fcd34d; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #ecfdf5 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.08); overflow: hidden; padding: 4px;">
                  <img src="https://res.cloudinary.com/du7qzhimu/image/upload/v1769580381/shariq-website/products/pc9szshbrztkx4k9iki5.png" alt="Signature" style="width: 100%; height: 100%; object-fit: contain;" crossorigin="anonymous" />
                </div>
                <p style="font-size: 13px; font-weight: 600; color: #374151; margin: 0;">Sahibzada Shariq Ahmed Tariqi</p>
                <p style="font-size: 10px; color: #6b7280; margin: 2px 0 0 0;">Spiritual Guide & Teacher</p>
              </div>
              
              <!-- Official Stamp -->
              <div style="text-align: center; flex: 1;">
                <div style="position: relative; display: inline-block;">
                  <div style="width: 85px; height: 85px; border-radius: 50%; background: linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%); padding: 5px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); border: 3px solid #fbbf24; display: flex; align-items: center; justify-content: center;">
                    <img src="${window.location.origin}/images/certificate-stamp.png" alt="Official Stamp" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" crossorigin="anonymous" />
                  </div>
                  <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; font-size: 7px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    ✓ VERIFIED
                  </div>
                </div>
              </div>
              
              <!-- QR Code and Certificate Number -->
              <div style="text-align: center; flex: 1;">
                <div style="background: white; padding: 6px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; display: inline-block; margin-bottom: 6px;">
                  <img src="${qrDataUrl}" alt="QR Code" style="width: 80px; height: 80px; display: block;" />
                </div>
                <p style="font-size: 12px; font-family: monospace; color: #374151; margin: 0 0 4px 0; font-weight: 600;">${studentId}</p>
                <div style="width: 120px; border-bottom: 2px solid #9ca3af; margin: 0 auto 4px auto;"></div>
                <p style="font-size: 9px; color: #6b7280; margin: 0;">Certificate Number</p>
              </div>
            </div>
            
            <!-- Verification Footer -->
            <div style="text-align: center; margin-top: 8px;">
              <p style="font-size: 10px; color: #9ca3af; margin: 0;">
                Verify at: sahibzadashariqahmedtariqi.com/verify • Code: ${certificate.verificationCode}
              </p>
            </div>
          </div>
        </div>
      `;
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 1200px; background: white; z-index: -9999;';
      wrapper.appendChild(downloadCard);
      document.body.appendChild(wrapper);
      
      // Wait for all images to load properly
      const images = wrapper.querySelectorAll('img');
      const imageLoadPromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn('Image failed to load:', img.src);
              resolve(); // Still resolve to continue with download
            };
          }
        });
      });
      
      // Wait for images with timeout
      await Promise.race([
        Promise.all(imageLoadPromises),
        new Promise(resolve => setTimeout(resolve, 5000)) // 5 second timeout
      ]);
      
      // Additional delay for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const cardElement = downloadCard.firstElementChild as HTMLElement;
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 1200,
        height: 850,
        windowWidth: 1200,
        windowHeight: 850,
        imageTimeout: 20000,
      });
      
      document.body.removeChild(wrapper);
      
      const link = document.createElement('a');
      link.download = `Certificate-${certificate.studentName}-${certificate.courseTitle}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating certificate image:', error);
      toast.error('Failed to download certificate');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  // Auto download if ?download=true
  useEffect(() => {
    if (searchParams.get('download') === 'true' && certificate) {
      setTimeout(() => {
        handleDownload();
      }, 1000);
    }
  }, [certificate, searchParams]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate?.verificationCode}`;
    if (navigator.share) {
      await navigator.share({
        title: `${certificate?.studentName}'s Certificate`,
        text: `I completed ${certificate?.courseTitle} course by Sahibzada Shariq Ahmed Tariqi`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Certificate verification link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
            <p className="text-gray-600">The certificate you're looking for doesn't exist or you don't have access to it.</p>
            <Link
              to="/lms"
              className="inline-block mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Back to Courses
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="pt-20 pb-16 print:pt-0 print:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/lms"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-8 print:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Courses
          </Link>

          {/* Certificate Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white text-center">
              <Award className="w-16 h-16 mx-auto mb-3 text-amber-300" />
              <h1 className="text-2xl font-bold">Course Completed!</h1>
              <p className="text-emerald-100 mt-1">Congratulations on your achievement</p>
            </div>

            {/* Certificate Info */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">This certifies that</p>
                <h2 className="text-2xl font-bold text-emerald-700 mt-1">{certificate.studentName}</h2>
              </div>

              <div className="text-center">
                <p className="text-gray-500 text-sm">has successfully completed</p>
                <h3 className="text-xl font-semibold text-gray-800 mt-1">"{certificate.courseTitle}"</h3>
              </div>

              <div className="flex justify-center gap-8 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Completion Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Certificate ID</p>
                  <p className="font-mono font-semibold text-gray-800">
                    {certificate.user?.studentId || certificate.certificateNumber}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-800">
                  🎓 Special Permission (Ijazat-e-Khaas) is granted for all teachings of this course
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8 print:hidden px-4">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition shadow-lg"
            >
              <Award className="w-5 h-5" />
              Preview Certificate
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Print Certificate
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border rounded-xl hover:bg-gray-50 transition shadow-lg"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Certificate Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
              <div className="relative bg-white rounded-2xl max-w-5xl w-full my-4">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 rounded-t-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Certificate Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 bg-gray-100 overflow-y-auto max-h-[calc(100vh-180px)]">
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Preview of your certificate
                  </p>
                  
                  {/* Certificate Display - Landscape Format */}
                  <motion.div
                    ref={certificateRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-8 border-double border-amber-600 rounded-lg shadow-2xl overflow-hidden mx-auto"
                    style={{ 
                      width: '100%', 
                      maxWidth: '900px',
                      aspectRatio: '1200 / 850',
                      padding: 'clamp(16px, 3vw, 40px)'
                    }}
                  >
                    {/* Background Logo Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                      <img 
                        src="/images/logo.png" 
                        alt="Background Seal" 
                        className="w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] object-contain"
                      />
                    </div>

                    {/* Corner Decorations */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-12 sm:w-20 h-12 sm:h-20">
                      <div className="w-full h-full border-l-4 border-t-4 border-amber-600 rounded-tl-lg" />
                    </div>
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-12 sm:w-20 h-12 sm:h-20">
                      <div className="w-full h-full border-r-4 border-t-4 border-amber-600 rounded-tr-lg" />
                    </div>
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-12 sm:w-20 h-12 sm:h-20">
                      <div className="w-full h-full border-l-4 border-b-4 border-amber-600 rounded-bl-lg" />
                    </div>
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 w-12 sm:w-20 h-12 sm:h-20">
                      <div className="w-full h-full border-r-4 border-b-4 border-amber-600 rounded-br-lg" />
                    </div>

                    {/* Content - Flexbox for proper landscape fit */}
                    <div className="relative z-10 h-full flex flex-col justify-between text-center">
                      {/* Top Section */}
                      <div className="space-y-1">
                        {/* Bismillah */}
                        <p className="text-amber-700 text-sm sm:text-base" style={{ fontFamily: 'serif' }}>
                          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                        </p>

                        {/* Logo and Name */}
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-emerald-600 shadow-lg bg-emerald-800 flex items-center justify-center">
                            <img 
                              src="/images/logo.png" 
                              alt="Logo" 
                              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                            />
                          </div>
                          <div className="text-left">
                            <h2 className="text-xs sm:text-sm font-bold text-emerald-700 italic" style={{ fontFamily: 'Georgia, serif' }}>
                              Sahibzada Shariq Ahmed Tariqi
                            </h2>
                            <p className="text-[8px] sm:text-[10px] text-emerald-600 tracking-wider">
                              Spiritual Healing & Guidance
                            </p>
                          </div>
                        </div>

                        {/* Award Icon */}
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-amber-600" />
                          <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                          <div className="w-6 sm:w-8 h-0.5 bg-gradient-to-l from-transparent via-amber-600 to-amber-600" />
                        </div>

                        {/* Title */}
                        <h1 className="text-lg sm:text-2xl font-bold text-emerald-800 tracking-wide">
                          Certificate of Completion
                        </h1>
                        <p className="text-amber-700 text-[8px] sm:text-[10px] tracking-widest uppercase font-semibold">
                          Sahibzada Shariq Ahmed Tariqi Academy
                        </p>
                      </div>

                      {/* Middle Section - Main Content */}
                      <div className="space-y-1 py-2">
                        <p className="text-gray-600 text-xs sm:text-sm">This is to certify that</p>
                        
                        <h2 className="text-base sm:text-xl font-bold text-emerald-700 border-b-2 border-amber-400 pb-0.5 inline-block px-3">
                          {certificate.studentName}
                        </h2>
                        
                        <p className="text-gray-600 text-xs sm:text-sm">has successfully completed the course</p>
                        
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-800 italic">
                          "{certificate.courseTitle}"
                        </h3>
                        
                        <p className="text-[9px] sm:text-xs font-medium text-gray-700 px-4 leading-relaxed max-w-lg mx-auto">
                          Special Permission (Ijazat-e-Khaas) is granted for all teachings of this course.
                        </p>

                        {/* Completion Date */}
                        <div className="text-gray-600">
                          <p className="text-[8px] sm:text-[10px]">Completed on</p>
                          <p className="font-semibold text-gray-800 text-[10px] sm:text-xs">
                            {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Section - Signature, Stamp, QR */}
                      <div className="flex justify-between items-end px-2 sm:px-4">
                        {/* Instructor Signature */}
                        <div className="text-center flex-1">
                          <div className="w-20 sm:w-24 h-10 sm:h-12 mx-auto mb-0.5 border border-amber-300 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/50 shadow-sm overflow-hidden p-0.5">
                            <img 
                              src="https://res.cloudinary.com/du7qzhimu/image/upload/v1769580381/shariq-website/products/pc9szshbrztkx4k9iki5.png" 
                              alt="Signature" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-[8px] sm:text-[10px] font-semibold text-gray-700">Sahibzada Shariq Ahmed Tariqi</p>
                          <p className="text-[6px] sm:text-[8px] text-gray-500">Spiritual Guide & Teacher</p>
                        </div>

                        {/* Official Stamp */}
                        <div className="flex flex-col items-center flex-1">
                          <div className="relative">
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-50 via-white to-amber-100 p-1 shadow-xl border-2 border-amber-400">
                              <img 
                                src="/images/certificate-stamp.png" 
                                alt="Official Stamp" 
                                className="w-full h-full object-contain rounded-full"
                              />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[5px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                              ✓ VERIFIED
                            </div>
                          </div>
                        </div>

                        {/* QR Code and Certificate Number */}
                        <div className="text-center flex-1 flex flex-col items-center">
                          <div className="bg-white p-1 rounded-md shadow-sm border border-gray-200 mb-0.5">
                            <QRCodeSVG 
                              value={`https://shariqtariqi.com/verify-certificate/${certificate.verificationCode}`}
                              size={40}
                              level="M"
                              fgColor="#1f2937"
                              bgColor="#ffffff"
                            />
                          </div>
                          <p className="text-[8px] sm:text-[10px] font-mono text-gray-600 mb-0.5">
                            {certificate.user?.studentId || certificate.user?.lmsStudentId || certificate.certificateNumber}
                          </p>
                          <div className="w-20 sm:w-24 border-b border-gray-400 mb-0.5 mx-auto" />
                          <p className="text-[6px] sm:text-[8px] text-gray-500">Certificate Number</p>
                        </div>
                      </div>

                      {/* Verification Code Footer */}
                      <div className="text-center">
                        <p className="text-[6px] sm:text-[8px] text-gray-400">
                          Verify at: shariqtariqi.com/verify • Code: {certificate.verificationCode}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 border-t p-4 flex flex-col sm:flex-row justify-center gap-3 rounded-b-2xl">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      handleDownload();
                    }}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Print Certificate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default LMSCertificatePage;
