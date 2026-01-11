import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Award, Download, Share2, Calendar,
  BookOpen, Shield, ChevronLeft
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';

const LMSCertificatePage = () => {
  const { certificateId } = useParams();

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: async () => {
      const res = await api.get(`/lms/certificates/${certificateId}`);
      return res.data.data;
    }
  });

  const handleDownload = () => {
    // In production, this would generate a PDF
    window.print();
  };

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
          >
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-center text-white print:py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white/20 rounded-full">
                  <Award className="w-12 h-12" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Certificate of Completion</h1>
              <p className="text-emerald-100">Sahibzada Shariq Ahmed Tariqi - Spiritual Healing Academy</p>
            </div>

            {/* Certificate Body */}
            <div className="p-8 lg:p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">This is to certify that</p>

              <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                {certificate.studentName}
              </h2>

              {certificate.studentId && (
                <p className="text-gray-500 mb-6">Student ID: {certificate.studentId}</p>
              )}

              <p className="text-gray-600 text-lg mb-4">has successfully completed the course</p>

              <h3 className="text-2xl font-bold text-emerald-600 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                {certificate.courseTitle}
              </h3>

              <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
                <BookOpen className="w-5 h-5" />
                <span>{certificate.courseCategory}</span>
              </div>

              {/* Completion Date */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 rounded-full text-amber-700 mb-8">
                <Calendar className="w-5 h-5" />
                <span>
                  Completed on{' '}
                  {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {/* Signature Section */}
              <div className="border-t pt-8 mt-8">
                <div className="max-w-xs mx-auto">
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-2xl text-gray-400 italic" style={{ fontFamily: 'cursive' }}>
                      Shariq Ahmed Tariqi
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <p className="font-medium text-gray-900">Sahibzada Shariq Ahmed Tariqi</p>
                    <p className="text-sm text-gray-500">Instructor & Spiritual Healer</p>
                  </div>
                </div>
              </div>

              {/* Verification Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Verified Certificate</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Certificate Number</p>
                    <p className="font-mono font-bold text-gray-900">{certificate.certificateNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Verification Code</p>
                    <p className="font-mono font-bold text-gray-900">{certificate.verificationCode}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Verify at: {window.location.origin}/verify-certificate/{certificate.verificationCode}
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
