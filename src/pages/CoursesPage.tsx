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
            filteredCourses.map((course) => (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
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
                    <Link
                      to={`/courses/${course._id}`}
                      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-semibold"
                    >
                      <BookOpen className="w-4 h-4" />
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            ))
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

