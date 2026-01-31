import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Play, Lock, CheckCircle, Clock, Award,
  User, ChevronRight, FileText, Users, ChevronLeft
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../services/api';
import toast from 'react-hot-toast';

const LMSCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch course details for enrolled student
  const { data, isLoading, error } = useQuery({
    queryKey: ['lms-course', courseId],
    queryFn: async () => {
      const res = await api.get(`/lms/courses/${courseId}/learn`);
      return res.data.data;
    },
    retry: false
  });

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/lms/certificates/generate', { courseId });
      return res.data;
    },
    onSuccess: (response) => {
      toast.success('Certificate generated!');
      queryClient.invalidateQueries({ queryKey: ['lms-course'] });
      navigate(`/lms/certificate/${response.data._id}`);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
            <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              {(error as any)?.response?.data?.message || 'You are not enrolled in this course'}
            </p>
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

  if (!data) return null;

  const { course, enrollment, classes, progressMap } = data;
  const isCourseCompleted = enrollment.status === 'completed';

  // Group classes by section
  const classesbySection: Record<string, typeof classes> = {};
  classes.forEach((classItem: any) => {
    const section = classItem.section || 'General';
    if (!classesbySection[section]) {
      classesbySection[section] = [];
    }
    classesbySection[section].push(classItem);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />

      <main className="pt-20">
        {/* Back to LMS Dashboard Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/lms"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to My Courses
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-gray-900 to-emerald-900 text-white">
          <div className="absolute inset-0 opacity-20">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {course.level}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-6">{course.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    <span>{course.totalClasses} Classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{course.enrollmentCount} Students</span>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-xl">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className="text-emerald-500"
                        strokeWidth="8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 56}`,
                          strokeDashoffset: `${2 * Math.PI * 56 * (1 - enrollment.progress.percentage / 100)}`
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-emerald-600">
                        {enrollment.progress.percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-gray-600">
                    {enrollment.progress.completedClasses} of {enrollment.progress.totalClasses} classes completed
                  </p>
                </div>

                {isCourseCompleted ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 py-3 bg-emerald-100 text-emerald-700 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Course Completed!</span>
                    </div>
                    {course.certificateEnabled && (
                      enrollment.certificateIssued ? (
                        <Link
                          to={`/lms/certificate/${enrollment.certificateId}`}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                        >
                          <Award className="w-5 h-5" />
                          View Certificate
                        </Link>
                      ) : (
                        <button
                          onClick={() => generateCertificateMutation.mutate()}
                          disabled={generateCertificateMutation.isPending}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
                        >
                          <Award className="w-5 h-5" />
                          {generateCertificateMutation.isPending ? 'Generating...' : 'Get Certificate'}
                        </button>
                      )
                    )}
                  </div>
                ) : enrollment.progress.lastAccessedClass ? (
                  <Link
                    to={`/lms/watch/${enrollment.progress.lastAccessedClass}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Play className="w-5 h-5" />
                    Continue Learning
                  </Link>
                ) : (
                  <Link
                    to={`/lms/watch/${classes[0]?._id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Play className="w-5 h-5" />
                    Start Learning
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>

          <div className="space-y-4">
            {Object.entries(classesbySection).map(([section, sectionClasses], sectionIndex) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Section Header */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{section}</h3>
                    <span className="text-sm text-gray-500">
                      {sectionClasses.length} classes
                    </span>
                  </div>
                </div>

                {/* Classes */}
                <div className="divide-y">
                  {sectionClasses.map((classItem: any, classIndex: number) => {
                    const progress = progressMap[classItem._id];
                    const isCompleted = progress?.status === 'completed';
                    const isLocked = classItem.isLocked;

                    return (
                      <div
                        key={classItem._id}
                        className={`flex items-center gap-4 p-4 transition ${
                          isLocked ? 'opacity-60' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isLocked) {
                            navigate(`/lms/watch/${classItem._id}`);
                          }
                        }}
                      >
                        {/* Status Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-600'
                            : isLocked
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </div>

                        {/* Class Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Class {classIndex + 1}</span>
                            {classItem.pdfAttachment && (
                              <FileText className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900">{classItem.title}</h4>
                        </div>

                        {/* Progress/Duration */}
                        <div className="text-right">
                          {isCompleted ? (
                            <span className="text-sm text-emerald-600 font-medium">Completed</span>
                          ) : progress?.watchProgress > 0 ? (
                            <div className="w-20">
                              <div className="text-xs text-gray-500 mb-1">
                                {Math.round(progress.watchProgress)}%
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${progress.watchProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : classItem.duration ? (
                            <span className="text-sm text-gray-500">
                              {Math.round(classItem.duration / 60)} min
                            </span>
                          ) : null}
                        </div>

                        {/* Arrow */}
                        {!isLocked && (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LMSCoursePage;
