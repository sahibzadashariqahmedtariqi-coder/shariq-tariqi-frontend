import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCoursesStore } from '@/stores/coursesStore'
import { useEffect } from 'react'

export default function FeaturedCourses() {
  const { getFeaturedCourses, fetchCourses, loading } = useCoursesStore()
  const courses = getFeaturedCourses()

  // Fetch courses from API on mount
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return (
    <section className="container mx-auto px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-12"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800 dark:text-white mb-3 sm:mb-4">
          Featured Courses
        </h2>
        <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
          Discover our comprehensive courses in spiritual healing, Sufism, and traditional Islamic sciences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
        {loading ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : courses.length > 0 ? (
          courses.slice(0, 3).map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-36 sm:h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x450/1B4332/D4AF37?text=Course+Image'
                  }}
                />
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gold-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold capitalize">
                  {course.level}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2 text-sm">
                  {course.description}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-primary-600">
                      {course.price === 0 ? 'FREE' : `PKR ${course.price}`}
                      {course.price > 0 && <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400"> / month</span>}
                    </div>
                    {course.priceINR && (
                      <div className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">
                        🇮🇳 ₹{course.priceINR.toLocaleString()} / month
                      </div>
                    )}
                  </div>
                  <Link to={`/courses/${course.id}`}>
                    <Button className="gap-2 w-full sm:w-auto" size="sm">
                      <BookOpen className="h-4 w-4" />
                      View Course
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No featured courses available. Add courses from Admin Dashboard.</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link to="/courses">
          <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
            View All Courses
          </Button>
        </Link>
      </div>
    </section>
  )
}
