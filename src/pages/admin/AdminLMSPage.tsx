import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen, Plus, Edit, Lock, Unlock,
  Users, Play, FileText, Video, Award, Search,
  ChevronDown, ChevronRight, X, Save, GripVertical,
  AlertTriangle, ArrowLeft, UserPlus, Key, ToggleLeft, ToggleRight, GraduationCap, Trash2, BookPlus, Check, Clock,
  Wallet, Calendar, CreditCard, CheckCircle2, AlertCircle, Receipt
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
  const { data: enrollmentsData } = useQuery({
    queryKey: ['lms-enrollments', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const res = await api.get(`/lms/courses/${selectedCourse}/enrollments`);
      return res.data.data;
    },
    enabled: !!selectedCourse
  });

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
  const { data: usersData } = useQuery({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lms-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['lms-students'] });
      toast.success('Student enrolled successfully');
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

  const categories = ['all', 'spiritual', 'roohani', 'jismani', 'nafsiati'];

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
                              !course.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {course.isPaid ? 'Paid' : 'Free'}
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
                              <button
                                onClick={() => togglePublishMutation.mutate(course._id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                                  course.lmsStatus === 'published'
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                                title={course.lmsStatus === 'published' ? 'Unpublish LMS' : 'Publish LMS'}
                              >
                                {course.lmsStatus === 'published' ? 'Unpublish' : 'Publish'}
                              </button>
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
          <CertificatesSection />
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
          users={usersData || []}
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
              <p><span className="font-medium">Type:</span> {course.isPaid ? 'Paid' : 'Free'}</p>
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
const ClassModal = ({ isOpen, onClose, classItem, courseId, onSave, isLoading }: {
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
const EnrollmentModal = ({ isOpen, onClose, courseId, enrollments, users, onEnroll, onToggleAccess, onBlockDefaulters }: {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | null;
  enrollments: Enrollment[];
  users: any[];
  onEnroll: (userId: string) => void;
  onToggleAccess: (enrollmentId: string, reason?: string) => void;
  onBlockDefaulters: () => void;
}) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const enrolledUserIds = enrollments.map(e => e.user._id);
  const availableUsers = users.filter((u: any) =>
    !enrolledUserIds.includes(u._id) &&
    u.role !== 'admin' &&
    (u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
     u.email.toLowerCase().includes(searchUser.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Manage Enrollments</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Enroll New Student */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Enroll New Student</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select user</option>
                {availableUsers.map((user: any) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (selectedUser) {
                    onEnroll(selectedUser);
                    setSelectedUser('');
                  }
                }}
                disabled={!selectedUser}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Enroll
              </button>
            </div>
          </div>

          {/* Block Defaulters */}
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Enrolled Students ({enrollments.length})</h3>
            <button
              onClick={onBlockDefaulters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <AlertTriangle className="w-4 h-4" />
              Block All Fee Defaulters
            </button>
          </div>

          {/* Enrollments List */}
          {enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No students enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    enrollment.accessBlocked ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{enrollment.user.name}</span>
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
                    {enrollment.user.studentId && (
                      <p className="text-xs text-gray-400">{enrollment.user.studentId}</p>
                    )}
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
                    <button
                      onClick={() => onEnrollInCourses(student)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition cursor-pointer"
                      title="Click to enroll in courses"
                    >
                      {student.enrolledCourses} courses
                    </button>
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

// Certificates Section Component
const CertificatesSection = () => {
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
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {certificatesData?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No certificates issued yet</h3>
          <p className="text-gray-500 mt-1">Certificates will appear here when students complete courses</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Certificate #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Course</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Issued</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {certificatesData?.map((cert: any) => (
                <tr key={cert._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{cert.certificateNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{cert.user?.name}</div>
                    <div className="text-xs text-gray-500">{cert.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{cert.course?.title}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      cert.status === 'issued' ? 'bg-green-100 text-green-700' :
                      cert.status === 'revoked' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {cert.status === 'issued' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for revocation:');
                          if (reason) {
                            revokeMutation.mutate({ id: cert._id, reason });
                          }
                        }}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Revoke
                      </button>
                    )}
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

  return (
    <div className="space-y-6">
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
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Calendar className="w-4 h-4" />
          Generate Monthly Fees
        </button>
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
