// Beautiful Login Page with Dark Theme - Updated Feb 2026
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/apiService'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Shield, User, GraduationCap, Sparkles } from 'lucide-react'
import api from '@/services/api'
import { motion } from 'framer-motion'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>
type LoginType = 'select' | 'admin' | 'user' | 'lms_student'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [loginType, setLoginType] = useState<LoginType>('select')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleLoginTypeSelect = (type: 'admin' | 'user' | 'lms_student') => {
    setLoginType(type)
    if (type === 'admin') {
      setValue('email', 'admin@shariqahmedtariqi.com')
      setValue('password', '')
    } else {
      setValue('email', '')
      setValue('password', '')
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      // Special handling for LMS student login
      if (loginType === 'lms_student') {
        const response = await api.post('/lms/student-login', {
          email: data.email,
          password: data.password
        });
        
        const responseData = response.data?.data || response.data;
        
        if (responseData && responseData.token) {
          const token = responseData.token;
          let user = { ...responseData };
          delete user.token;
          
          if (user._id && !user.id) {
            user = { ...user, id: user._id };
          }
          
          setUser(user);
          setToken(token);
          
          toast.success('Login successful! Welcome to LMS');
          
          setTimeout(() => {
            navigate('/lms', { replace: true });
          }, 100);
        } else {
          toast.error('Invalid response from server');
        }
        return;
      }

      // Regular login flow for admin/user
      console.log('Login attempt with:', data.email)
      const response = await authApi.login(data.email, data.password)
      console.log('Full login response:', response)
      console.log('Response data:', response.data)
      
      // Backend returns: { success: true, message: string, data: { ...user fields, token } }
      const responseData = (response.data as any)?.data || response.data
      console.log('Extracted data:', responseData)
      
      // Check if token exists directly in responseData
      if (responseData && responseData.token) {
        const token = responseData.token
        // User data is in responseData directly (not nested)
        let user = { ...responseData }
        delete user.token // Remove token from user object
        
        console.log('Setting user:', user)
        console.log('Setting token:', token)
        
        // Convert _id to id for frontend compatibility
        if (user._id && !user.id) {
          user = { ...user, id: user._id }
        }
        
        setUser(user)
        setToken(token)
        
        toast.success('Login successful!')
        
        // Small delay to ensure state updates
        setTimeout(() => {
          const userRole = user.role || 'user'
          console.log('User role:', userRole)
          
          if (userRole === 'admin') {
            console.log('Navigating to /admin')
            navigate('/admin', { replace: true })
          } else {
            console.log('Navigating to /dashboard')
            navigate('/dashboard', { replace: true })
          }
        }, 100)
      } else {
        console.error('Invalid response structure:', response)
        console.error('ResponseData:', responseData)
        toast.error('Invalid response from server')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error response:', error.response)
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(errorMessage)
    }
  }

  // Login Type Selection Screen
  if (loginType === 'select') {
    return (
      <>
        <Helmet>
          <title>Login | Sahibzada Shariq Ahmed Tariqi</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-primary-950 dark:via-primary-900 dark:to-emerald-950 py-12 px-4 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10 dark:opacity-50" />
          </div>
          
          {/* Decorative Glow Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-gold-500/30 to-amber-500/20 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-500/30 to-teal-500/20 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/20 to-purple-500/10 rounded-full blur-3xl" 
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gold-400/40 rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) 
                }}
                animate={{ 
                  y: [null, -100],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl w-full relative z-10"
          >
            {/* Header Section */}
            <div className="text-center mb-12">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 rounded-3xl shadow-2xl shadow-gold-500/30 mb-6 relative"
              >
                <Shield className="w-12 h-12 text-white" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-3xl border-2 border-dashed border-gold-300/30"
                />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-900 via-primary-700 to-primary-900 dark:from-white dark:via-gold-100 dark:to-white bg-clip-text text-transparent"
              >
                Welcome Back
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-300/80"
              >
                Choose your login type to continue
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {/* Admin Login Card */}
              <motion.button
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLoginTypeSelect('admin')}
                className="relative bg-white shadow-lg dark:bg-white/5 backdrop-blur-xl rounded-3xl dark:shadow-2xl p-8 border border-gray-200 dark:border-white/10 group overflow-hidden"
              >
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 via-gold-500/0 to-gold-500/0 group-hover:from-gold-500/10 group-hover:via-amber-500/5 group-hover:to-orange-500/10 transition-all duration-500 rounded-3xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
                </div>
                
                <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-gold-400 via-amber-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl shadow-gold-500/20 relative">
                    <Shield className="w-12 h-12 text-white" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-100 transition-colors">Admin Login</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    Access admin dashboard, manage courses, products & appointments
                  </p>
                  <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold-500/20 to-amber-500/20 border border-gold-400/40 dark:border-gold-400/30 text-gold-600 dark:text-gold-300 rounded-full text-sm font-semibold group-hover:border-gold-400/60 dark:group-hover:border-gold-400/50 transition-colors">
                    <Shield className="w-4 h-4" />
                    Administrator Access
                  </span>
                </div>
              </motion.button>

              {/* LMS Student Login Card */}
              <motion.button
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLoginTypeSelect('lms_student')}
                className="relative bg-white shadow-lg dark:bg-white/5 backdrop-blur-xl rounded-3xl dark:shadow-2xl p-8 border border-gray-200 dark:border-white/10 group overflow-hidden"
              >
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-teal-500/5 group-hover:to-cyan-500/10 transition-all duration-500 rounded-3xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                </div>
                
                <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl shadow-emerald-500/20 relative">
                    <GraduationCap className="w-12 h-12 text-white" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-100 transition-colors">LMS Login</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    Access your courses, watch lectures & track progress
                  </p>
                  <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-300 rounded-full text-sm font-semibold group-hover:border-emerald-400/60 dark:group-hover:border-emerald-400/50 transition-colors">
                    <GraduationCap className="w-4 h-4" />
                    Student Access
                  </span>
                </div>
              </motion.button>
            </div>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-12"
            >
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all text-sm backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </>
    )
  }

  // Login Form Screen
  const getLoginTitle = () => {
    if (loginType === 'admin') return 'Admin Login';
    if (loginType === 'lms_student') return 'LMS Student Login';
    return 'User Login';
  };

  const getLoginDescription = () => {
    if (loginType === 'admin') return 'Enter your admin credentials';
    if (loginType === 'lms_student') return 'Enter your student credentials provided by admin';
    return 'Enter your account credentials';
  };

  const getLoginIcon = () => {
    if (loginType === 'admin') return <Shield className="w-8 h-8 text-white" />;
    if (loginType === 'lms_student') return <GraduationCap className="w-8 h-8 text-white" />;
    return <User className="w-8 h-8 text-white" />;
  };

  const getGradientClass = () => {
    if (loginType === 'admin') return 'bg-gradient-to-br from-gold-400 to-gold-600';
    if (loginType === 'lms_student') return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
    return 'bg-gradient-to-br from-primary-400 to-primary-600';
  };

  const getButtonClass = () => {
    if (loginType === 'admin') return 'bg-gold-500 hover:bg-gold-600 text-primary-900';
    if (loginType === 'lms_student') return 'bg-emerald-600 hover:bg-emerald-700';
    return 'bg-primary-600 hover:bg-primary-700';
  };

  const getButtonText = () => {
    if (loginType === 'admin') return 'Login as Admin';
    if (loginType === 'lms_student') return 'Login to LMS';
    return 'Login';
  };

  return (
    <>
      <Helmet>
        <title>{getLoginTitle()} | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-primary-950 dark:via-primary-900 dark:to-emerald-950 py-12 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10 dark:opacity-50" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gold-500/10 dark:from-gold-500/20 to-amber-500/5 dark:to-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 dark:from-emerald-500/20 to-teal-500/5 dark:to-teal-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full relative z-10"
        >
          {/* Glass Card */}
          <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl p-8 border border-gray-200 dark:border-white/10">
            {/* Back Button */}
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setLoginType('select')}
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to options
            </motion.button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-xl ${getGradientClass()}`}
              >
                {getLoginIcon()}
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                {getLoginTitle()}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 dark:text-gray-400 mt-2"
              >
                {getLoginDescription()}
              </motion.p>
            </div>

            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  placeholder={loginType === 'admin' ? 'admin@shariqahmedtariqi.com' : 'your@email.com'}
                />
                {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className={`w-full py-3 rounded-xl font-semibold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${getButtonClass()}`}
              >
                {getButtonText()}
              </Button>
            </motion.form>

            {loginType === 'lms_student' && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6 text-sm text-gray-500 bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5"
              >
                LMS student accounts are created by admin only.
                <br />
                <span className="text-gray-600 dark:text-gray-400">Contact admin if you need access.</span>
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
