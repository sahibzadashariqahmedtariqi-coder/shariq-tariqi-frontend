import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      id: '1',
      name: 'Ahmed Ali',
      text: 'The Spiritual courses transformed my life. Sahibzada Shariq Ahmed Tariqi\'s teachings are profound and life-changing.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Ahmed+Ali&background=1B4332&color=fff',
    },
    {
      id: '2',
      name: 'Fatima Khan',
      text: 'I found spiritual peace through the guidance provided. The istikhara service was incredibly accurate.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Fatima+Khan&background=1B4332&color=fff',
    },
    {
      id: '3',
      name: 'Muhammad Hassan',
      text: 'The traditional Hikmat treatments worked wonders. Truly blessed to have found this spiritual sanctuary.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Muhammad+Hassan&background=1B4332&color=fff',
    },
  ]

  return (
    <section className="bg-primary-50 dark:bg-primary-900/20 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-800 dark:text-white mb-4">
            What People Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear from those who have benefited from our spiritual guidance and healing services
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-gold-400 opacity-50" />
              
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </h3>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 italic">
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
