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
      const response = await authApi.login(data.email, data.password)
      setUser(response.data.user)
      setToken(response.data.token)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
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
