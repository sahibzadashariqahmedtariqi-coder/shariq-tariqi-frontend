import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import {
  BookOpen, Play, Lock, CheckCircle, Clock, Award,
  ChevronRight, Search, GraduationCap, Download,
  BarChart3, User, CheckCircle2, LogOut, Sparkles,
  Zap, Target, Flame, Trophy, Gift, Rocket,
  CreditCard, Wallet, AlertCircle, Calendar, DollarSign,
  X, Banknote, Building2, History
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface Course {
  _id: string;
  title: string;
  description: string;
  image?: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  isPaid: boolean;
  totalClasses: number;
  enrollmentCount: number;
  certificateEnabled: boolean;
}

interface Enrollment {
  _id: string;
  course: Course;
  status: string;
  progress: {
    completedClasses: number;
    totalClasses: number;
    percentage: number;
    lastAccessedAt?: string;
  };
  accessBlocked: boolean;
  blockedReason?: string;
  enrolledAt: string;
  certificateIssued: boolean;
  certificateId?: string;
}

interface FeeRecord {
  _id: string;
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
}

interface PaymentRequest {
  _id: string;
  fee: {
    _id: string;
    month: string;
    year: number;
    amount: number;
  };
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks?: string;
  createdAt: string;
  reviewedAt?: string;
}

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <>{count}</>;
};

// Floating Particles Component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: '100%',
          opacity: 0 
        }}
        animate={{ 
          y: '-100%',
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'linear'
        }}
      />
    ))}
  </div>
);

// Glowing Orb Component
const GlowingOrb = ({ color, size, position }: { color: string; size: string; position: string }) => (
  <div 
    className={`absolute ${position} ${size} rounded-full blur-3xl opacity-20 animate-pulse`}
    style={{ background: color }}
  />
);

const StudentLMSPage = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-courses' | 'certificates' | 'fee-payments'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'bank_transfer',
    transactionId: '',
    accountTitle: '',
    accountNumber: '',
    paymentProof: '',
    remarks: ''
  });
  const queryClient = useQueryClient();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isLMSStudent = (user as any)?.isLMSStudent || (user as any)?.role === 'lms_student';

  const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['my-lms-enrollments'],
    queryFn: async () => {
      const endpoint = isLMSStudent ? '/lms/my-enrolled-courses' : '/lms/my-courses';
      const res = await api.get(endpoint);
      return res.data.data;
    }
  });

  const { data: certificatesData, isLoading: loadingCertificates } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const res = await api.get('/lms/certificates/my');
      return res.data.data;
    },
    enabled: activeTab === 'certificates'
  });

  const { data: feeData, isLoading: loadingFees } = useQuery({
    queryKey: ['my-fees'],
    queryFn: async () => {
      const res = await api.get('/lms/fees/my');
      return res.data.data;
    },
    enabled: activeTab === 'fee-payments'
  });

  const { data: paymentRequests, isLoading: loadingPaymentRequests } = useQuery({
    queryKey: ['my-payment-requests'],
    queryFn: async () => {
      const res = await api.get('/lms/fees/my-payments');
      return res.data.data;
    },
    enabled: activeTab === 'fee-payments'
  });

  // Fetch bank details from settings
  const { data: bankDetails } = useQuery({
    queryKey: ['bank-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
    enabled: showPaymentModal
  });

  // Handle file upload for payment proof
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentProof(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Upload to cloudinary
      try {
        setUploadingProof(true);
        const formData = new FormData();
        formData.append('image', file);
        const uploadRes = await api.post('/upload/payment-proof?folder=fee-payments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          setPaymentForm({ ...paymentForm, paymentProof: uploadRes.data.url });
        }
      } catch (error) {
        console.error('Failed to upload payment proof');
      } finally {
        setUploadingProof(false);
      }
    }
  };

  // Payment submission mutation
  const submitPaymentMutation = useMutation({
    mutationFn: async (data: typeof paymentForm & { feeId: string }) => {
      const res = await api.post('/lms/fees/pay', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-fees'] });
      queryClient.invalidateQueries({ queryKey: ['my-payment-requests'] });
      setShowPaymentModal(false);
      setSelectedFee(null);
      setPaymentProof(null);
      setImagePreview(null);
      setPaymentForm({
        amount: 0,
        paymentMethod: 'bank_transfer',
        transactionId: '',
        accountTitle: '',
        accountNumber: '',
        paymentProof: '',
        remarks: ''
      });
      alert('Payment request submitted successfully! Admin will review and approve it.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to submit payment request');
    }
  });

  const handlePayNow = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentProof(null);
    setImagePreview(null);
    setPaymentForm({
      amount: fee.amount - fee.paidAmount,
      paymentMethod: 'bank_transfer',
      transactionId: '',
      accountTitle: '',
      accountNumber: '',
      paymentProof: '',
      remarks: ''
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    if (!paymentProof) {
      alert('Please upload payment screenshot');
      return;
    }
    
    submitPaymentMutation.mutate({
      feeId: selectedFee._id,
      ...paymentForm
    });
  };

  const filteredEnrollments = enrollmentsData?.filter((enrollment: Enrollment) => 
    enrollment.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const dashboardStats = useMemo(() => {
    const enrollments = enrollmentsData || [];
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e: Enrollment) => e.status === 'completed').length;
    const inProgressCourses = enrollments.filter((e: Enrollment) => e.status === 'active').length;
    const blockedCourses = enrollments.filter((e: Enrollment) => e.accessBlocked).length;
    const totalProgress = enrollments.reduce((acc: number, e: Enrollment) => acc + (e.progress?.percentage || 0), 0);
    const avgProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
    const totalClasses = enrollments.reduce((acc: number, e: Enrollment) => acc + (e.progress?.totalClasses || 0), 0);
    const completedClasses = enrollments.reduce((acc: number, e: Enrollment) => acc + (e.progress?.completedClasses || 0), 0);
    
    return { totalCourses, completedCourses, inProgressCourses, blockedCourses, avgProgress, totalClasses, completedClasses };
  }, [enrollmentsData]);

  const recentCourses = useMemo(() => {
    return (enrollmentsData || [])
      .filter((e: Enrollment) => e.progress?.lastAccessedAt)
      .sort((a: Enrollment, b: Enrollment) => 
        new Date(b.progress.lastAccessedAt!).getTime() - new Date(a.progress.lastAccessedAt!).getTime()
      )
      .slice(0, 3);
  }, [enrollmentsData]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
    return { text: 'Good Evening', emoji: '🌙' };
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-[#0a0f1a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0d1524] to-[#0a1628]" />
        <GlowingOrb color="#10b981" size="w-96 h-96" position="top-0 -left-48" />
        <GlowingOrb color="#0ea5e9" size="w-80 h-80" position="bottom-0 right-0" />
        <GlowingOrb color="#8b5cf6" size="w-64 h-64" position="top-1/2 left-1/2" />
        <FloatingParticles />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-white/5 z-50 hidden lg:block">
        {/* Logo with Glow */}
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                رُوحانی علم
              </h1>
              <p className="text-emerald-400/70 text-xs font-medium">Student Portal</p>
            </div>
          </Link>
        </div>

        {/* Student Info Card */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{user?.name}</p>
              <p className="text-emerald-400/80 text-sm">{(user as any)?.lmsStudentId || 'Student'}</p>
            </div>
          </div>
          
          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-lg font-bold text-white">{dashboardStats.totalCourses}</p>
              <p className="text-[10px] text-gray-400">Courses</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-lg font-bold text-emerald-400">{dashboardStats.avgProgress}%</p>
              <p className="text-[10px] text-gray-400">Progress</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-lg font-bold text-amber-400">{certificatesData?.length || 0}</p>
              <p className="text-[10px] text-gray-400">Certs</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'emerald' },
            { id: 'my-courses', icon: BookOpen, label: 'My Courses', color: 'blue', badge: dashboardStats.totalCourses },
            { id: 'certificates', icon: Award, label: 'Certificates', color: 'amber' },
            { id: 'fee-payments', icon: CreditCard, label: 'Fee Payments', color: 'purple' },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden ${
                activeTab === item.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-white' : ''}`} />
              <span className="relative z-10 font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`ml-auto relative z-10 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === item.id ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-b border-white/5 z-50 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold">رُوحانی علم</span>
              <p className="text-emerald-400 text-xs">Student Portal</p>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout} 
            className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
        
        {/* Mobile Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'my-courses', label: 'Courses', icon: BookOpen },
            { id: 'certificates', label: 'Certs', icon: Award },
            { id: 'fee-payments', label: 'Fees', icon: CreditCard },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-72 pt-36 lg:pt-8 pb-8 px-4 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Welcome Header with Animation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E")` }} />
                
                <div className="relative p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-2"
                      >
                        <span className="text-2xl">{greeting.emoji}</span>
                        <span className="text-emerald-100">{greeting.text}</span>
                      </motion.div>
                      <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl lg:text-4xl font-bold text-white mb-2"
                      >
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">{user?.name?.split(' ')[0]}</span>!
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-emerald-100/80 text-lg"
                      >
                        Continue your spiritual learning journey ✨
                      </motion.p>
                      
                      {isLMSStudent && (user as any)?.lmsStudentId && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                        >
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white/70 text-xs">Student ID</p>
                            <p className="text-white font-semibold">{(user as any).lmsStudentId}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Decorative Element */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="hidden lg:block"
                    >
                      <div className="relative w-40 h-40">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-4 rounded-full border-2 border-dashed border-white/30"
                        />
                        <div className="absolute inset-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Rocket className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid with Hover Effects */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Enrolled Courses', value: dashboardStats.totalCourses, icon: BookOpen, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
                  { label: 'In Progress', value: dashboardStats.inProgressCourses, icon: Play, color: 'blue', gradient: 'from-blue-500 to-cyan-500', badge: `${dashboardStats.avgProgress}%` },
                  { label: 'Completed', value: dashboardStats.completedCourses, icon: CheckCircle2, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
                  { label: 'Certificates', value: certificatesData?.length || 0, icon: Trophy, color: 'purple', gradient: 'from-purple-500 to-pink-500' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    onHoverStart={() => setHoveredCard(stat.label)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="relative group cursor-pointer"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />
                    <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/10 group-hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div 
                          animate={hoveredCard === stat.label ? { rotate: [0, -10, 10, 0] } : {}}
                          transition={{ duration: 0.5 }}
                          className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        {stat.badge && (
                          <span className="text-sm font-semibold bg-white/10 px-2 py-1 rounded-lg text-gray-300">
                            {stat.badge}
                          </span>
                        )}
                      </div>
                      <motion.p 
                        className="text-4xl font-bold text-white mb-1"
                        key={stat.value}
                      >
                        <AnimatedCounter value={stat.value} />
                      </motion.p>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress & Activity Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Learning Progress */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-emerald-400" />
                        </div>
                        Learning Progress
                      </h3>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 rounded-full border-2 border-emerald-400/30 border-t-emerald-400"
                      />
                    </div>
                    
                    <div className="space-y-6">
                      {/* Circular Progress */}
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
                            <motion.circle
                              cx="48" cy="48" r="40"
                              stroke="url(#progressGradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: '0 251.2' }}
                              animate={{ strokeDasharray: `${dashboardStats.avgProgress * 2.512} 251.2` }}
                              transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                            <defs>
                              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{dashboardStats.avgProgress}%</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-400 mb-1">Overall Completion</p>
                          <p className="text-white text-lg font-semibold">
                            {dashboardStats.completedClasses} / {dashboardStats.totalClasses} Classes
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400 text-sm font-medium">Keep going!</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dashboardStats.avgProgress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        Recent Activity
                      </h3>
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </div>
                    
                    {recentCourses.length > 0 ? (
                      <div className="space-y-3">
                        {recentCourses.map((enrollment: Enrollment, index: number) => (
                          <motion.div
                            key={enrollment._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            whileHover={{ x: 4 }}
                          >
                            <Link
                              to={`/lms/course/${enrollment.course._id}`}
                              className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group/item"
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate group-hover/item:text-emerald-400 transition-colors">
                                  {enrollment.course.title}
                                </p>
                                <p className="text-gray-400 text-sm">{enrollment.progress?.percentage || 0}% complete</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-500 group-hover/item:text-emerald-400 group-hover/item:translate-x-1 transition-all" />
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                        </motion.div>
                        <p className="text-gray-400">No recent activity</p>
                        <p className="text-gray-500 text-sm mt-1">Start learning to see your progress here</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Continue Learning Section */}
              {dashboardStats.totalCourses > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                      <Zap className="w-6 h-6 text-yellow-400" />
                      Continue Learning
                    </h3>
                    <button 
                      onClick={() => setActiveTab('my-courses')}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 group"
                    >
                      View All
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(enrollmentsData || []).slice(0, 3).map((enrollment: Enrollment, index: number) => (
                      <motion.div
                        key={enrollment._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="group"
                      >
                        <Link
                          to={`/lms/course/${enrollment.course._id}`}
                          className="block bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-emerald-500/30 transition-all"
                        >
                          <div className="h-32 bg-gradient-to-br from-emerald-600 to-teal-600 relative overflow-hidden">
                            {enrollment.course?.image && (
                              <img
                                src={enrollment.course.image}
                                alt={enrollment.course.title}
                                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-white font-semibold truncate">{enrollment.course?.title}</p>
                            </div>
                            <div className="absolute top-3 right-3">
                              <motion.div
                                whileHover={{ rotate: 180 }}
                                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                              >
                                <Play className="w-4 h-4 text-white" />
                              </motion.div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="text-gray-400">{enrollment.progress?.completedClasses || 0}/{enrollment.progress?.totalClasses || 0} classes</span>
                              <span className="text-emerald-400 font-semibold">{enrollment.progress?.percentage || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${enrollment.progress?.percentage || 0}%` }}
                                transition={{ duration: 1, delay: 1 + index * 0.1 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl" />
                  <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-12 h-12 text-emerald-400" />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Courses Yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      You haven't been enrolled in any courses yet. Contact the admin to get started on your learning journey.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <Gift className="w-5 h-5" />
                      <span className="font-medium">Great courses await you!</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* My Courses Tab */}
          {activeTab === 'my-courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-emerald-400" />
                  My Courses
                </h2>
                {enrollmentsData?.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-72 pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </div>

              {loadingEnrollments ? (
                <div className="flex justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              ) : filteredEnrollments?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10"
                >
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white">No courses assigned yet</h3>
                  <p className="text-gray-400 mt-2 max-w-md mx-auto">
                    Your courses will appear here once admin enrolls you.
                  </p>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEnrollments?.map((enrollment: Enrollment, index: number) => (
                    <motion.div
                      key={enrollment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                      className={`group bg-slate-800/50 backdrop-blur-xl rounded-2xl overflow-hidden border ${
                        enrollment.accessBlocked ? 'border-red-500/50' : 'border-white/10 hover:border-emerald-500/30'
                      } transition-all`}
                    >
                      <div className="relative h-44">
                        {enrollment.course?.image ? (
                          <img
                            src={enrollment.course.image}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white/80" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                        
                        {/* Progress Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center justify-between text-white text-sm mb-2">
                            <span>{enrollment.progress?.percentage || 0}% Complete</span>
                            <span>{enrollment.progress?.completedClasses || 0}/{enrollment.progress?.totalClasses || 0}</span>
                          </div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${enrollment.progress?.percentage || 0}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                            />
                          </div>
                        </div>
                        
                        {enrollment.accessBlocked && (
                          <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Lock className="w-12 h-12 mx-auto mb-2" />
                              <p className="font-semibold">Access Blocked</p>
                              <p className="text-sm opacity-80">{enrollment.blockedReason}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg font-medium">
                            {enrollment.course?.category}
                          </span>
                          <span className="px-2.5 py-1 text-xs bg-slate-700 text-gray-300 rounded-lg">
                            {enrollment.course?.level}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                          {enrollment.course?.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{enrollment.course?.instructor}</p>

                        {enrollment.accessBlocked ? (
                          <button disabled className="w-full mt-4 py-3 bg-red-500/20 text-red-400 rounded-xl cursor-not-allowed font-medium">
                            Access Blocked
                          </button>
                        ) : (
                          <Link
                            to={`/lms/course/${enrollment.course?._id}`}
                            className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all font-medium group/btn"
                          >
                            <Play className="w-4 h-4" />
                            Continue Learning
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-400" />
                My Certificates
              </h2>
              
              {loadingCertificates ? (
                <div className="flex justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                    <Award className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-amber-400" />
                  </div>
                </div>
              ) : certificatesData?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10"
                >
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white">No certificates yet</h3>
                  <p className="text-gray-400 mt-2">Complete a course to earn your first certificate! 🎉</p>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificatesData?.map((cert: any, index: number) => (
                    <motion.div
                      key={cert._id}
                      initial={{ opacity: 0, y: 20, rotateY: -10 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, rotateY: 5 }}
                      className="group perspective-1000"
                    >
                      <div className="relative bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/30 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl" />
                        
                        <div className="relative text-center">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                          </motion.div>
                          <h3 className="font-bold text-white text-lg">{cert.courseTitle}</h3>
                          <p className="text-gray-400 mt-1">{cert.course?.category}</p>
                          <div className="mt-4 py-3 px-4 bg-slate-900/50 rounded-xl inline-block">
                            <p className="text-xs text-gray-400">Certificate Number</p>
                            <p className="font-mono font-bold text-emerald-400 text-lg">{cert.certificateNumber}</p>
                          </div>
                          <p className="text-sm text-gray-400 mt-4">
                            Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Link
                              to={`/lms/certificate/${cert._id}`}
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all font-medium group/btn"
                            >
                              <Award className="w-4 h-4" />
                              View
                            </Link>
                            <Link
                              to={`/lms/certificate/${cert._id}?download=true`}
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all font-medium group/btn"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Fee Payments Tab */}
          {activeTab === 'fee-payments' && (
            <motion.div
              key="fee-payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-purple-400" />
                Fee Payments
              </h2>
              
              {loadingFees ? (
                <div className="flex justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <Wallet className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-400" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Fee Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { 
                        label: 'Total Fee', 
                        value: `Rs ${(feeData?.summary?.totalAmount || 0).toLocaleString()}`, 
                        icon: DollarSign, 
                        gradient: 'from-blue-500 to-cyan-500',
                        bgColor: 'bg-blue-500/20'
                      },
                      { 
                        label: 'Paid', 
                        value: `Rs ${(feeData?.summary?.paidAmount || 0).toLocaleString()}`, 
                        icon: CheckCircle, 
                        gradient: 'from-emerald-500 to-teal-500',
                        bgColor: 'bg-emerald-500/20'
                      },
                      { 
                        label: 'Pending', 
                        value: `Rs ${(feeData?.summary?.pendingAmount || 0).toLocaleString()}`, 
                        icon: Clock, 
                        gradient: 'from-amber-500 to-orange-500',
                        bgColor: 'bg-amber-500/20'
                      },
                      { 
                        label: 'Overdue', 
                        value: feeData?.summary?.overdueCount || 0, 
                        icon: AlertCircle, 
                        gradient: 'from-red-500 to-pink-500',
                        bgColor: 'bg-red-500/20',
                        isCount: true
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="relative group cursor-pointer"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />
                        <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/10 group-hover:border-white/20 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                              <stat.icon className={`w-6 h-6 text-white`} />
                            </div>
                          </div>
                          <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                            {stat.isCount ? stat.value : stat.value}
                          </p>
                          <p className="text-gray-400 text-sm">{stat.label}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Payment Status Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Payment Progress
                    </h3>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Overall Payment</span>
                          <span className="text-emerald-400 font-semibold">
                            {feeData?.summary?.totalAmount > 0 
                              ? Math.round((feeData?.summary?.paidAmount / feeData?.summary?.totalAmount) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${feeData?.summary?.totalAmount > 0 
                                ? (feeData?.summary?.paidAmount / feeData?.summary?.totalAmount) * 100 
                                : 0}%` 
                            }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{feeData?.summary?.paidCount || 0}</p>
                          <p className="text-xs text-gray-400">Paid</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-400">{feeData?.summary?.pendingCount || 0}</p>
                          <p className="text-xs text-gray-400">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{feeData?.summary?.partialCount || 0}</p>
                          <p className="text-xs text-gray-400">Partial</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-400">{feeData?.summary?.overdueCount || 0}</p>
                          <p className="text-xs text-gray-400">Overdue</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Fee History Table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Fee History
                    </h3>
                    
                    {(feeData?.fees?.length === 0 || !feeData?.fees) ? (
                      <div className="text-center py-12">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                          <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                        </motion.div>
                        <p className="text-gray-400">No fee records found</p>
                        <p className="text-gray-500 text-sm mt-1">Your fee records will appear here once generated</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {feeData?.fees?.map((fee: FeeRecord, index: number) => (
                          <motion.div
                            key={fee._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className={`relative p-4 rounded-xl border ${
                              fee.status === 'paid' 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : fee.status === 'overdue'
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : fee.status === 'partial'
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-amber-500/10 border-amber-500/30'
                            } hover:scale-[1.01] transition-transform`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  fee.status === 'paid' 
                                    ? 'bg-emerald-500/20' 
                                    : fee.status === 'overdue'
                                      ? 'bg-red-500/20'
                                      : fee.status === 'partial'
                                        ? 'bg-blue-500/20'
                                        : 'bg-amber-500/20'
                                }`}>
                                  {fee.status === 'paid' ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                  ) : fee.status === 'overdue' ? (
                                    <AlertCircle className="w-6 h-6 text-red-400" />
                                  ) : (
                                    <Clock className="w-6 h-6 text-amber-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-semibold">{fee.month} {fee.year}</p>
                                  <p className="text-gray-400 text-sm">
                                    Due: {new Date(fee.dueDate).toLocaleDateString('en-US', { 
                                      month: 'short', day: 'numeric', year: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className="text-left md:text-right">
                                  <p className="text-gray-400 text-sm">Amount</p>
                                  <p className="text-white font-bold text-lg">Rs {fee.amount.toLocaleString()}</p>
                                </div>
                                
                                {fee.status !== 'paid' && fee.paidAmount > 0 && (
                                  <div className="text-left md:text-right">
                                    <p className="text-gray-400 text-sm">Paid</p>
                                    <p className="text-emerald-400 font-bold">Rs {fee.paidAmount.toLocaleString()}</p>
                                  </div>
                                )}
                                
                                <div className="text-left md:text-right">
                                  <p className="text-gray-400 text-sm">Remaining</p>
                                  <p className={`font-bold ${
                                    fee.amount - fee.paidAmount === 0 ? 'text-emerald-400' : 'text-amber-400'
                                  }`}>
                                    Rs {(fee.amount - fee.paidAmount).toLocaleString()}
                                  </p>
                                </div>
                                
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${
                                  fee.status === 'paid' 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : fee.status === 'overdue'
                                      ? 'bg-red-500/20 text-red-400'
                                      : fee.status === 'partial'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {fee.status}
                                </span>
                                
                                {/* Pay Now Button */}
                                {fee.status !== 'paid' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePayNow(fee)}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20"
                                  >
                                    <Banknote className="w-4 h-4" />
                                    Pay Now
                                  </motion.button>
                                )}
                              </div>
                            </div>
                            
                            {fee.paidDate && fee.status === 'paid' && (
                              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-sm">
                                <span className="text-gray-400">
                                  Paid on: {new Date(fee.paidDate).toLocaleDateString('en-US', { 
                                    month: 'long', day: 'numeric', year: 'numeric' 
                                  })}
                                </span>
                                {fee.paymentMethod && (
                                  <span className="text-gray-400">
                                    via <span className="text-emerald-400 capitalize">{fee.paymentMethod.replace('_', ' ')}</span>
                                  </span>
                                )}
                                {fee.transactionId && (
                                  <span className="text-gray-400">
                                    TXN: <span className="text-white font-mono">{fee.transactionId}</span>
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {fee.remarks && (
                              <div className="mt-2 text-sm text-gray-400">
                                <span className="text-gray-500">Note:</span> {fee.remarks}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Payment Instructions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-purple-400" />
                      Payment Instructions
                    </h3>
                    <div className="space-y-3 text-gray-300">
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-400 text-sm font-bold">1</span>
                        </span>
                        Make payment via Bank Transfer, Easypaisa, or JazzCash
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-400 text-sm font-bold">2</span>
                        </span>
                        Click "Pay Now" button and fill in your payment details
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-400 text-sm font-bold">3</span>
                        </span>
                        Admin will verify and approve your payment
                      </p>
                    </div>
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-xl">
                      <p className="text-sm text-gray-400 mb-2">Payment Account Details:</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-white"><span className="text-gray-400">Bank:</span> JazzCash / Easypaisa / Bank Transfer</p>
                        <p className="text-white"><span className="text-gray-400">Account:</span> Contact Admin for details</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* My Payment Requests */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-cyan-400" />
                      My Payment Requests
                    </h3>
                    
                    {loadingPaymentRequests ? (
                      <div className="flex justify-center py-8">
                        <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                      </div>
                    ) : (paymentRequests?.length === 0 || !paymentRequests) ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No payment requests yet</p>
                        <p className="text-gray-500 text-sm mt-1">Your submitted payments will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentRequests?.map((request: PaymentRequest, index: number) => (
                          <motion.div
                            key={request._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl border ${
                              request.status === 'approved' 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : request.status === 'rejected'
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : 'bg-cyan-500/10 border-cyan-500/30'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  request.status === 'approved' 
                                    ? 'bg-emerald-500/20' 
                                    : request.status === 'rejected'
                                      ? 'bg-red-500/20'
                                      : 'bg-cyan-500/20'
                                }`}>
                                  {request.status === 'approved' ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                  ) : request.status === 'rejected' ? (
                                    <X className="w-5 h-5 text-red-400" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-cyan-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {request.fee?.month} {request.fee?.year}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {new Date(request.createdAt).toLocaleDateString('en-US', { 
                                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-white font-bold">Rs {request.amount.toLocaleString()}</p>
                                  <p className="text-gray-400 text-xs capitalize">{request.paymentMethod.replace('_', ' ')}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${
                                  request.status === 'approved' 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : request.status === 'rejected'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                  {request.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-gray-400">
                              TXN ID: <span className="text-white font-mono">{request.transactionId}</span>
                            </div>
                            
                            {request.adminRemarks && (
                              <div className={`mt-2 text-sm ${
                                request.status === 'rejected' ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                Admin: {request.adminRemarks}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedFee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Banknote className="w-6 h-6" />
                      Complete Payment
                    </h3>
                    <p className="text-emerald-100 text-sm mt-1">
                      {selectedFee.month} {selectedFee.year}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitPayment} className="p-6 space-y-5">
                {/* Amount Summary */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
                  <p className="text-gray-400 text-sm">Amount to Transfer</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">
                    Rs {paymentForm.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Total Fee: Rs {selectedFee.amount.toLocaleString()} | 
                    Already Paid: Rs {selectedFee.paidAmount.toLocaleString()}
                  </p>
                </div>

                {/* Bank Details from Settings */}
                {bankDetails && (
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      Bank Transfer Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      {bankDetails.bankName && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bank Name:</span>
                          <span className="text-white font-medium">{bankDetails.bankName}</span>
                        </div>
                      )}
                      {bankDetails.accountTitle && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Title:</span>
                          <span className="text-white font-medium">{bankDetails.accountTitle}</span>
                        </div>
                      )}
                      {bankDetails.accountNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Number:</span>
                          <span className="text-white font-medium">{bankDetails.accountNumber}</span>
                        </div>
                      )}
                      {bankDetails.ibanNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">IBAN:</span>
                          <span className="text-white font-medium text-xs">{bankDetails.ibanNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* UPI QR Code for Indian Users */}
                {bankDetails?.upiQrCode && (
                  <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-xl p-5 border border-orange-500/30">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🇮🇳</span>
                      For Indian Users - UPI Payment
                    </h4>
                    <div className="flex flex-col items-center">
                      <img 
                        src={bankDetails.upiQrCode} 
                        alt="UPI QR Code" 
                        className="w-48 h-48 rounded-lg border-4 border-white/20 bg-white p-2"
                      />
                      {bankDetails.upiId && (
                        <div className="mt-3 text-center">
                          <p className="text-gray-400 text-sm">UPI ID:</p>
                          <p className="text-orange-400 font-medium">{bankDetails.upiId}</p>
                        </div>
                      )}
                      <p className="text-gray-400 text-xs mt-3 text-center">
                        Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Payment Screenshot *
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-emerald-500/50 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="payment-proof-upload"
                    />
                    <label htmlFor="payment-proof-upload" className="cursor-pointer block">
                      {paymentProof && imagePreview ? (
                        <div className="space-y-3">
                          <img 
                            src={imagePreview} 
                            alt="Payment Screenshot" 
                            className="max-h-40 mx-auto rounded-lg border border-white/20"
                          />
                          <div className="flex items-center justify-center gap-2 text-emerald-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">{paymentProof.name}</span>
                          </div>
                          {uploadingProof && (
                            <div className="flex items-center justify-center gap-2 text-amber-400">
                              <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                              <span className="text-xs">Uploading...</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">Click to change image</p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">Click to upload payment screenshot</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    required
                    placeholder="Enter transaction ID from your receipt"
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Sender Account Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Account Number (Last 4 digits)
                  </label>
                  <input
                    type="text"
                    value={paymentForm.accountNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                    placeholder="XXXX"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 bg-slate-800 text-gray-300 rounded-xl font-medium hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitPaymentMutation.isPending || uploadingProof || !paymentProof}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitPaymentMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </div>
  );
};

export default StudentLMSPage;
