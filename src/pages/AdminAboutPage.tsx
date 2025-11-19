import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Save, Upload, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { uploadApi } from '@/services/apiService'
import api from '@/services/api'

interface AboutSettings {
  profileImage: string
  yearsExperience: number
  peopleHelped: number
  introductionText: string
  descriptionText: string
}

export default function AdminAboutPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const [uploading, setUploading] = useState(false)
  const [settings, setSettings] = useState<AboutSettings>({
    profileImage: '/images/about-profile.jpg',
    yearsExperience: 15,
    peopleHelped: 5000,
    introductionText: 'Sahibzada Shariq Ahmed Tariqi is a dedicated spiritual healer and practitioner of traditional Islamic medicine. With deep knowledge in Roohaniyat (spirituality) and Hikmat (traditional Islamic medicine), he serves humanity through the prophetic traditions of healing.',
    descriptionText: 'Through years of dedicated study and practice, Sahibzada Shariq Ahmed Tariqi has mastered the art of spiritual healing and traditional Islamic medicine, helping countless individuals find peace, health, and spiritual enlightenment.'
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const saved = localStorage.getItem('aboutSettings')
    let localData = saved ? JSON.parse(saved) : {}
    
    try {
      // Fetch from database
      const response = await api.get('/stats')
      const stats = response.data.data
      
      setSettings({
        profileImage: localData.profileImage || '/images/about-profile.jpg',
        yearsExperience: stats.yearsOfExperience || 15,
        peopleHelped: stats.studentsTrained || 5000,
        introductionText: localData.introductionText || settings.introductionText,
        descriptionText: localData.descriptionText || settings.descriptionText
      })
    } catch (error) {
      console.error('Error loading from database:', error)
      // Fallback to localStorage
      if (saved) {
        try {
          setSettings(JSON.parse(saved))
        } catch (err) {
          console.error('Error parsing saved settings:', err)
        }
      }
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      toast.loading('Uploading image to Cloudinary...')
      
      const response = await uploadApi.uploadImage(file, 'about')
      const imageUrl = response.data.data.url
      
      setSettings({ ...settings, profileImage: imageUrl })
      toast.dismiss()
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Failed to upload image')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Save to database
      await api.put('/stats', {
        yearsOfExperience: settings.yearsExperience,
        studentsTrained: settings.peopleHelped
      })
      
      // Save to localStorage
      localStorage.setItem('aboutSettings', JSON.stringify(settings))
      toast.success('About page settings saved successfully!')
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage About Page | Admin Dashboard</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900">
        <div className="container mx-auto px-4 py-16">
          <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </Link>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-2">
              Manage About Page
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Update profile image, statistics, and content for the About page
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-6">
              
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                
                {/* Image Size Instructions */}
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">📐 Recommended Image Size:</p>
                      <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-xs">
                        <li>• <strong>Dimensions:</strong> 800x1000px (Portrait 4:5 ratio)</li>
                        <li>• <strong>File Size:</strong> Max 5MB</li>
                        <li>• <strong>Format:</strong> JPG, PNG, or WebP</li>
                        <li>• <strong>Tip:</strong> Professional portrait photo works best</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          await handleImageUpload(file)
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-primary-600">
                        <Upload className="w-4 h-4 animate-bounce" />
                        Uploading...
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR paste URL</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={settings.profileImage}
                    onChange={(e) => setSettings({ ...settings, profileImage: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>

                {/* Image Preview */}
                {settings.profileImage && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                    <img 
                      src={settings.profileImage} 
                      alt="Profile Preview" 
                      className="w-40 h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Years Experience
                  </label>
                  <input
                    type="number"
                    value={settings.yearsExperience}
                    onChange={(e) => setSettings({ ...settings, yearsExperience: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    People Helped
                  </label>
                  <input
                    type="number"
                    value={settings.peopleHelped}
                    onChange={(e) => setSettings({ ...settings, peopleHelped: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Introduction Text */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Introduction Text
                </label>
                <textarea
                  value={settings.introductionText}
                  onChange={(e) => setSettings({ ...settings, introductionText: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Introduction paragraph..."
                />
              </div>

              {/* Description Text */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description Text
                </label>
                <textarea
                  value={settings.descriptionText}
                  onChange={(e) => setSettings({ ...settings, descriptionText: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Description paragraph..."
                />
              </div>

            </div>

            <div className="mt-6">
              <Button
                onClick={handleSave}
                className="bg-primary-600 hover:bg-primary-700 gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
