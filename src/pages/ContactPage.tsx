import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      console.log(data)
      toast.success('Message sent successfully!')
      reset()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-8 text-center">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a href="mailto:info@drabdulwajidshazli.com" className="text-gray-600 hover:text-primary-500">
                    info@drabdulwajidshazli.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-gray-600">Available for consultations</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Location</h3>
                  <p className="text-gray-600">Karachi, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
