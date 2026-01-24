import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import apiClient from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Course {
  _id: string
  title: string
  description: string
  shortDescription?: string
  image: string
  category: string
  duration: string
  level: string
  price: number
  priceINR?: number | null
  isPaid: boolean
  isFeatured: boolean
  isActive: boolean
  enrolledStudents?: number
}

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      console.log('Fetching courses from API...')
      const response = await apiClient.get('/courses?limit=100')
      console.log('API Response:', response.data)
      const coursesData = response.data.data || response.data || []
      console.log('Courses data:', coursesData)
      setCourses(coursesData)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
      setCourses([]) // Set empty array on error
    } finally {
      setLoading(false)
      console.log('Loading complete')
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    // Map related categories: spiritual includes roohani, nafsiati; hikmat includes jismani, medicine, healing
    let matchesCategory = selectedCategory === 'all'
    if (!matchesCategory) {
      const courseCat = course.category?.toLowerCase() || ''
      if (selectedCategory === 'spiritual') {
        matchesCategory = ['spiritual', 'roohani', 'nafsiati', 'spirituality'].includes(courseCat)
      } else if (selectedCategory === 'hikmat') {
        matchesCategory = ['hikmat', 'jismani', 'medicine', 'healing'].includes(courseCat)
      } else {
        matchesCategory = courseCat === selectedCategory.toLowerCase()
      }
    }
    return matchesSearch && matchesCategory && course.isActive
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Courses | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary-800 dark:text-white">Spiritual Courses</h1>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
          </div>
        </div>
        
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 sm:px-4 py-2 border rounded-lg flex-1 min-w-0 text-sm sm:text-base"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
          >
            <option value="all">All Categories</option>
            <option value="spiritual">Spiritual</option>
            <option value="hikmat">Hikmat</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => {
              // Beautiful gradient colors for each card
              const cardGradients = [
                'from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/30',
                'from-purple-500/10 via-violet-500/5 to-indigo-500/10 dark:from-purple-900/30 dark:via-violet-900/20 dark:to-indigo-900/30',
                'from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-rose-900/30',
                'from-blue-500/10 via-sky-500/5 to-cyan-500/10 dark:from-blue-900/30 dark:via-sky-900/20 dark:to-cyan-900/30',
                'from-pink-500/10 via-rose-500/5 to-red-500/10 dark:from-pink-900/30 dark:via-rose-900/20 dark:to-red-900/30',
                'from-lime-500/10 via-green-500/5 to-emerald-500/10 dark:from-lime-900/30 dark:via-green-900/20 dark:to-emerald-900/30',
                'from-fuchsia-500/10 via-purple-500/5 to-violet-500/10 dark:from-fuchsia-900/30 dark:via-purple-900/20 dark:to-violet-900/30',
                'from-teal-500/10 via-emerald-500/5 to-green-500/10 dark:from-teal-900/30 dark:via-emerald-900/20 dark:to-green-900/30',
              ]
              const borderColors = [
                'border-emerald-200 dark:border-emerald-700',
                'border-purple-200 dark:border-purple-700',
                'border-amber-200 dark:border-amber-700',
                'border-blue-200 dark:border-blue-700',
                'border-pink-200 dark:border-pink-700',
                'border-lime-200 dark:border-lime-700',
                'border-fuchsia-200 dark:border-fuchsia-700',
                'border-teal-200 dark:border-teal-700',
              ]
              const gradientIndex = index % cardGradients.length
              
              return (
              <div key={course._id} className={`bg-gradient-to-br ${cardGradients[gradientIndex]} border-2 ${borderColors[gradientIndex]} rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
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
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800 dark:text-white">{course.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {course.price === 0 ? 'FREE' : `PKR ${course.price}`}
                        {course.price > 0 && <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400"> / month</span>}
                      </p>
                      {course.priceINR && (
                        <p className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">
                          🇮🇳 ₹{course.priceINR.toLocaleString()} / month
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-semibold"
                      >
                        <BookOpen className="w-4 h-4" />
                        View Course
                      </Link>
                      {(course.enrolledStudents || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <span>👥</span>
                          <span>{course.enrolledStudents} enrolled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )})
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  )
}

