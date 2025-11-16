import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X, Star, RefreshCw } from 'lucide-react'
import { useCoursesStore, type Course } from '@/stores/coursesStore'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import ImageDebugPanel from '@/components/admin/ImageDebugPanel'

export default function AdminCoursesPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  const { courses, addCourse, updateCourse, deleteCourse } = useCoursesStore()

  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: 'healing',
    price: 0,
    level: 'Beginner',
    image: '',
    duration: '',
    students: 0,
    featured: false,
  })

  const handleEdit = (course: Course) => {
    setIsEditing(course.id)
    setEditForm(course)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      deleteCourse(id)
      toast.success('Course deleted successfully!')
    }
  }

  const handleSave = () => {
    if (!editForm.title || !editForm.description || !editForm.image) {
      toast.error('Please fill in all required fields!')
      return
    }

    // Auto-fix image path - convert full path to relative path
    let imagePath = editForm.image
    if (imagePath.includes('\\public\\images\\') || imagePath.includes('/public/images/')) {
      // Extract filename from full path
      const filename = imagePath.split(/[\\\/]/).pop()
      imagePath = `/images/${filename}`
      toast.success(`Auto-fixed image path to: ${imagePath}`)
    } else if (!imagePath.startsWith('/images/')) {
      // Add /images/ prefix if missing
      imagePath = `/images/${imagePath.replace(/^\/+/, '')}`
    }

    const courseData = { ...editForm, image: imagePath }

    if (isAdding) {
      addCourse(courseData as Omit<Course, 'id'>)
      toast.success('Course added successfully!')
      setIsAdding(false)
    } else if (isEditing) {
      updateCourse(isEditing, courseData)
      toast.success('Course updated successfully!')
      setIsEditing(null)
    }
    setEditForm({
      title: '',
      description: '',
      category: 'healing',
      price: 0,
      level: 'Beginner',
      image: '',
      duration: '',
      students: 0,
      featured: false,
    })
  }

  const handleCancel = () => {
    setIsEditing(null)
    setIsAdding(false)
    setEditForm({
      title: '',
      description: '',
      category: 'healing',
      price: 0,
      level: 'Beginner',
      image: '',
      duration: '',
      students: 0,
      featured: false,
    })
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setIsEditing(null)
    setEditForm({
      title: '',
      description: '',
      category: 'healing',
      price: 0,
      level: 'Beginner',
      image: '',
      duration: '',
      students: 0,
      featured: false,
    })
  }

  const handleResetStorage = () => {
    if (confirm('⚠️ WARNING: This will delete ALL courses data from localStorage and reset to default. Continue?')) {
      localStorage.removeItem('courses-storage')
      window.location.reload()
      toast.success('Storage reset successfully! Page will reload.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin - Manage Courses | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white">
            Manage Courses
          </h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowDebug(!showDebug)} 
              variant="outline" 
              className="gap-2 text-blue-600 hover:text-blue-700"
            >
              🔧 {showDebug ? 'Hide' : 'Show'} Debug Panel
            </Button>
            <Button onClick={handleResetStorage} variant="outline" className="gap-2 text-red-600 hover:text-red-700 border-red-300">
              <RefreshCw className="h-5 w-5" />
              Reset Storage
            </Button>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-5 w-5" />
              Add New Course
            </Button>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && <ImageDebugPanel />}

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {isAdding ? 'Add New Course' : 'Edit Course'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <input
                  type="text"
                  value={editForm.duration || ''}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., 8 weeks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="healing">Healing</option>
                  <option value="spirituality">Spirituality</option>
                  <option value="medicine">Medicine</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (PKR/month)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <select
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner to Advanced">Beginner to Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Students Enrolled</label>
                <input
                  type="number"
                  value={editForm.students || 0}
                  onChange={(e) => setEditForm({ ...editForm, students: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Number of students"
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter course description"
                  rows={3}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Image Path *</label>
                <input
                  type="text"
                  value={editForm.image || ''}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="/images/course-image.jpg"
                  required
                />
                
                {/* Image Preview */}
                {editForm.image && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    <img
                      src={editForm.image.includes('\\public\\images\\') || editForm.image.includes('/public/images/') 
                        ? `/images/${editForm.image.split(/[\\\/]/).pop()}` 
                        : editForm.image.startsWith('/images/') 
                        ? editForm.image 
                        : `/images/${editForm.image}`}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/800x450/EF4444/FFFFFF?text=Image+Not+Found+❌'
                        e.currentTarget.classList.add('opacity-50')
                      }}
                      onLoad={(e) => {
                        e.currentTarget.classList.remove('opacity-50')
                        e.currentTarget.classList.add('border-green-500')
                      }}
                    />
                  </div>
                )}
                
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✅ TIP: You can paste full path - we'll auto-convert it! Just paste: C:\...\public\images\filename.jpg
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  📏 Recommended: 800x450px (16:9 ratio) | Max: 500KB | Format: JPG/PNG
                </p>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">✅ Available Images (click filename to view):</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'tarbiyat-course.jpg',
                      'jabl-amliyat.jpg',
                      'jabl-amliyat-1.jpg',
                      'hikmat-tariqi.jpg',
                      'free-amliyat.jpg',
                      'Jabl-E-Amliyat-Season-1.jpg'
                    ].map(filename => (
                      <button
                        key={filename}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, image: `/images/${filename}` })}
                        className="text-left bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {filename}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editForm.featured || false}
                  onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="featured" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Star className="h-4 w-4 text-gold-500" />
                  Mark as Featured (Show on homepage)
                </label>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Course
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-center gap-6"
            >
              <img
                src={course.image}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/400x400/1B4332/D4AF37?text=No+Image'
                  e.currentTarget.classList.add('opacity-50')
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{course.title}</h3>
                  {course.featured && (
                    <Star className="h-5 w-5 text-gold-500 fill-gold-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{course.description}</p>
                <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2 flex-wrap">
                  <span className="bg-primary-100 dark:bg-primary-900 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="bg-gold-100 dark:bg-gold-900 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                  {course.duration && (
                    <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                      {course.duration}
                    </span>
                  )}
                  {course.students !== undefined && (
                    <span className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                      {course.students} students
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  PKR {course.price}
                  <span className="text-sm font-bold text-gray-500"> / month</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(course)}
                  variant="outline"
                  size="icon"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(course.id)}
                  variant="outline"
                  size="icon"
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold mb-3 text-primary-800 dark:text-white">✅ Integration Active - Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li><strong>✨ Real-time Integration:</strong> All changes are automatically synced to Courses Page and Homepage</li>
            <li><strong>📸 Images:</strong> Upload to <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">public/images/</code> folder first</li>
            <li><strong>🔤 Filename:</strong> Use exact lowercase filename (e.g., <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">/images/jabl-amliyat.jpg</code>)</li>
            <li><strong>🎯 Featured:</strong> Check "Featured" to show course on homepage (max 3 recommended)</li>
            <li><strong>💾 Persistence:</strong> Data saved in browser localStorage (persists on refresh)</li>
            <li><strong>🔄 Reset:</strong> Use "Reset Storage" button to clear localStorage and reload defaults</li>
            <li><strong>⭐ Image Size:</strong> Recommended 800x450px (16:9 ratio) for best display</li>
          </ul>
        </div>
      </div>
    </>
  )
}
