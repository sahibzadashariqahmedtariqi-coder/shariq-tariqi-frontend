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
import { Shield, User, GraduationCap } from 'lucide-react'
import api from '@/services/api'

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 py-12 px-4">
          <div className="max-w-3xl w-full">
            <h1 className="text-4xl font-bold text-center mb-4 text-primary-800 dark:text-white">Welcome Back</h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Choose your login type to continue</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Admin Login Card */}
              <button
                onClick={() => handleLoginTypeSelect('admin')}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-gold-400 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Login</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Access admin dashboard, manage courses, products & appointments
                  </p>
                  <span className="inline-block px-4 py-2 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-full text-sm font-medium">
                    Administrator Access
                  </span>
                </div>
              </button>

              {/* LMS Student Login Card */}
              <button
                onClick={() => handleLoginTypeSelect('lms_student')}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-emerald-400 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">LMS Login</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Access your courses, watch lectures & track progress
                  </p>
                  <span className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                    Student Access
                  </span>
                </div>
              </button>
            </div>

            <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Back Button */}
          <button 
            onClick={() => setLoginType('select')}
            className="flex items-center text-gray-500 hover:text-primary-600 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to options
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${getGradientClass()}`}>
              {getLoginIcon()}
            </div>
            <h1 className="text-3xl font-bold">{getLoginTitle()}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {getLoginDescription()}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder={loginType === 'admin' ? 'admin@shariqahmedtariqi.com' : 'your@email.com'}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              className={`w-full ${getButtonClass()}`}
            >
              {getButtonText()}
            </Button>
          </form>

          {loginType === 'lms_student' && (
            <p className="text-center mt-6 text-sm text-gray-500">
              LMS student accounts are created by admin only.
              <br />Contact admin if you need access.
            </p>
          )}

          {loginType === 'user' && (
            <p className="text-center mt-6 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
