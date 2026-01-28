import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import {
  Award, Download, Share2,
  ChevronLeft
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';

const LMSCertificatePage = () => {
  const { certificateId } = useParams();
  const [searchParams] = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: async () => {
      const res = await api.get(`/lms/certificates/${certificateId}`);
      return res.data.data;
    }
  });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `Certificate-${certificate?.studentName}-${certificate?.courseTitle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating certificate image:', error);
      window.print();
    }
  };

  // Auto download if ?download=true
  useEffect(() => {
    if (searchParams.get('download') === 'true' && certificate && certificateRef.current) {
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
      alert('Certificate verification link copied to clipboard!');
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

          {/* Certificate Card */}
          <motion.div
            ref={certificateRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-8 border-double border-amber-600 rounded-lg shadow-2xl p-8 overflow-hidden print:shadow-none print:rounded-none"
          >
            {/* Background Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <img 
                src="/images/logo.png" 
                alt="Background Seal" 
                className="w-[350px] h-[350px] object-contain"
              />
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-20 h-20">
              <div className="w-full h-full border-l-4 border-t-4 border-amber-600 rounded-tl-lg" />
            </div>
            <div className="absolute top-4 right-4 w-20 h-20">
              <div className="w-full h-full border-r-4 border-t-4 border-amber-600 rounded-tr-lg" />
            </div>
            <div className="absolute bottom-4 left-4 w-20 h-20">
              <div className="w-full h-full border-l-4 border-b-4 border-amber-600 rounded-bl-lg" />
            </div>
            <div className="absolute bottom-4 right-4 w-20 h-20">
              <div className="w-full h-full border-r-4 border-b-4 border-amber-600 rounded-br-lg" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-4">
              {/* Bismillah */}
              <p className="text-amber-700 text-xl font-arabic" style={{ fontFamily: 'serif' }}>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>

              {/* Logo and Name */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-600 shadow-lg bg-emerald-800 flex items-center justify-center">
                  <img 
                    src="/images/logo.png" 
                    alt="Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-emerald-700 italic" style={{ fontFamily: 'Georgia, serif' }}>
                    Sahibzada Shariq Ahmed Tariqi
                  </h2>
                  <p className="text-xs text-emerald-600 tracking-wider">
                    Spiritual Healing & Guidance
                  </p>
                </div>
              </div>

              {/* Award Icon */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-amber-600" />
                <Award className="w-10 h-10 text-amber-600" />
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent via-amber-600 to-amber-600" />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-emerald-800 tracking-wide">
                Certificate of Completion
              </h1>
              <p className="text-amber-700 text-xs tracking-widest uppercase font-semibold">
                Sahibzada Shariq Ahmed Tariqi Academy
              </p>

              {/* Main Content */}
              <div className="space-y-3 py-4">
                <p className="text-gray-600 text-base">This is to certify that</p>
                
                <h2 className="text-2xl font-bold text-emerald-700 border-b-2 border-amber-400 pb-1 inline-block px-6">
                  {certificate.studentName}
                </h2>
                
                <p className="text-gray-600 text-base">has successfully completed the course</p>
                
                <h3 className="text-xl font-semibold text-gray-800 italic">
                  "{certificate.courseTitle}"
                </h3>
                
                <p className="text-sm font-bold text-gray-800 px-6 leading-relaxed">
                  Special Permission (Ijazat-e-Khaas) is granted for all teachings of this course and for the implementation of all prescribed practices.
                </p>

                {/* Completion Date */}
                <div className="text-gray-600">
                  <p className="text-xs">Completed on</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Signature Section */}
              <div className="flex justify-between items-end px-6 pt-4">
                {/* Instructor Signature */}
                <div className="text-center flex-1">
                  {/* Signature Box with Certificate Theme Colors */}
                  <div className="w-28 h-14 mx-auto mb-1 border border-amber-300 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/50 shadow-sm overflow-hidden p-1">
                    <img 
                      src="https://res.cloudinary.com/du7qzhimu/image/upload/v1769580381/shariq-website/products/pc9szshbrztkx4k9iki5.png" 
                      alt="Signature" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Sahibzada Shariq Ahmed Tariqi</p>
                  <p className="text-[10px] text-gray-500">Spiritual Guide & Teacher</p>
                </div>

                {/* Official Stamp */}
                <div className="flex flex-col items-center flex-1">
                  <div className="relative">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 via-white to-amber-100 p-1.5 shadow-xl border-2 border-amber-400">
                      <img 
                        src="/images/certificate-stamp.png" 
                        alt="Official Stamp" 
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[6px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      ✓ VERIFIED
                    </div>
                  </div>
                </div>

                {/* QR Code and Certificate Number */}
                <div className="text-center flex-1 flex flex-col items-center">
                  <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-200 mb-1">
                    <QRCodeSVG 
                      value={`https://shariqtariqi.com/verify-certificate/${certificate.verificationCode}`}
                      size={60}
                      level="M"
                      fgColor="#1f2937"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p className="text-xs font-mono text-gray-600 mb-1">
                    {certificate.user?.studentId || certificate.user?.lmsStudentId || certificate.certificateNumber}
                  </p>
                  <div className="w-32 border-b-2 border-gray-400 mb-1 mx-auto" />
                  <p className="text-[10px] text-gray-500">Certificate Number</p>
                </div>
              </div>

              {/* Verification Code */}
              <div className="text-center pt-2">
                <p className="text-[10px] text-gray-400">
                  Verify at: shariqtariqi.com/verify • Code: {certificate.verificationCode}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8 print:hidden">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border rounded-xl hover:bg-gray-50 transition"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default LMSCertificatePage;
