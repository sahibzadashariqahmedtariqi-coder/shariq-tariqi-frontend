import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Users, Clock, Star, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCoursesStore } from '@/stores/coursesStore'
import CheckoutModal from '@/components/checkout/CheckoutModal'

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCourseById, fetchCourses, loading } = useCoursesStore()
  const [showCheckout, setShowCheckout] = useState(false)

  // Fetch courses from API to ensure latest data
  useEffect(() => {
    fetchCourses()
  }, [])
  
  const course = getCourseById(id || '')

  // Handle add to cart click - no login required
  const handleAddToCart = () => {
    setShowCheckout(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <>
        <Helmet>
          <title>Course Not Found | Sahibzada Shariq Ahmed Tariqi</title>
        </Helmet>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Course Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The course you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/courses')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>{course.title} | Sahibzada Shariq Ahmed Tariqi</title>
        <meta name="description" content={course.description} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          {/* Back Button */}
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold mb-8 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Course Image */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/800x450/1B4332/D4AF37?text=Course+Image'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
                        {course.level}
                      </span>
                      <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold capitalize">
                        {course.category}
                      </span>
                      {(course.featured || course.isFeatured) && (
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Star className="h-3 w-3" /> Featured
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-8">
                  <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                    {course.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{course.duration}</p>
                        </div>
                      </div>
                    )}
                    {(course.enrolledStudents !== undefined || course.students !== undefined) && (
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Students</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {course.enrolledStudents || course.students || 0} enrolled
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
                        <p className="font-semibold text-gray-800 dark:text-white capitalize">{course.level}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">About This Course</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {course.price === 0 ? 'FREE' : `PKR ${course.price}`}
                  </p>
                  {course.price > 0 && (
                    <p className="text-gray-500 dark:text-gray-400">per month</p>
                  )}
                </div>

                <Button 
                  size="lg" 
                  className="w-full mb-4 gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Expert instruction</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <span>Direct support</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Need help?</h3>
                  <Link to="/contact" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm">
                    Contact us for more information →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        orderType="course"
        itemId={course._id || ''}
        itemTitle={course.title}
        itemPrice={course.price}
      />
    </>
  )
}
