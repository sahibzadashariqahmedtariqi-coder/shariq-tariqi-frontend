import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { newsletterApi } from '@/services/apiService'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function Newsletter() {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await newsletterApi.subscribe(data.email)
      toast.success('Successfully subscribed to newsletter!')
      reset()
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white text-center"
      >
        <Mail className="h-12 w-12 mx-auto mb-4 text-gold-400" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Get the latest spiritual guidance, course updates, and healing remedies delivered to your inbox
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
              {errors.email && (
                <p className="text-sm text-red-300 mt-1 text-left">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gold-500 hover:bg-gold-600 text-gray-900 font-semibold px-8"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
        </form>

        <p className="text-sm mt-4 opacity-75">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </motion.div>
    </section>
  )
}
