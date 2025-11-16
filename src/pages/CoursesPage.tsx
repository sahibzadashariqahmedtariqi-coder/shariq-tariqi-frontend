import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useCoursesStore } from '@/stores/coursesStore'

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { getFilteredCourses } = useCoursesStore()
  const courses = getFilteredCourses(selectedCategory, searchTerm)

  return (
    <>
      <Helmet>
        <title>Courses | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white">Spiritual Courses</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
          </div>
        </div>
        
        <div className="mb-8 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg flex-1 min-w-[250px]"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="healing">Healing</option>
            <option value="spirituality">Spirituality</option>
            <option value="medicine">Medicine</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
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
                  <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">{course.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        PKR {course.price}
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400"> / month</span>
                      </p>
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
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
    </>
  )
}
