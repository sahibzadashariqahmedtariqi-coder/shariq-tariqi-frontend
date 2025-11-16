import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCoursesStore } from '@/stores/coursesStore'

export default function FeaturedCourses() {
  const { getFeaturedCourses } = useCoursesStore()
  const courses = getFeaturedCourses()

  return (
    <section className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary-800 dark:text-white mb-4">
          Featured Courses
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover our comprehensive courses in spiritual healing, Sufism, and traditional Islamic sciences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {courses.length > 0 ? (
          courses.slice(0, 3).map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x450/1B4332/D4AF37?text=Course+Image'
                  }}
                />
                <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {course.level}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary-600">
                    PKR {course.price}
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400"> / month</span>
                  </div>
                  <Link to={`/courses/${course.id}`}>
                    <Button className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      View Course
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No featured courses available. Add courses from Admin Dashboard.</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link to="/courses">
          <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg">
            View All Courses
          </Button>
        </Link>
      </div>
    </section>
  )
}
