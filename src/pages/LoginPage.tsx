import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/apiService'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Login attempt with:', data.email)
      const response = await authApi.login(data.email, data.password)
      console.log('Full login response:', response)
      console.log('Response data:', response.data)
      
      // Backend returns: { success: true, message: string, data: { ...user fields, token } }
      const responseData = response.data?.data || response.data
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

  return (
    <>
      <Helmet>
        <title>Login | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full">Login</Button>
          </form>

          <p className="text-center mt-6 text-sm">
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
