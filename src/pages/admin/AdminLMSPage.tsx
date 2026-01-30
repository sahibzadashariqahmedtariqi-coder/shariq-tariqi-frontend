import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { QRCodeSVG } from 'qrcode.react';
import {
  BookOpen, Plus, Edit, Lock, Unlock,
  Users, Play, FileText, Video, Award, Search,
  ChevronDown, ChevronRight, X, Save, GripVertical,
  AlertTriangle, ArrowLeft, UserPlus, Key, ToggleLeft, ToggleRight, GraduationCap, Trash2, BookPlus, Check, Clock,
  Wallet, Calendar, CreditCard, CheckCircle2, AlertCircle, Receipt, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface LMSCourse {
  _id: string;
  title: string;
  description: string;
  image: string;  // Changed from thumbnail to image (Course model uses 'image')
  instructor: string;
  category: string;
  level: string;
  duration: string;
  isPaid: boolean;  // Course model uses isPaid instead of courseType
  price?: number;
  isLMSEnabled: boolean;  // New field from integration
  lmsStatus: 'draft' | 'published' | 'archived';  // Changed from status
  totalClasses: number;
  enrollmentCount: number;
  certificateEnabled: boolean;
  isActive: boolean;
  createdAt: string;
}

interface LMSClass {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  videoId?: string;
  videoPlatform: string;
  duration?: number;
  section: string;
  order: number;
  isLocked: boolean;
  isPublished: boolean;
  isPreview: boolean;
  pdfAttachment?: {
    url: string;
    filename: string;
  };
}

interface Enrollment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    studentId?: string;
    isPaidStudent: boolean;
    isLMSStudent?: boolean;
    lmsStudentId?: string;
  };
  enrollmentType: string;
  status: string;
  progress: {
    completedClasses: number;
    totalClasses: number;
    percentage: number;
  };
  accessBlocked: boolean;
  blockedReason?: string;
  feeDefaulter: boolean;
  enrolledAt: string;
}

interface LMSStudent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  lmsStudentId: string;
  lmsAccessEnabled: boolean;
  enrolledCourses: number;
  enrolledCoursesList?: {
    courseId: string;
    courseTitle: string;
    enrollmentId: string;
    status: string;
  }[];
  createdAt: string;
  lmsCreatedBy?: {
    name: string;
    email: string;
  };
}

interface LMSFee {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    lmsStudentId: string;
    phone?: string;
  };
  month: string;
  year: number;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount: number;
  paidDate?: string;
  dueDate: string;
  paymentMethod?: string;
  transactionId?: string;
  remarks?: string;
  createdAt: string;
}

const AdminLMSPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'fees' | 'certificates'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showStudentEnrollModal, setShowStudentEnrollModal] = useState(false);
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<LMSStudent | null>(null);
  const [editingCourse, setEditingCourse] = useState<LMSCourse | null>(null);
  const [editingClass, setEditingClass] = useState<LMSClass | null>(null);
  const [editingStudent, setEditingStudent] = useState<LMSStudent | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Fee management state
  const [feeFilterMonth, setFeeFilterMonth] = useState('');
  const [feeFilterYear, setFeeFilterYear] = useState(new Date().getFullYear());
  const [feeFilterStatus, setFeeFilterStatus] = useState<string>('');

  // Redirect to login if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Fetch courses
  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ['lms-courses'],
    queryFn: async () => {
      const res = await api.get('/lms/courses');
      return res.data.data;
    }
  });

  // Fetch classes for selected course
  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ['lms-classes', expandedCourse],
    queryFn: async () => {
      if (!expandedCourse) return [];
      const res = await api.get(`/lms/courses/${expandedCourse}/classes`);
      return res.data.data;
    },
    enabled: !!expandedCourse
  });

  // Fetch enrollments for selected course
  const { data: enrollmentsData, refetch: refetchEnrollments, isLoading: loadingEnrollmentsData } = useQuery({
    queryKey: ['lms-enrollments', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      console.log('Fetching enrollments for course:', selectedCourse);
      const res = await api.get(`/lms/courses/${selectedCourse}/enrollments`);
      console.log('Enrollments response:', res.data);
      return res.data.data;
    },
    enabled: !!selectedCourse && showEnrollModal,
    refetchOnMount: 'always',
    staleTime: 0
  });

  // Refetch enrollments when modal opens with a course selected
  useEffect(() => {
    if (showEnrollModal && selectedCourse) {
      console.log('Modal opened, refetching enrollments for:', selectedCourse);
      refetchEnrollments();
    }
  }, [showEnrollModal, selectedCourse, refetchEnrollments]);

  // Fetch all LMS students
  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['lms-students'],
    queryFn: async () => {
      const res = await api.get('/lms/students');
      return res.data.data;
    },
    enabled: activeTab === 'students' || activeTab === 'fees' || showStudentModal || showEnrollModal
  });

  // Fetch all users for enrollment
  const { data: _usersData } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return res.data.data;
    },
    enabled: showEnrollModal
  });

  // Fetch all fees
  const { data: feesData, isLoading: loadingFees } = useQuery({
    queryKey: ['lms-fees', feeFilterMonth, feeFilterYear, feeFilterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (feeFilterMonth) params.append('month', feeFilterMonth);
      if (feeFilterYear) params.append('year', feeFilterYear.toString());
      if (feeFilterStatus) params.append('status', feeFilterStatus);
      const res = await api.get(`/lms/fees?${params.toString()}`);
      return res.data;
    },
    enabled: activeTab === 'fees'
  });

  // LMS Student Mutations
  const createStudentMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; phone?: string }) => {
      const res = await api.post('/lms/students', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-students'] });
      setShowStudentModal(false);
      setEditingStudent(null);
      toast.success('Student created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create student');
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/lms/students/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-students'] });
      setShowStudentModal(false);
      setEditingStudent(null);
      toast.success('Student updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update student');
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/lms/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  });

  const toggleStudentAccessMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/lms/students/${id}/toggle-access`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lms-students'] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle access');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await api.put(`/lms/students/${id}/reset-password`, { newPassword });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  // Fee Mutations
  const updateFeeMutation = useMutation({
    mutationFn: async ({ feeId, data }: { feeId: string; data: any }) => {
      const res = await api.put(`/lms/fees/${feeId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-fees'] });
      toast.success('Fee updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update fee');
    }
  });

  const deleteFeeMutation = useMutation({
    mutationFn: async (feeId: string) => {
      await api.delete(`/lms/fees/${feeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-fees'] });
      queryClient.invalidateQueries({ queryKey: ['student-fees'] });
      toast.success('Fee record deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete fee');
    }
  });

  const generateFeesMutation = useMutation({
    mutationFn: async (data: { month: string; year: number; amount: number; dueDate: string }) => {
      const res = await api.post('/lms/fees/generate', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lms-fees'] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate fees');
    }
  });

  // Mutations
  const enableLMSMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.put(`/lms/courses/${courseId}/enable-lms`, {
        certificateEnabled: true,
        certificateTemplate: 'islamic'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-courses'] });
      toast.success('LMS enabled for this course! You can now add classes.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enable LMS');
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.put(`/lms/courses/${courseId}/toggle-publish`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-courses'] });
      toast.success('Course publish status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to toggle publish');
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/lms/courses/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-courses'] });
      setShowCourseModal(false);
      setEditingCourse(null);
      toast.success('LMS settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  });

  const addClassMutation = useMutation({
    mutationFn: async ({ courseId, formData }: { courseId: string; formData: FormData }) => {
      const res = await api.post(`/lms/courses/${courseId}/classes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-classes'] });
      queryClient.invalidateQueries({ queryKey: ['lms-courses'] });
      setShowClassModal(false);
      toast.success('Class added successfully! ✅');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add class');
      console.error('Add class error:', error);
    }
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const res = await api.put(`/lms/classes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-classes'] });
      setShowClassModal(false);
      setEditingClass(null);
      toast.success('Class updated');
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/lms/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-classes'] });
      queryClient.invalidateQueries({ queryKey: ['lms-courses'] });
      toast.success('Class deleted');
    }
  });

  const toggleClassLockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/lms/classes/${id}/toggle-lock`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-classes'] });
      toast.success('Class lock status updated');
    }
  });

  const enrollStudentMutation = useMutation({
    mutationFn: async (data: { userId: string; courseId: string }) => {
      const res = await api.post('/lms/enroll', data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lms-enrollments', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['lms-students'] });
      queryClient.invalidateQueries({ queryKey: ['lms-courses'] });
      toast.success('Student enrolled successfully');
      // Refetch enrollments
      refetchEnrollments();
    }
  });

  // Bulk enroll student in multiple courses
  const bulkEnrollMutation = useMutation({
    mutationFn: async (data: { userId: string; courseIds: string[] }) => {
      // Enroll in each course
      const results = await Promise.all(
        data.courseIds.map(courseId => 
          api.post('/lms/enroll', { userId: data.userId, courseId })
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['lms-students'] });
      setShowStudentEnrollModal(false);
      setSelectedStudentForEnroll(null);
      toast.success('Student enrolled in selected courses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enroll in some courses');
    }
  });

  const toggleEnrollmentAccessMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.put(`/lms/enrollments/${id}/block`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-enrollments'] });
      toast.success('Access updated');
    }
  });

  const blockDefaultersMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.put(`/lms/courses/${courseId}/block-defaulters`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lms-enrollments'] });
      toast.success(`${data.blockedCount} fee defaulters blocked`);
    }
  });

  const unlockAllClassesMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.put(`/lms/courses/${courseId}/unlock-all`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-classes'] });
      toast.success('All classes unlocked');
    }
  });

  const lockAllClassesMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.put(`/lms/courses/${courseId}/lock-all`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-classes'] });
      toast.success('All classes locked');
    }
  });

  const filteredCourses = coursesData?.filter((course: LMSCourse) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = ['all', 'spiritual', 'hikmat'];

  return (
    <>
      <Helmet>
        <title>LMS Management | Admin Dashboard</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-8">
          {/* Back Link */}
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </Link>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                  Learning Management System
                </h1>
                <p className="text-gray-600 mt-1">Manage courses, classes, and student enrollments</p>
                <p className="text-sm text-emerald-600 mt-1">
                  Courses are synced from <Link to="/admin/courses" className="underline hover:text-emerald-700">Course Management</Link>
                </p>
              </div>
            </div>

            {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coursesData?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {coursesData?.reduce((acc: number, c: LMSCourse) => acc + c.totalClasses, 0) || 0}
                </p>
                <p className="text-sm text-gray-600">Total Classes</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {coursesData?.reduce((acc: number, c: LMSCourse) => acc + c.enrollmentCount, 0) || 0}
                </p>
                <p className="text-sm text-gray-600">Total Enrollments</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Certificates Issued</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'courses'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Courses & Classes
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'students'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              LMS Students
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition flex items-center gap-1.5 ${
                activeTab === 'fees'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Fee Management
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'certificates'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Certificates
            </button>
          </nav>
        </div>

        {activeTab === 'courses' && (
          <>
            {/* Search and Filter */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Courses List */}
            {loadingCourses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                <p className="text-gray-500 mt-1">Create your first course to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course: LMSCourse) => (
                  <div key={course._id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    {/* Course Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{course.title}</h3>
                            {course.isLMSEnabled ? (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                course.lmsStatus === 'published' ? 'bg-green-100 text-green-700' :
                                course.lmsStatus === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                LMS: {course.lmsStatus}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                LMS Not Enabled
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              (course.isPaid || (course.price ?? 0) > 0) ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {(course.isPaid || (course.price ?? 0) > 0) ? `₨${course.price?.toLocaleString() || 0}` : 'Free'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{course.category}</span>
                            <span>•</span>
                            <span>{course.level}</span>
                            <span>•</span>
                            <span>{course.totalClasses} classes</span>
                            <span>•</span>
                            <span>{course.enrollmentCount} enrolled</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!course.isLMSEnabled ? (
                            <button
                              onClick={() => enableLMSMutation.mutate(course._id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                              title="Enable LMS for this course"
                            >
                              <Plus className="w-4 h-4" />
                              Enable LMS
                            </button>
                          ) : (
                            <>
                              {course.lmsStatus !== 'published' ? (
                                <button
                                  onClick={() => togglePublishMutation.mutate(course._id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200"
                                  title="Publish LMS Course"
                                >
                                  <Eye className="w-4 h-4" />
                                  Publish
                                </button>
                              ) : (
                                <button
                                  onClick={() => togglePublishMutation.mutate(course._id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  title="Unpublish LMS Course"
                                >
                                  <EyeOff className="w-4 h-4" />
                                  Unpublish
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedCourse(course._id);
                                  setShowEnrollModal(true);
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="Manage Enrollments"
                              >
                                <Users className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setExpandedCourse(course._id);
                                  setEditingClass(null);
                                  setShowClassModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Add Class"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCourse(course);
                                  setShowCourseModal(true);
                                }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Edit LMS Settings"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {expandedCourse === course._id ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Classes Section */}
                    <AnimatePresence>
                      {expandedCourse === course._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t bg-gray-50"
                        >
                          {/* Class Actions */}
                          <div className="p-3 border-b bg-gray-100 flex justify-between items-center">
                            <h4 className="font-medium text-gray-700">Classes</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => unlockAllClassesMutation.mutate(course._id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                              >
                                <Unlock className="w-4 h-4" />
                                Unlock All
                              </button>
                              <button
                                onClick={() => lockAllClassesMutation.mutate(course._id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                              >
                                <Lock className="w-4 h-4" />
                                Lock All
                              </button>
                            </div>
                          </div>

                          {loadingClasses ? (
                            <div className="p-4 text-center text-gray-500">Loading classes...</div>
                          ) : classesData?.length === 0 ? (
                            <div className="p-8 text-center">
                              <Video className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">No classes yet</p>
                              <button
                                onClick={() => {
                                  setEditingClass(null);
                                  setShowClassModal(true);
                                }}
                                className="mt-2 text-emerald-600 hover:underline"
                              >
                                Add your first class
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 space-y-2">
                              {classesData?.map((classItem: LMSClass, index: number) => (
                                <div
                                  key={classItem._id}
                                  className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                                >
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <GripVertical className="w-4 h-4" />
                                    <span className="text-sm font-medium">{index + 1}</span>
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Play className="w-4 h-4 text-emerald-600" />
                                      <span className="font-medium">{classItem.title}</span>
                                      {classItem.isLocked && (
                                        <Lock className="w-4 h-4 text-red-500" />
                                      )}
                                      {!classItem.isPublished && (
                                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                                          Draft
                                        </span>
                                      )}
                                      {classItem.isPreview && (
                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                          Preview
                                        </span>
                                      )}
                                      {classItem.pdfAttachment && (
                                        <FileText className="w-4 h-4 text-orange-500" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                      {classItem.section && `${classItem.section} • `}
                                      {classItem.duration ? `${Math.round(classItem.duration / 60)} min` : 'Duration not set'}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => toggleClassLockMutation.mutate(classItem._id)}
                                      className={`p-2 rounded-lg ${
                                        classItem.isLocked
                                          ? 'text-red-600 hover:bg-red-50'
                                          : 'text-green-600 hover:bg-green-50'
                                      }`}
                                      title={classItem.isLocked ? 'Unlock Class' : 'Lock Class'}
                                    >
                                      {classItem.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingClass(classItem);
                                        setShowClassModal(true);
                                      }}
                                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('Delete this class?')) {
                                          deleteClassMutation.mutate(classItem._id);
                                        }
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <StudentsSection 
            students={studentsData || []}
            loading={loadingStudents}
            onCreateStudent={() => {
              setEditingStudent(null);
              setShowStudentModal(true);
            }}
            onEditStudent={(student) => {
              setEditingStudent(student);
              setShowStudentModal(true);
            }}
            onDeleteStudent={(id) => {
              if (window.confirm('Are you sure? This will delete all enrollments for this student.')) {
                deleteStudentMutation.mutate(id);
              }
            }}
            onToggleAccess={(id) => toggleStudentAccessMutation.mutate(id)}
            onResetPassword={(id, newPassword) => resetPasswordMutation.mutate({ id, newPassword })}
            onEnrollInCourses={(student) => {
              setSelectedStudentForEnroll(student);
              setShowStudentEnrollModal(true);
            }}
          />
        )}

        {/* Fee Management Tab */}
        {activeTab === 'fees' && (
          <FeeManagementSection
            feesData={feesData}
            loadingFees={loadingFees}
            students={studentsData || []}
            feeFilterMonth={feeFilterMonth}
            feeFilterYear={feeFilterYear}
            feeFilterStatus={feeFilterStatus}
            setFeeFilterMonth={setFeeFilterMonth}
            setFeeFilterYear={setFeeFilterYear}
            setFeeFilterStatus={setFeeFilterStatus}
            onDeleteFee={(feeId) => {
              if (window.confirm('Are you sure you want to delete this fee record?')) {
                deleteFeeMutation.mutate(feeId);
              }
            }}
            onGenerateFees={(data) => generateFeesMutation.mutate(data)}
            onUpdateFeeStatus={(feeId, data) => updateFeeMutation.mutate({ feeId, data })}
          />
        )}

        {activeTab === 'certificates' && (
          <CertificatesSection courses={coursesData || []} />
        )}

        {/* Student Modal */}
        <StudentModal
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setEditingStudent(null);
          }}
          student={editingStudent}
          onSave={(data) => {
            if (editingStudent) {
              updateStudentMutation.mutate({ id: editingStudent._id, data });
            } else {
              createStudentMutation.mutate(data);
            }
          }}
          isLoading={createStudentMutation.isPending || updateStudentMutation.isPending}
        />

        {/* Course Modal - LMS Settings Only */}
        <CourseModal
          isOpen={showCourseModal}
          onClose={() => {
            setShowCourseModal(false);
            setEditingCourse(null);
          }}
          course={editingCourse}
          onSave={(data) => {
            if (editingCourse) {
              updateCourseMutation.mutate({ id: editingCourse._id, data });
            }
          }}
          isLoading={updateCourseMutation.isPending}
        />

        {/* Class Modal */}
        <ClassModal
          isOpen={showClassModal}
          onClose={() => {
            setShowClassModal(false);
            setEditingClass(null);
          }}
          classItem={editingClass}
          courseId={expandedCourse}
          onSave={(formData) => {
            if (editingClass) {
              updateClassMutation.mutate({ id: editingClass._id, formData });
            } else if (expandedCourse) {
              addClassMutation.mutate({ courseId: expandedCourse, formData });
            }
          }}
          isLoading={addClassMutation.isPending || updateClassMutation.isPending}
        />

        {/* Enrollment Modal */}
        <EnrollmentModal
          isOpen={showEnrollModal}
          onClose={() => {
            setShowEnrollModal(false);
            setSelectedCourse(null);
          }}
          courseId={selectedCourse}
          enrollments={enrollmentsData || []}
          users={studentsData || []}
          isLoadingEnrollments={loadingEnrollmentsData}
          onEnroll={(userId) => {
            if (selectedCourse) {
              enrollStudentMutation.mutate({ userId, courseId: selectedCourse });
            }
          }}
          onToggleAccess={(enrollmentId, reason) => {
            toggleEnrollmentAccessMutation.mutate({ id: enrollmentId, reason });
          }}
          onBlockDefaulters={() => {
            if (selectedCourse) {
              blockDefaultersMutation.mutate(selectedCourse);
            }
          }}
        />

        {/* Student Enrollment Modal */}
        <StudentEnrollModal
          isOpen={showStudentEnrollModal}
          onClose={() => {
            setShowStudentEnrollModal(false);
            setSelectedStudentForEnroll(null);
          }}
          student={selectedStudentForEnroll}
          courses={coursesData || []}
          onEnroll={(courseIds) => {
            if (selectedStudentForEnroll) {
              bulkEnrollMutation.mutate({ userId: selectedStudentForEnroll._id, courseIds });
            }
          }}
          isLoading={bulkEnrollMutation.isPending}
        />
          </div>
        </div>
      </div>
    </>
  );
};

// Course Modal Component - For LMS Settings Only
const CourseModal = ({ isOpen, onClose, course, onSave, isLoading }: {
  isOpen: boolean;
  onClose: () => void;
  course: LMSCourse | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    certificateEnabled: true,
    certificateTemplate: 'islamic'
  });

  useEffect(() => {
    if (course) {
      setFormData({
        certificateEnabled: course.certificateEnabled || false,
        certificateTemplate: 'islamic'
      });
    }
  }, [course, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">LMS Settings: {course.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Course Info (from Course Management)</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Title:</span> {course.title}</p>
              <p><span className="font-medium">Category:</span> {course.category}</p>
              <p><span className="font-medium">Level:</span> {course.level}</p>
              <p><span className="font-medium">Type:</span> {(course.isPaid || (course.price ?? 0) > 0) ? `Paid (₨${course.price?.toLocaleString() || 0})` : 'Free'}</p>
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              To edit course details, go to Course Management
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">LMS Settings</h3>
            
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="certificateEnabled"
                checked={formData.certificateEnabled}
                onChange={(e) => setFormData({ ...formData, certificateEnabled: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <label htmlFor="certificateEnabled" className="text-sm text-gray-700">
                Enable certificate on completion
              </label>
            </div>

            {formData.certificateEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Template</label>
                <select
                  value={formData.certificateTemplate}
                  onChange={(e) => setFormData({ ...formData, certificateTemplate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="islamic">Islamic Style</option>
                  <option value="modern">Modern Style</option>
                  <option value="classic">Classic Style</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Class Modal Component
const ClassModal = ({ isOpen, onClose, classItem, courseId: _courseId, onSave, isLoading }: {
  isOpen: boolean;
  onClose: () => void;
  classItem: LMSClass | null;
  courseId: string | null;
  onSave: (formData: FormData) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    section: '',
    order: 1,
    isLocked: true,
    isPublished: false,
    isPreview: false
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (classItem) {
      setFormData({
        title: classItem.title,
        description: classItem.description || '',
        videoUrl: classItem.videoUrl,
        section: classItem.section,
        order: classItem.order,
        isLocked: classItem.isLocked,
        isPublished: classItem.isPublished,
        isPreview: classItem.isPreview
      });
    } else {
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        section: '',
        order: 1,
        isLocked: true,
        isPublished: false,
        isPreview: false
      });
    }
    setPdfFile(null);
  }, [classItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
    });
    if (pdfFile) {
      data.append('pdfAttachment', pdfFile);
    }
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold">{classItem ? 'Edit Class' : 'Add New Class'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL * <span className="text-xs text-gray-500">(Unlisted URL)</span>
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section/Module</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g., Module 1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                min={1}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF Attachment <span className="text-xs text-gray-500">(Optional - Notes, Resources)</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            {classItem?.pdfAttachment && (
              <p className="text-xs text-gray-500 mt-1">
                Current: {classItem.pdfAttachment.filename}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLocked"
                checked={formData.isLocked}
                onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <label htmlFor="isLocked" className="text-sm text-gray-700">
                Locked (Students cannot access until unlocked)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700">
                Published (Visible in course listing)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPreview"
                checked={formData.isPreview}
                onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <label htmlFor="isPreview" className="text-sm text-gray-700">
                Free Preview (Available without enrollment)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              <Save className="w-4 h-4" />
              {classItem ? 'Update Class' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enrollment Modal Component
const EnrollmentModal = ({ isOpen, onClose, courseId, enrollments, users, onEnroll, onToggleAccess, onBlockDefaulters, isLoadingEnrollments }: {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | null;
  enrollments: Enrollment[];
  users: any[];
  onEnroll: (userId: string) => void;
  onToggleAccess: (enrollmentId: string, reason?: string) => void;
  onBlockDefaulters: () => void;
  isLoadingEnrollments?: boolean;
}) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null);
  const [enrollmentClasses, setEnrollmentClasses] = useState<any>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const enrolledUserIds = enrollments.filter(e => e.user).map(e => e.user._id);
  const availableUsers = users.filter((u: any) =>
    !enrolledUserIds.includes(u._id) &&
    u.lmsAccessEnabled !== false &&
    ((u.name?.toLowerCase() || '').includes(searchUser.toLowerCase()) ||
     (u.email?.toLowerCase() || '').includes(searchUser.toLowerCase()) ||
     (u.lmsStudentId?.toLowerCase() || '').includes(searchUser.toLowerCase()))
  );

  // Fetch classes for an enrollment
  const fetchEnrollmentClasses = async (enrollmentId: string) => {
    try {
      setLoadingClasses(true);
      const res = await api.get(`/lms/enrollments/${enrollmentId}/classes`);
      setEnrollmentClasses(res.data.data);
    } catch (error) {
      console.error('Error fetching enrollment classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Toggle class lock for student
  const toggleClassLock = async (enrollmentId: string, classId: string, action: 'lock' | 'unlock') => {
    try {
      await api.put(`/lms/enrollments/${enrollmentId}/class/${classId}/toggle-lock`, { action });
      toast.success(`Class ${action}ed successfully`);
      fetchEnrollmentClasses(enrollmentId);
    } catch (error) {
      console.error('Error toggling class lock:', error);
      toast.error('Failed to update class access');
    }
  };

  // Handle expand enrollment
  const handleExpandEnrollment = (enrollmentId: string) => {
    if (expandedEnrollment === enrollmentId) {
      setExpandedEnrollment(null);
      setEnrollmentClasses(null);
    } else {
      setExpandedEnrollment(enrollmentId);
      fetchEnrollmentClasses(enrollmentId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Manage Enrollments</h2>
            <p className="text-xs text-gray-400 font-mono">Course ID: {courseId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Enroll New Student */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Enroll New Student</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Type to filter students by name or email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select LMS Student to enroll ({availableUsers.length} available) --</option>
                  {availableUsers.map((user: any) => (
                    <option key={user._id} value={user._id}>
                      {user.lmsStudentId ? `[${user.lmsStudentId}] ` : ''}{user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedUser) {
                      onEnroll(selectedUser);
                      setSelectedUser('');
                      setSearchUser('');
                    }
                  }}
                  disabled={!selectedUser}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Enroll
                </button>
              </div>
              {searchUser && availableUsers.length === 0 && (
                <p className="text-sm text-amber-600">No students found matching "{searchUser}"</p>
              )}
            </div>
          </div>

          {/* Block Defaulters */}
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              Enrolled Students ({enrollments.length})
              {isLoadingEnrollments && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent" />
              )}
            </h3>
            <button
              onClick={onBlockDefaulters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <AlertTriangle className="w-4 h-4" />
              Block All Fee Defaulters
            </button>
          </div>

          {/* Enrollments List */}
          {isLoadingEnrollments ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-2" />
              <p className="text-gray-500">Loading enrollments...</p>
            </div>
          ) : enrollments.filter(e => e.user).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No students enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.filter(e => e.user).map((enrollment) => (
                <div
                  key={enrollment._id}
                  className={`rounded-lg border overflow-hidden ${
                    enrollment.accessBlocked ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}
                >
                  {/* Student Header Row */}
                  <div className="flex items-center gap-4 p-4">
                    {/* Expand Button */}
                    <button
                      onClick={() => handleExpandEnrollment(enrollment._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View Classes"
                    >
                      {expandedEnrollment === enrollment._id ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{enrollment.user.name}</span>
                        {enrollment.user.isLMSStudent && (
                          <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">
                            LMS Student
                          </span>
                        )}
                        {enrollment.user.isPaidStudent && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                            Paid Student
                          </span>
                        )}
                        {enrollment.feeDefaulter && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Fee Defaulter
                          </span>
                        )}
                        {enrollment.accessBlocked && (
                          <span className="px-2 py-0.5 text-xs bg-red-200 text-red-800 rounded">
                            Blocked
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{enrollment.user.email}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        {enrollment.user.lmsStudentId && (
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{enrollment.user.lmsStudentId}</span>
                        )}
                        {enrollment.user.phone && (
                          <span>📞 {enrollment.user.phone}</span>
                        )}
                        {enrollment.enrolledAt && (
                          <span>📅 Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-600">
                        {enrollment.progress.percentage}%
                      </div>
                      <p className="text-xs text-gray-500">
                        {enrollment.progress.completedClasses}/{enrollment.progress.totalClasses} classes
                      </p>
                    </div>

                    <button
                      onClick={() => onToggleAccess(enrollment._id, enrollment.accessBlocked ? undefined : 'Blocked by admin')}
                      className={`p-2 rounded-lg ${
                        enrollment.accessBlocked
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={enrollment.accessBlocked ? 'Unblock Access' : 'Block Access'}
                    >
                      {enrollment.accessBlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Classes Section */}
                  {expandedEnrollment === enrollment._id && (
                    <div className="border-t bg-gray-50 p-4">
                      {loadingClasses ? (
                        <div className="text-center py-4">
                          <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading classes...</p>
                        </div>
                      ) : enrollmentClasses?.classes?.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              Class Access Control
                            </h4>
                            <p className="text-xs text-gray-500">
                              Toggle lock/unlock for each class individually
                            </p>
                          </div>
                          {enrollmentClasses.classes.map((cls: any, index: number) => (
                            <div
                              key={cls._id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                cls.isLockedForStudent
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-green-50 border-green-200'
                              }`}
                            >
                              <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm font-bold">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{cls.title}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{cls.section}</span>
                                  {cls.duration > 0 && <span>• {cls.duration} min</span>}
                                  {cls.progress?.status === 'completed' && (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Watched
                                    </span>
                                  )}
                                  {cls.progress?.watchProgress > 0 && cls.progress?.status !== 'completed' && (
                                    <span className="text-blue-600">{cls.progress.watchProgress}% watched</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Lock Status Badges */}
                                {cls.globalLocked && !cls.isUnlockedForStudent && (
                                  <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                    Global Lock
                                  </span>
                                )}
                                {cls.isUnlockedForStudent && (
                                  <span className="px-2 py-0.5 text-xs bg-green-200 text-green-700 rounded">
                                    Unlocked for student
                                  </span>
                                )}
                                {cls.isManuallyLocked && (
                                  <span className="px-2 py-0.5 text-xs bg-red-200 text-red-700 rounded">
                                    Locked for student
                                  </span>
                                )}
                                {/* Toggle Button */}
                                <button
                                  onClick={() => toggleClassLock(
                                    enrollment._id,
                                    cls._id,
                                    cls.isLockedForStudent ? 'unlock' : 'lock'
                                  )}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                    cls.isLockedForStudent
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                                  }`}
                                >
                                  {cls.isLockedForStudent ? (
                                    <>
                                      <Unlock className="w-4 h-4" />
                                      Unlock
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-4 h-4" />
                                      Lock
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Video className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          <p>No classes found for this course</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Students Section Component
const StudentsSection = ({ 
  students, 
  loading, 
  onCreateStudent, 
  onEditStudent, 
  onDeleteStudent, 
  onToggleAccess,
  onResetPassword,
  onEnrollInCourses
}: {
  students: LMSStudent[];
  loading: boolean;
  onCreateStudent: () => void;
  onEditStudent: (student: LMSStudent) => void;
  onDeleteStudent: (id: string) => void;
  onToggleAccess: (id: string) => void;
  onResetPassword: (id: string, newPassword: string) => void;
  onEnrollInCourses: (student: LMSStudent) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lmsStudentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={onCreateStudent}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          New Student
        </button>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No LMS students yet</h3>
          <p className="text-gray-500 mt-1">Create student accounts to give them access to LMS courses</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Student ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Enrolled Courses</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Access</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-emerald-600">{student.lmsStudentId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.phone || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {student.enrolledCoursesList && student.enrolledCoursesList.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1 max-w-[200px]">
                          {student.enrolledCoursesList.map((course, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs truncate max-w-[150px]"
                              title={course.courseTitle}
                            >
                              {course.courseTitle}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No courses</span>
                      )}
                      <button
                        onClick={() => onEnrollInCourses(student)}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition mt-1"
                        title="Click to manage enrollments"
                      >
                        + Enroll
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggleAccess(student._id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs mx-auto ${
                        student.lmsAccessEnabled 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.lmsAccessEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Disabled
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEnrollInCourses(student)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Enroll in Courses"
                      >
                        <BookPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const newPassword = prompt('Enter new password (min 6 characters):');
                          if (newPassword && newPassword.length >= 6) {
                            onResetPassword(student._id, newPassword);
                          } else if (newPassword) {
                            toast.error('Password must be at least 6 characters');
                          }
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditStudent(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Student Modal Component
const StudentModal = ({ 
  isOpen, 
  onClose, 
  student, 
  onSave, 
  isLoading 
}: {
  isOpen: boolean;
  onClose: () => void;
  student: LMSStudent | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    }
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }
    
    if (!student && (!formData.password || formData.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Check if passwords match (for new student or when changing password)
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const dataToSend: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined
    };

    if (formData.password) {
      dataToSend.password = formData.password;
    }

    onSave(dataToSend);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {student ? 'Edit Student' : 'Create New Student'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter student name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="student@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="+92 XXX XXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {student ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Min 6 characters"
                minLength={student ? 0 : 6}
                required={!student}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {student ? 'Confirm New Password' : 'Confirm Password *'}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                  formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }`}
                placeholder="Re-enter password"
                required={!student || !!formData.password}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-emerald-500 text-xs mt-1">✓ Passwords match</p>
            )}
          </div>

          {student && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Student ID:</strong> {student.lmsStudentId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This ID is auto-generated and cannot be changed
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {student ? 'Update Student' : 'Create Student'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Student Enroll Modal Component - For enrolling student in multiple courses
const StudentEnrollModal = ({
  isOpen,
  onClose,
  student,
  courses,
  onEnroll,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  student: LMSStudent | null;
  courses: any[];
  onEnroll: (courseIds: string[]) => void;
  isLoading: boolean;
}) => {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Get enrollments for this student
  const { data: studentEnrollments } = useQuery({
    queryKey: ['student-enrollments', student?._id],
    queryFn: async () => {
      if (!student?._id) return [];
      const res = await api.get(`/lms/enrollments?userId=${student._id}`);
      return res.data.data;
    },
    enabled: !!student?._id && isOpen
  });

  // Get already enrolled course IDs
  const enrolledCourseIds = useMemo(() => {
    return studentEnrollments?.map((e: any) => e.course?._id || e.course) || [];
  }, [studentEnrollments]);

  // Show all courses - admin can enroll in any course (will auto-enable LMS if needed)
  const lmsCourses = useMemo(() => {
    // Show all courses, prioritize LMS-enabled ones
    return [...courses].sort((a, b) => {
      // LMS enabled courses first
      if (a.isLMSEnabled && !b.isLMSEnabled) return -1;
      if (!a.isLMSEnabled && b.isLMSEnabled) return 1;
      return 0;
    });
  }, [courses]);

  // Filter by search term
  const filteredCourses = useMemo(() => {
    if (!searchTerm) return lmsCourses;
    return lmsCourses.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [lmsCourses, searchTerm]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCourses([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const toggleCourse = (courseId: string) => {
    if (enrolledCourseIds.includes(courseId)) return; // Already enrolled
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectAllUnenrolled = () => {
    const unenrolledIds = filteredCourses
      .filter(c => !enrolledCourseIds.includes(c._id))
      .map(c => c._id);
    setSelectedCourses(unenrolledIds);
  };

  const clearSelection = () => {
    setSelectedCourses([]);
  };

  const handleSubmit = () => {
    if (selectedCourses.length > 0) {
      onEnroll(selectedCourses);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookPlus className="w-6 h-6 text-emerald-600" />
                Enroll in Courses
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Student: <span className="font-medium">{student.name}</span>
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="p-4 border-b bg-gray-50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-2">
              <button
                onClick={selectAllUnenrolled}
                className="text-emerald-600 hover:text-emerald-700"
              >
                Select All Available
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={clearSelection}
                className="text-gray-600 hover:text-gray-700"
              >
                Clear Selection
              </button>
            </div>
            <span className="text-gray-500">
              {selectedCourses.length} selected
            </span>
          </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No courses available</p>
              <p className="text-xs mt-1">Add courses from Course Management first</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course._id);
                const isSelected = selectedCourses.includes(course._id);
                const isLMSEnabled = course.isLMSEnabled;
                
                return (
                  <div
                    key={course._id}
                    onClick={() => toggleCourse(course._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isEnrolled 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                        : isSelected
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                          : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        isEnrolled
                          ? 'bg-gray-300 border-gray-400'
                          : isSelected
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'border-gray-300'
                      }`}>
                        {(isEnrolled || isSelected) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          {!isLMSEnabled && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-700 rounded">
                              LMS will be enabled
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {course.level || 'All Levels'}
                          </span>
                          {isEnrolled && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                              Already Enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {enrolledCourseIds.length} enrolled • {lmsCourses.length} total courses
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedCourses.length === 0 || isLoading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Enrolling...
                </>
              ) : (
                <>
                  <BookPlus className="w-4 h-4" />
                  Enroll in {selectedCourses.length} Course{selectedCourses.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Beautiful Certificate Preview Component
const CertificatePreview = ({ certificate, onClose }: { certificate: any; onClose: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_100%]"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className="w-6 h-6" />
            </motion.div>
            Certificate Preview
          </h2>
          <motion.button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-lg transition"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </motion.div>

        {/* Certificate */}
        <div className="p-6 overflow-auto bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <motion.div 
            id="certificate-container"
            className="relative bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-8 border-double border-amber-600 rounded-lg shadow-2xl p-6 mx-auto overflow-visible cursor-pointer"
            style={{ maxWidth: '850px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ 
              scale: 1.01,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Animated Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
              initial={{ x: '-100%' }}
              animate={isHovered ? { x: '200%' } : { x: '-100%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Islamic Calligraphy Background Pattern - Beautiful Seal Image */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ 
                opacity: isHovered ? 0.18 : 0.12,
                scale: isHovered ? 1.05 : 1,
                rotate: isHovered ? 5 : 0
              }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/images/logo.png" 
                alt="Background Seal" 
                className="w-[350px] h-[350px] object-contain"
              />
            </motion.div>
            
            {/* Decorative Islamic Border Pattern */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top border pattern */}
              <motion.div 
                className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-amber-100/50 to-transparent"
                animate={{ opacity: isHovered ? 0.8 : 0.5 }}
              />
              {/* Bottom border pattern */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-100/50 to-transparent"
                animate={{ opacity: isHovered ? 0.8 : 0.5 }}
              />
              {/* Left border pattern */}
              <motion.div 
                className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-amber-100/50 to-transparent"
                animate={{ opacity: isHovered ? 0.8 : 0.5 }}
              />
              {/* Right border pattern */}
              <motion.div 
                className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-amber-100/50 to-transparent"
                animate={{ opacity: isHovered ? 0.8 : 0.5 }}
              />
            </div>

            {/* Animated Corner Patterns */}
            <motion.div 
              className="absolute top-4 left-4 w-24 h-24"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-full h-full border-l-4 border-t-4 border-amber-600 rounded-tl-lg" />
              <div className="absolute top-2 left-2 w-16 h-16 border-l-2 border-t-2 border-emerald-600 rounded-tl-lg opacity-60" />
            </motion.div>
            <motion.div 
              className="absolute top-4 right-4 w-24 h-24"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-full h-full border-r-4 border-t-4 border-amber-600 rounded-tr-lg" />
              <div className="absolute top-2 right-2 w-16 h-16 border-r-2 border-t-2 border-emerald-600 rounded-tr-lg opacity-60" />
            </motion.div>
            <motion.div 
              className="absolute bottom-4 left-4 w-24 h-24"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-full h-full border-l-4 border-b-4 border-amber-600 rounded-bl-lg" />
              <div className="absolute bottom-2 left-2 w-16 h-16 border-l-2 border-b-2 border-emerald-600 rounded-bl-lg opacity-60" />
            </motion.div>
            <motion.div 
              className="absolute bottom-4 right-4 w-24 h-24"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-full h-full border-r-4 border-b-4 border-amber-600 rounded-br-lg" />
              <div className="absolute bottom-2 right-2 w-16 h-16 border-r-2 border-b-2 border-emerald-600 rounded-br-lg opacity-60" />
            </motion.div>

            {/* Animated Inner decorative border */}
            <motion.div 
              className="absolute inset-10 border-2 border-amber-300/50 rounded-lg"
              animate={{ 
                borderColor: isHovered ? 'rgba(217, 119, 6, 0.7)' : 'rgba(252, 211, 77, 0.5)',
                scale: isHovered ? 1.01 : 1
              }}
            />
            <motion.div 
              className="absolute inset-12 border border-emerald-300/30 rounded-lg"
              animate={{ 
                borderColor: isHovered ? 'rgba(16, 185, 129, 0.5)' : 'rgba(110, 231, 183, 0.3)',
                scale: isHovered ? 1.01 : 1
              }}
            />

            {/* Floating Particles Effect */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-amber-400/30 rounded-full pointer-events-none"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-between text-center py-3">
              {/* Header with Islamic Styling */}
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="text-amber-700 text-lg font-arabic tracking-widest" 
                  style={{ fontFamily: 'serif' }}
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                >
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </motion.div>
                
                {/* Logo and Academy Name Section */}
                <motion.div 
                  className="flex items-center justify-center gap-3 py-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-600 shadow-lg bg-emerald-800 flex items-center justify-center"
                    animate={{ 
                      boxShadow: isHovered 
                        ? '0 0 20px rgba(16, 185, 129, 0.4)' 
                        : '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <img 
                      src="/images/logo.png" 
                      alt="Logo" 
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </motion.div>
                  <div className="text-center">
                    <motion.h2 
                      className="text-base font-bold text-emerald-700 italic"
                      style={{ fontFamily: 'Georgia, serif' }}
                      animate={{ 
                        color: isHovered ? '#065f46' : '#047857',
                        textShadow: isHovered ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Sahibzada Shariq Ahmed Tariqi
                    </motion.h2>
                    <motion.p 
                      className="text-xs text-emerald-600 tracking-wider"
                      animate={{ opacity: isHovered ? 1 : 0.8 }}
                    >
                      Spiritual Healing & Guidance
                    </motion.p>
                  </div>
                </motion.div>

                <div className="flex items-center justify-center gap-4">
                  <motion.div 
                    className="w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-amber-600"
                    animate={{ scaleX: isHovered ? 1.3 : 1 }}
                  />
                  <motion.div
                    animate={{ 
                      rotate: isHovered ? 360 : 0,
                      scale: isHovered ? 1.2 : 1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Award className="w-10 h-10 text-amber-600" />
                  </motion.div>
                  <motion.div 
                    className="w-12 h-0.5 bg-gradient-to-l from-transparent via-amber-600 to-amber-600"
                    animate={{ scaleX: isHovered ? 1.3 : 1 }}
                  />
                </div>
                <motion.h1 
                  className="text-3xl font-bold text-emerald-800 tracking-wide" 
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                  animate={{ 
                    scale: isHovered ? 1.03 : 1,
                    textShadow: isHovered ? '2px 2px 4px rgba(0,0,0,0.2)' : '1px 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  Certificate of Completion
                </motion.h1>
                <motion.p 
                  className="text-amber-700 text-xs tracking-widest uppercase font-semibold"
                  animate={{ letterSpacing: isHovered ? '0.2em' : '0.1em' }}
                >
                  Sahibzada Shariq Ahmed Tariqi Academy
                </motion.p>
              </motion.div>

              {/* Main Content */}
              <motion.div 
                className="space-y-3 max-w-lg my-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-gray-600 text-base">This is to certify that</p>
                
                <motion.h2 
                  className="text-2xl font-bold text-emerald-700 border-b-2 border-amber-400 pb-1 inline-block px-6"
                  whileHover={{ scale: 1.05 }}
                  animate={{ 
                    textShadow: isHovered ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  {certificate?.studentName || 'Student Name'}
                </motion.h2>
                
                <p className="text-gray-600 text-base">
                  has successfully completed the course
                </p>
                
                <motion.h3 
                  className="text-xl font-semibold text-gray-800 italic"
                  whileHover={{ scale: 1.02 }}
                >
                  "{certificate?.courseTitle || 'Course Title'}"
                </motion.h3>
                
                <p className="text-sm font-bold text-gray-800 px-6 leading-relaxed">
                  Special Permission (Ijazat-e-Khaas) is granted for all teachings of this course and for the implementation of all prescribed practices.
                </p>
                
                {certificate?.grade && certificate.grade !== 'none' && (
                  <motion.div 
                    className="inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-amber-100 to-amber-50 rounded-full border border-amber-300 shadow-sm"
                    whileHover={{ scale: 1.1, boxShadow: "0 10px 20px -5px rgba(217, 119, 6, 0.3)" }}
                    animate={{ 
                      boxShadow: isHovered 
                        ? ['0 0 0 0 rgba(217, 119, 6, 0)', '0 0 0 10px rgba(217, 119, 6, 0.1)', '0 0 0 0 rgba(217, 119, 6, 0)']
                        : '0 0 0 0 rgba(217, 119, 6, 0)'
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-amber-800 font-medium text-sm">
                      Grade: <span className="font-bold uppercase">{certificate.grade}</span>
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Footer */}
              <motion.div 
                className="w-full space-y-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {/* Completion Date */}
                <div className="text-gray-600">
                  <p className="text-xs">Completed on</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {certificate?.completionDate 
                      ? new Date(certificate.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                    }
                  </p>
                </div>

                {/* Signature Section */}
                <div className="flex justify-between items-end px-6 pt-1">
                  <motion.div 
                    className="text-center flex-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Signature Box with Certificate Theme Colors */}
                    <div className="w-28 h-14 mx-auto mb-1 border border-amber-300 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/50 shadow-sm overflow-hidden p-1">
                      <img 
                        src="https://res.cloudinary.com/du7qzhimu/image/upload/v1769580381/shariq-website/products/pc9szshbrztkx4k9iki5.png" 
                        alt="Signature" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      {certificate?.instructorName || 'Sahibzada Shariq Ahmed Tariqi'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {certificate?.instructorTitle || 'Spiritual Guide & Teacher'}
                    </p>
                  </motion.div>
                  
                  {/* Official Stamp - Centered */}
                  <motion.div 
                    className="flex flex-col items-center flex-1"
                    animate={{ 
                      scale: isHovered ? 1.15 : 1,
                      rotate: isHovered ? [0, -5, 5, 0] : 0
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative">
                      {/* Glowing ring effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-md opacity-60"
                        animate={{ 
                          scale: isHovered ? [1, 1.2, 1] : 1,
                          opacity: isHovered ? [0.6, 0.9, 0.6] : 0.4
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {/* Stamp container */}
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 via-white to-amber-100 p-1.5 shadow-xl border-2 border-amber-400">
                        <img 
                          src="/images/certificate-stamp.png" 
                          alt="Official Stamp" 
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                      {/* Verified badge */}
                      <motion.div 
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[6px] font-bold px-2 py-0.5 rounded-full shadow-md"
                        animate={{ scale: isHovered ? 1.1 : 1 }}
                      >
                        ✓ VERIFIED
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="text-center flex-1 flex flex-col items-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* QR Code */}
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-200 mb-1">
                      <QRCodeSVG 
                        value={`https://shariqtariqi.com/verify-certificate/${certificate?.verificationCode || certificate?.studentId || certificate?.user?.studentId || 'PREVIEW'}`}
                        size={60}
                        level="M"
                        fgColor="#1f2937"
                        bgColor="#ffffff"
                      />
                    </div>
                    <p className="text-xs font-mono text-gray-600 mb-1">
                      {certificate?.studentId || certificate?.user?.studentId || certificate?.user?.lmsStudentId || 'SAT-STU-XX-XXXX'}
                    </p>
                    <div className="w-32 border-b-2 border-gray-400 mb-1 mx-auto" />
                    <p className="text-[10px] text-gray-500">Certificate Number</p>
                  </motion.div>
                </div>

                {/* Verification Code */}
                <motion.div 
                  className="text-center pt-1"
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                >
                  <p className="text-[10px] text-gray-400">
                    Verify at: shariqtariqi.com/verify • Code: {certificate?.verificationCode || 'PREVIEW'}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center gap-3">
          <motion.p 
            className="text-sm text-gray-500 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Hover over certificate for interactive effects
          </motion.p>
          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
            <motion.button
              onClick={() => {
                // Print certificate
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  const certHtml = document.getElementById('certificate-container')?.outerHTML;
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Certificate - ${certificate?.studentName}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                          @media print {
                            body { margin: 0; padding: 20px; }
                          }
                        </style>
                      </head>
                      <body class="bg-gray-100 p-8">${certHtml}</body>
                    </html>
                  `);
                  printWindow.document.close();
                  setTimeout(() => printWindow.print(), 500);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-4 h-4" />
              Print Certificate
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Issue Certificate Modal
const IssueCertificateModal = ({ 
  onClose, 
  onSuccess,
  courses
}: { 
  onClose: () => void;
  onSuccess: () => void;
  courses: LMSCourse[];
}) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [grade, setGrade] = useState('pass');
  const [template, setTemplate] = useState('islamic');
  const [instructorName, setInstructorName] = useState('Sahibzada Shariq Ahmed Tariqi');
  const [instructorTitle, setInstructorTitle] = useState('Spiritual Guide & Teacher');
  const [showPreview, setShowPreview] = useState(false);

  // Fetch enrollments for selected course
  const { data: courseEnrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['course-enrollments-for-cert', selectedCourse],
    queryFn: async () => {
      const res = await api.get(`/lms/courses/${selectedCourse}/enrollments`);
      return res.data.data || [];
    },
    enabled: !!selectedCourse
  });

  const selectedEnrollment = useMemo(() => {
    if (!courseEnrollments) return null;
    return courseEnrollments.find((e: any) => e.user?._id === selectedStudent);
  }, [courseEnrollments, selectedStudent]);

  const selectedCourseData = useMemo(() => {
    return courses.find(c => c._id === selectedCourse);
  }, [courses, selectedCourse]);

  const issueMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/lms/certificates/issue', {
        userId: selectedStudent,
        courseId: selectedCourse,
        enrollmentId: selectedEnrollment?._id,
        grade,
        template,
        instructorName,
        instructorTitle
      });
      return res.data;
    },
    onSuccess: (_data) => {
      toast.success('Certificate issued successfully!');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to issue certificate');
    }
  });

  const previewData = {
    studentName: selectedEnrollment?.user?.name || 'Student Name',
    courseTitle: selectedCourseData?.title || 'Course Title',
    grade,
    template,
    instructorName,
    instructorTitle,
    completionDate: selectedEnrollment?.completedAt || new Date(),
    studentId: selectedEnrollment?.user?.studentId || selectedEnrollment?.user?.lmsStudentId || 'SAT-STU-XX-XXXX',
    certificateNumber: selectedEnrollment?.user?.studentId || selectedEnrollment?.user?.lmsStudentId || 'CERT-SAT-XXXX-XXXXX',
    verificationCode: 'PREVIEW'
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-amber-500 to-amber-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6" />
              Issue Certificate
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedStudent('');
                }}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Choose a course...</option>
                {courses.filter(c => c.isLMSEnabled).map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedCourse || loadingEnrollments}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedCourse 
                    ? 'Select a course first' 
                    : loadingEnrollments 
                      ? 'Loading students...' 
                      : 'Choose a student...'}
                </option>
                {(courseEnrollments || []).filter((e: any) => e.user).map((enrollment: any) => (
                  <option key={enrollment._id} value={enrollment.user?._id}>
                    {enrollment.user?.name} ({enrollment.user?.email})
                    {enrollment.certificateIssued ? ' ✓ Has Certificate' : ''}
                  </option>
                ))}
              </select>
              {selectedCourse && !loadingEnrollments && (courseEnrollments || []).filter((e: any) => e.user).length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No students enrolled in this course yet
                </p>
              )}
              {loadingEnrollments && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-amber-500 border-t-transparent" />
                  Loading enrolled students...
                </p>
              )}
            </div>

            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <div className="flex gap-3">
                {[
                  { value: 'distinction', label: 'Distinction', color: 'bg-amber-500' },
                  { value: 'merit', label: 'Merit', color: 'bg-emerald-500' },
                  { value: 'pass', label: 'Pass', color: 'bg-blue-500' },
                  { value: 'none', label: 'No Grade', color: 'bg-gray-400' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setGrade(option.value)}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                      grade === option.value 
                        ? `border-${option.color.replace('bg-', '')} ${option.color} text-white` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Template</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'islamic', label: 'Islamic', desc: 'With Bismillah', icon: '☪' },
                  { value: 'premium', label: 'Premium', desc: 'Gold Accents', icon: '⭐' },
                  { value: 'default', label: 'Standard', desc: 'Simple Design', icon: '📜' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTemplate(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      template === option.value 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <p className="font-medium mt-1">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructor Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Title</label>
                <input
                  type="text"
                  value={instructorTitle}
                  onChange={(e) => setInstructorTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setShowPreview(true)}
              disabled={!selectedStudent || !selectedCourse}
              className="px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Preview Certificate
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => issueMutation.mutate()}
                disabled={!selectedStudent || !selectedCourse || issueMutation.isPending}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {issueMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Issuing...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Issue Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <CertificatePreview 
          certificate={previewData} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
};

// Certificates Section Component
const CertificatesSection = ({ courses }: { courses: LMSCourse[] }) => {
  const queryClient = useQueryClient();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [previewCert, setPreviewCert] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'revoked'>('all');

  const { data: certificatesData, isLoading } = useQuery({
    queryKey: ['lms-certificates'],
    queryFn: async () => {
      const res = await api.get('/lms/certificates');
      return res.data.data;
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.put(`/lms/certificates/${id}/revoke`, { reason });
    },
    onSuccess: () => {
      toast.success('Certificate revoked');
      queryClient.invalidateQueries({ queryKey: ['lms-certificates'] });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/lms/certificates/${id}/restore`);
    },
    onSuccess: () => {
      toast.success('Certificate restored');
      queryClient.invalidateQueries({ queryKey: ['lms-certificates'] });
    }
  });

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    if (!certificatesData) return [];
    return certificatesData.filter((cert: any) => {
      const matchesSearch = !searchQuery || 
        cert.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [certificatesData, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!certificatesData) return { total: 0, issued: 0, revoked: 0 };
    return {
      total: certificatesData.length,
      issued: certificatesData.filter((c: any) => c.status === 'issued').length,
      revoked: certificatesData.filter((c: any) => c.status === 'revoked').length
    };
  }, [certificatesData]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Certificates</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{stats.issued}</p>
              <p className="text-sm text-gray-500">Active Certificates</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
              <X className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{stats.revoked}</p>
              <p className="text-sm text-gray-500">Revoked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, course, or certificate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="issued">Issued</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
        <button
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 flex items-center gap-2 shadow-md"
        >
          <Award className="w-4 h-4" />
          Issue Certificate
        </button>
      </div>

      {/* Certificates List */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No certificates found' : 'No certificates issued yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Click "Issue Certificate" to award certificates to students'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 inline-flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              Issue First Certificate
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-amber-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">Certificate #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800">Issued</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCertificates.map((cert: any) => (
                  <tr key={cert._id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {cert.certificateNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(cert.studentName || cert.user?.name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cert.studentName || cert.user?.name}
                          </div>
                          <div className="text-xs text-gray-500">{cert.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{cert.courseTitle || cert.course?.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      {cert.grade && cert.grade !== 'none' ? (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          cert.grade === 'distinction' ? 'bg-amber-100 text-amber-700' :
                          cert.grade === 'merit' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {cert.grade.charAt(0).toUpperCase() + cert.grade.slice(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${
                        cert.status === 'issued' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {cert.status === 'issued' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                          title="Preview Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {cert.status === 'issued' ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for revocation:');
                              if (reason) {
                                revokeMutation.mutate({ id: cert._id, reason });
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Revoke Certificate"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => restoreMutation.mutate(cert._id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                            title="Restore Certificate"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showIssueModal && (
        <IssueCertificateModal
          onClose={() => setShowIssueModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['lms-certificates'] })}
          courses={courses}
        />
      )}

      {/* Preview Certificate Modal */}
      {previewCert && (
        <CertificatePreview
          certificate={previewCert}
          onClose={() => setPreviewCert(null)}
        />
      )}
    </div>
  );
};

// Fee Management Section Component
const FeeManagementSection = ({
  feesData,
  loadingFees,
  students,
  feeFilterMonth,
  feeFilterYear,
  feeFilterStatus,
  setFeeFilterMonth,
  setFeeFilterYear,
  setFeeFilterStatus,
  onDeleteFee,
  onGenerateFees,
  onUpdateFeeStatus
}: {
  feesData: any;
  loadingFees: boolean;
  students: LMSStudent[];
  feeFilterMonth: string;
  feeFilterYear: number;
  feeFilterStatus: string;
  setFeeFilterMonth: (month: string) => void;
  setFeeFilterYear: (year: number) => void;
  setFeeFilterStatus: (status: string) => void;
  onDeleteFee: (feeId: string) => void;
  onGenerateFees: (data: any) => void;
  onUpdateFeeStatus: (feeId: string, data: any) => void;
}) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateData, setGenerateData] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    amount: 5000,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const summary = feesData?.summary || {
    total: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0,
    paidCount: 0, pendingCount: 0, overdueCount: 0
  };

  const fees = feesData?.data || [];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
      partial: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CreditCard }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Rename students to lmsStudents for use in component
  const lmsStudents = students;

  return (
    <div className="space-y-6">
      {/* Alert Banner for missing fee records */}
      {lmsStudents && fees && (() => {
        const currentMonth = months[new Date().getMonth()];
        const currentYear = new Date().getFullYear();
        const currentMonthFees = fees.filter((f: any) => f.month === currentMonth && f.year === currentYear);
        const studentsWithoutFees = lmsStudents.length - currentMonthFees.length;
        if (studentsWithoutFees > 0) {
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    {studentsWithoutFees} student(s) don't have fee records for {currentMonth} {currentYear}
                  </p>
                  <p className="text-sm text-amber-600">Click "Generate Monthly Fees" to create fee records for all students</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
              >
                Generate Now
              </button>
            </div>
          );
        }
        return null;
      })()}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              <p className="text-sm text-gray-500">Total Records</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">Rs. {summary.paidAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{summary.paidCount} Paid</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">Rs. {summary.pendingAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{summary.pendingCount} Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{summary.overdueCount}</p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={feeFilterMonth}
            onChange={(e) => setFeeFilterMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Months</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            value={feeFilterYear}
            onChange={(e) => setFeeFilterYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={feeFilterStatus}
            onChange={(e) => setFeeFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          {/* Show info if total fee records != total students */}
          {lmsStudents && fees && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{fees.length}</span> records / <span className="font-medium">{lmsStudents.length}</span> students
            </div>
          )}
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Calendar className="w-4 h-4" />
            Generate Monthly Fees
          </button>
        </div>
      </div>

      {/* Fees Table */}
      {loadingFees ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : fees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No fee records found</h3>
          <p className="text-gray-500 mt-1">Generate monthly fees or add individual fee records</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Month</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Paid</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fees.map((fee: LMSFee) => (
                <tr key={fee._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{fee.student?.name}</p>
                        <p className="text-xs text-emerald-600">{fee.student?.lmsStudentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{fee.month} {fee.year}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">Rs. {fee.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${fee.paidAmount >= fee.amount ? 'text-green-600' : fee.paidAmount > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                      Rs. {fee.paidAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(fee.status)}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {new Date(fee.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Mark this fee as paid?')) {
                              onUpdateFeeStatus(fee._id, { 
                                status: 'paid', 
                                paidAmount: fee.amount,
                                paidDate: new Date().toISOString()
                              });
                            }
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const newAmount = prompt('Enter paid amount:', fee.paidAmount.toString());
                          if (newAmount !== null) {
                            const amount = parseFloat(newAmount);
                            if (!isNaN(amount) && amount >= 0) {
                              onUpdateFeeStatus(fee._id, { 
                                paidAmount: amount,
                                status: amount >= fee.amount ? 'paid' : amount > 0 ? 'partial' : 'pending'
                              });
                            }
                          }
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Update Payment"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteFee(fee._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Monthly Fees Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Generate Monthly Fees
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={generateData.month}
                    onChange={(e) => setGenerateData({ ...generateData, month: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={generateData.year}
                    onChange={(e) => setGenerateData({ ...generateData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                <input
                  type="number"
                  value={generateData.amount}
                  onChange={(e) => setGenerateData({ ...generateData, amount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={generateData.dueDate}
                  onChange={(e) => setGenerateData({ ...generateData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                This will generate fee records for all {students.length} LMS students for {generateData.month} {generateData.year}.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onGenerateFees(generateData);
                    setShowGenerateModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Fees
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminLMSPage;
