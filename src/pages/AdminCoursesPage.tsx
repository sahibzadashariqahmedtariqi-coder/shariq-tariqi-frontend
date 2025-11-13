import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Course {
  id: string
  title: string
  category: string
  price: number
  level: string
  image: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Tarbiyat ul Amileen',
      category: 'healing',
      price: 3000,
      level: 'Beginner to Advanced',
      image: '/images/tarbiyat-course.jpg',
    },
    {
      id: '2',
      title: 'Jabl E Amliyat Season 2 Surah e Muzzamil Special',
      category: 'spirituality',
      price: 3000,
      level: 'Advanced',
      image: '/images/jabl-amliyat.jpg',
    },
    {
      id: '3',
      title: 'Traditional Hikmat & Healing',
      category: 'medicine',
      price: 600,
      level: 'Intermediate',
      image: '/images/hikmat-tariqi.jpg',
    },
  ])

  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editForm, setEditForm] = useState<Course>({
    id: '',
    title: '',
    category: 'healing',
    price: 0,
    level: 'Beginner',
    image: '',
  })

  const handleEdit = (course: Course) => {
    setIsEditing(course.id)
    setEditForm(course)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter((c) => c.id !== id))
    }
  }

  const handleSave = () => {
    if (isAdding) {
      const newCourse = {
        ...editForm,
        id: Date.now().toString(),
      }
      setCourses([...courses, newCourse])
      setIsAdding(false)
    } else {
      setCourses(courses.map((c) => (c.id === editForm.id ? editForm : c)))
      setIsEditing(null)
    }
    setEditForm({
      id: '',
      title: '',
      category: 'healing',
      price: 0,
      level: 'Beginner',
      image: '',
    })
  }

  const handleCancel = () => {
    setIsEditing(null)
    setIsAdding(false)
    setEditForm({
      id: '',
      title: '',
      category: 'healing',
      price: 0,
      level: 'Beginner',
      image: '',
    })
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setIsEditing(null)
    setEditForm({
      id: '',
      title: '',
      category: 'healing',
      price: 0,
      level: 'Beginner',
      image: '',
    })
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
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-5 w-5" />
            Add New Course
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {isAdding ? 'Add New Course' : 'Edit Course'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter course title"
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
                  <option value="Beginner to Advanced">Beginner to Advanced</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Image Path</label>
                <input
                  type="text"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="/images/course-image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload image to public/images/ folder and enter path here
                </p>
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
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="bg-primary-100 dark:bg-primary-900 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="bg-gold-100 dark:bg-gold-900 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-600 mt-3">
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
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Upload course images to <code>public/images/</code> folder first</li>
            <li>Use image names like: course-name.jpg</li>
            <li>Recommended image size: 800x450 pixels (16:9 ratio)</li>
            <li>Changes are saved in browser memory (for demo purposes)</li>
            <li>For production: Connect to backend API to save permanently</li>
          </ul>
        </div>
      </div>
    </>
  )
}
