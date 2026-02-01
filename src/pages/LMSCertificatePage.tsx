import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
      
      // Generate QR code as canvas using qrcode library
      const QRCode = await import('qrcode');
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, `https://sahibzadashariqahmedtariqi.com/lms/certificate/${certificate._id}`, {
        width: 100,
        margin: 1,
        color: { dark: '#1f2937', light: '#ffffff' }
      });
      
      // Create main canvas for certificate (Landscape 1200x850)
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext('2d')!;
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1200, 850);
      gradient.addColorStop(0, '#fffbeb');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#ecfdf5');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 850);
      
      // Border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 10;
      ctx.strokeRect(15, 15, 1170, 820);
      ctx.lineWidth = 3;
      ctx.strokeRect(25, 25, 1150, 800);
      
      // Corner decorations
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#d97706';
      // Top-left
      ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(40, 40); ctx.lineTo(120, 40); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(1160, 40); ctx.lineTo(1080, 40); ctx.moveTo(1160, 40); ctx.lineTo(1160, 120); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(40, 730); ctx.lineTo(40, 810); ctx.lineTo(120, 810); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(1160, 730); ctx.lineTo(1160, 810); ctx.lineTo(1080, 810); ctx.stroke();
      
      // Bismillah
      ctx.fillStyle = '#b45309';
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', 600, 80);
      
      // Header text
      ctx.fillStyle = '#047857';
      ctx.font = 'italic bold 28px Georgia';
      ctx.fillText('Sahibzada Shariq Ahmed Tariqi', 600, 130);
      ctx.fillStyle = '#059669';
      ctx.font = '12px Arial';
      ctx.letterSpacing = '3px';
      ctx.fillText('Spiritual Healing & Guidance', 600, 150);
      
      // Award icon (simple representation)
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(600, 190, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(585, 210); ctx.lineTo(600, 240); ctx.lineTo(615, 210);
      ctx.stroke();
      
      // Lines beside award
      ctx.beginPath(); ctx.moveTo(500, 190); ctx.lineTo(570, 190); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(630, 190); ctx.lineTo(700, 190); ctx.stroke();
      
      // Certificate of Completion
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 46px Georgia';
      ctx.fillText('Certificate of Completion', 600, 280);
      
      // Academy name
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 13px Arial';
      ctx.fillText('SAHIBZADA SHARIQ AHMED TARIQI ACADEMY', 600, 310);
      
      // This is to certify
      ctx.fillStyle = '#4b5563';
      ctx.font = '18px Georgia';
      ctx.fillText('This is to certify that', 600, 370);
      
      // Student name
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 38px Georgia';
      ctx.fillText(certificate.studentName, 600, 420);
      
      // Underline for name
      const nameWidth = ctx.measureText(certificate.studentName).width;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(600 - nameWidth/2 - 20, 430);
      ctx.lineTo(600 + nameWidth/2 + 20, 430);
      ctx.stroke();
      
      // has successfully completed
      ctx.fillStyle = '#4b5563';
      ctx.font = '18px Georgia';
      ctx.fillText('has successfully completed the course', 600, 470);
      
      // Course title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'italic bold 30px Georgia';
      ctx.fillText(`"${certificate.courseTitle}"`, 600, 520);
      
      // Ijazat text
      ctx.fillStyle = '#374151';
      ctx.font = '14px Georgia';
      const ijazatText = 'Special Permission (Ijazat-e-Khaas) is granted for all teachings of this course';
      const ijazatText2 = 'and for the implementation of all prescribed practices.';
      ctx.fillText(ijazatText, 600, 560);
      ctx.fillText(ijazatText2, 600, 580);
      
      // Completion date
      ctx.fillStyle = '#6b7280';
      ctx.font = '13px Arial';
      ctx.fillText('Completed on', 600, 620);
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(completionDate, 600, 640);
      
      // Bottom section - Signature (Left)
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Sahibzada Shariq Ahmed Tariqi', 250, 760);
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      ctx.fillText('Spiritual Guide & Teacher', 250, 778);
      // Signature line
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 1;
      ctx.strokeRect(175, 700, 150, 50);
      
      // Stamp (Center)
      ctx.beginPath();
      ctx.arc(600, 730, 45, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 8px Arial';
      ctx.fillText('✓ VERIFIED', 600, 785);
      
      // QR Code (Right) - Draw the generated QR canvas
      ctx.drawImage(qrCanvas, 900, 680, 90, 90);
      
      // Certificate number
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(studentId, 945, 785);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(880, 795);
      ctx.lineTo(1010, 795);
      ctx.stroke();
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.fillText('Certificate Number', 945, 810);
      
      // Verification footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px Arial';
      ctx.fillText(`Verify at: sahibzadashariqahmedtariqi.com/verify • Code: ${certificate.verificationCode}`, 600, 835);
      
      // Download
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

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default LMSCertificatePage;
