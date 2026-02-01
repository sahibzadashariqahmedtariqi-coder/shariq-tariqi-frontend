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
  const downloadRef = useRef<HTMLDivElement>(null);
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
    if (!certificate || !downloadRef.current) return;
    
    try {
      setDownloading(true);
      
      // Wait for images to load
      const images = downloadRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
      
      // Small delay for rendering
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(downloadRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 1200,
        height: 850,
      });
      
      const link = document.createElement('a');
      link.download = `Certificate-${certificate.studentName}-${certificate.courseTitle}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to download certificate');
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

      {/* Hidden Certificate for Download - Fixed 1200x850 */}
      {certificate && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div
            ref={downloadRef}
            style={{
              width: '1200px',
              height: '850px',
              background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #ecfdf5 100%)',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: 'Georgia, serif',
              border: '8px solid #d97706',
              borderRadius: '16px',
              boxSizing: 'border-box',
            }}
          >
            {/* Background Logo Watermark */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.1 }}>
              <img src="/images/logo.png" alt="Watermark" style={{ width: '350px', height: '350px', objectFit: 'contain' }} crossOrigin="anonymous" />
            </div>
            
            {/* Corner Decorations */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '80px', height: '80px', borderLeft: '4px solid #d97706', borderTop: '4px solid #d97706' }} />
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '80px', height: '80px', borderRight: '4px solid #d97706', borderTop: '4px solid #d97706' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '80px', height: '80px', borderLeft: '4px solid #d97706', borderBottom: '4px solid #d97706' }} />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '80px', height: '80px', borderRight: '4px solid #d97706', borderBottom: '4px solid #d97706' }} />
            
            <div style={{ padding: '30px 50px', position: 'relative', zIndex: 10, textAlign: 'center', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Top Section */}
              <div>
                {/* Bismillah */}
                <p style={{ color: '#b45309', fontSize: '22px', margin: '0 0 10px 0', fontFamily: 'serif' }}>
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
                
                {/* Logo and Name */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #059669', background: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/images/logo.png" alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} crossOrigin="anonymous" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#047857', fontStyle: 'italic', margin: 0 }}>
                      Sahibzada Shariq Ahmed Tariqi
                    </h2>
                    <p style={{ fontSize: '12px', color: '#059669', letterSpacing: '2px', margin: '2px 0 0 0' }}>
                      Spiritual Healing & Guidance
                    </p>
                  </div>
                </div>
                
                {/* Award Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '8px' }}>
                  <div style={{ width: '60px', height: '2px', background: 'linear-gradient(to right, transparent, #d97706)' }} />
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                  <div style={{ width: '60px', height: '2px', background: 'linear-gradient(to left, transparent, #d97706)' }} />
                </div>
                
                {/* Title */}
                <h1 style={{ fontSize: '44px', fontWeight: 'bold', color: '#065f46', margin: '0 0 4px 0' }}>
                  Certificate of Completion
                </h1>
                <p style={{ color: '#b45309', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>
                  SAHIBZADA SHARIQ AHMED TARIQI ACADEMY
                </p>
              </div>
              
              {/* Middle Section */}
              <div style={{ margin: '15px 0' }}>
                <p style={{ color: '#4b5563', fontSize: '18px', margin: '0 0 8px 0' }}>This is to certify that</p>
                
                <h2 style={{ fontSize: '38px', fontWeight: 'bold', color: '#047857', borderBottom: '3px solid #fbbf24', paddingBottom: '6px', display: 'inline-block', margin: '0 0 8px 0' }}>
                  {certificate.studentName}
                </h2>
                
                <p style={{ color: '#4b5563', fontSize: '18px', margin: '0 0 8px 0' }}>has successfully completed the course</p>
                
                <h3 style={{ fontSize: '30px', fontWeight: 600, color: '#1f2937', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                  "{certificate.courseTitle}"
                </h3>
                
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', maxWidth: '700px', margin: '0 auto', lineHeight: 1.5 }}>
                  Special Permission (Ijazat-e-Khaas) is granted for all teachings of this course.
                </p>
                
                <div style={{ marginTop: '12px' }}>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Completed on</p>
                  <p style={{ fontWeight: 600, color: '#1f2937', fontSize: '16px', margin: '2px 0 0 0' }}>
                    {new Date(certificate.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 30px' }}>
                {/* Instructor Signature */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '150px', height: '55px', margin: '0 auto 6px auto', border: '1px solid #fcd34d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #ecfdf5 100%)', overflow: 'hidden', padding: '4px' }}>
                    <img src="https://res.cloudinary.com/du7qzhimu/image/upload/v1769580381/shariq-website/products/pc9szshbrztkx4k9iki5.png" alt="Signature" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: 0 }}>Sahibzada Shariq Ahmed Tariqi</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0 0' }}>Spiritual Guide & Teacher</p>
                </div>
                
                {/* Official Stamp */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%)', padding: '4px', border: '3px solid #fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/images/certificate-stamp.png" alt="Official Stamp" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} crossOrigin="anonymous" />
                    </div>
                    <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '9999px' }}>
                      ✓ VERIFIED
                    </div>
                  </div>
                </div>
                
                {/* QR Code */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', display: 'inline-block', marginBottom: '6px' }}>
                    <QRCodeSVG 
                      value={`https://sahibzadashariqahmedtariqi.com/lms/certificate/${certificate._id}`}
                      size={80}
                      level="M"
                      fgColor="#1f2937"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#374151', margin: '0 0 4px 0', fontWeight: 600 }}>
                    {certificate.user?.studentId || certificate.user?.lmsStudentId || certificate.certificateNumber}
                  </p>
                  <div style={{ width: '120px', borderBottom: '2px solid #9ca3af', margin: '0 auto 4px auto' }} />
                  <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Certificate Number</p>
                </div>
              </div>
              
              {/* Verification Footer */}
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                  Verify at: sahibzadashariqahmedtariqi.com/verify • Code: {certificate.verificationCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default LMSCertificatePage;
