import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Calendar, Megaphone, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface Update {
  id: number
  title: string
  description: string
  date: string
  type: 'announcement' | 'event' | 'news'
  link?: string
  image?: string
  promoImage?: string
}

export default function AdminUpdatesPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  const [updates, setUpdates] = useState<Update[]>([
    {
      id: 2,
      title: "Ruhani Punjab Tour",
      description: "Join us on an enlightening spiritual journey across Punjab. Experience divine blessings, spiritual healing sessions, and traditional Islamic teachings in multiple cities. A transformative tour to strengthen your connection with Allah.",
      date: "2025-11-20",
      type: "announcement",
      link: "/blog/2",
      image: "/images/ruhani-tour.jpg",
      promoImage: "/images/ruhani-promo.jpg"
    }
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [currentUpdate, setCurrentUpdate] = useState<Update | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'announcement' as 'announcement' | 'event' | 'news',
    link: '',
    image: '',
    promoImage: ''
  })

  const handleEdit = (update: Update) => {
    setCurrentUpdate(update)
    setFormData({
      title: update.title,
      description: update.description,
      date: update.date,
      type: update.type,
      link: update.link || '',
      image: update.image || '',
      promoImage: update.promoImage || ''
    })
    setIsEditing(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this update?')) {
      setUpdates(updates.filter(update => update.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUpdate) {
      setUpdates(updates.map(update =>
        update.id === currentUpdate.id
          ? { ...update, ...formData }
          : update
      ))
    } else {
      const newUpdate: Update = {
        id: Math.max(...updates.map(u => u.id), 0) + 1,
        ...formData
      }
      setUpdates([...updates, newUpdate])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      type: 'announcement',
      link: '',
      image: '',
      promoImage: ''
    })
    setCurrentUpdate(null)
    setIsEditing(false)
  }

  const typeConfig = {
    announcement: { icon: Megaphone, color: 'text-amber-600', bg: 'bg-amber-100' },
    event: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    news: { icon: Bell, color: 'text-green-600', bg: 'bg-green-100' }
  }

  return (
    <>
      <Helmet>
        <title>Manage Updates | Admin Dashboard</title>
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-2">
            Manage Updates
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Add, edit, or remove latest updates and announcements
          </p>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border-2 border-primary-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-primary-800 dark:text-white mb-6">
            {currentUpdate ? 'Edit Update' : 'Add New Update'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                  <option value="news">News</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/courses"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image Name (Optional)
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="update-1.jpg"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📏 Recommended: 200x200px (Square) | Max: 500KB | Format: JPG/PNG
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Save image in /public/images/ folder
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Promotional Image (Optional)
              </label>
              <input
                type="text"
                value={formData.promoImage}
                onChange={(e) => setFormData({ ...formData, promoImage: e.target.value })}
                placeholder="ruhani-promo.jpg"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📏 Recommended: 400x600px (Portrait 2:3 ratio) | Max: 500KB | Format: JPG/PNG
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Blinking promotional image shown on right side. Save in /public/images/
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                {currentUpdate ? 'Update' : 'Add Update'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary-800 dark:text-white mb-4">
            Current Updates ({updates.length})
          </h2>
          
          {updates.map((update) => {
            const config = typeConfig[update.type]
            const Icon = config.icon

            return (
              <div
                key={update.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`${config.bg} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${config.bg} ${config.color}`}>
                          {update.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(update.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {update.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {update.description}
                      </p>
                      
                      {update.link && (
                        <p className="text-sm text-primary-600 dark:text-primary-400">
                          Link: {update.link}
                        </p>
                      )}
                      
                      {update.image && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Image: {update.image}
                        </p>
                      )}
                      
                      {update.promoImage && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                          Promo Image: {update.promoImage} (Blinking on homepage)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(update)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
