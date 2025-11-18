import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Save, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import apiClient from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    studentsTrained: 0,
    averageRating: 0,
    coursesOffered: 0,
    subscribers: 0,
    yearsOfExperience: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/stats')
      const data = response.data.data || response.data
      setStats({
        studentsTrained: data.studentsTrained,
        averageRating: data.averageRating,
        coursesOffered: data.coursesOffered,
        subscribers: data.subscribers,
        yearsOfExperience: data.yearsOfExperience,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate rating
    if (stats.averageRating < 0 || stats.averageRating > 5) {
      toast.error('Average rating must be between 0 and 5')
      return
    }

    try {
      setSaving(true)
      await apiClient.put('/stats', stats)
      toast.success('✅ Stats updated successfully!')
      await fetchStats() // Refresh data
    } catch (error: any) {
      console.error('Error updating stats:', error)
      toast.error(error.response?.data?.message || 'Failed to update stats')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setStats(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Admin - Manage Statistics | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          <h1 className="text-4xl font-bold text-primary-800 dark:text-white">
            Manage Statistics
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Students Trained */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Students Trained
              </label>
              <input
                type="number"
                value={stats.studentsTrained}
                onChange={(e) => handleChange('studentsTrained', e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Total number of students you have trained
              </p>
            </div>

            {/* Average Rating */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Average Rating (0-5)
              </label>
              <input
                type="number"
                value={stats.averageRating}
                onChange={(e) => handleChange('averageRating', e.target.value)}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Average rating from students (maximum 5.0)
              </p>
            </div>

            {/* Courses Offered */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Courses Offered
              </label>
              <input
                type="number"
                value={stats.coursesOffered}
                onChange={(e) => handleChange('coursesOffered', e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Total number of courses available
              </p>
            </div>

            {/* Subscribers */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                YouTube Subscribers (in K)
              </label>
              <input
                type="number"
                value={stats.subscribers}
                onChange={(e) => handleChange('subscribers', e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                YouTube subscribers in thousands (e.g., 27.4 for 27.4K)
              </p>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Years of Experience
              </label>
              <input
                type="number"
                value={stats.yearsOfExperience}
                onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Years of experience in spiritual healing
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save Statistics'}
              </Button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Preview (Homepage Display)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.studentsTrained.toLocaleString()}+
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Students Trained</p>
              </div>
              <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Average Rating</p>
              </div>
              <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.coursesOffered}+
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Courses Offered</p>
              </div>
              <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.subscribers}K+
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Subscribers</p>
              </div>
              <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.yearsOfExperience}+
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
