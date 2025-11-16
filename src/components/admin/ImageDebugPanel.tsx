import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ImageStatus {
  path: string
  status: 'checking' | 'success' | 'error'
  statusCode?: number
}

export default function ImageDebugPanel() {
  const [images, setImages] = useState<ImageStatus[]>([
    { path: '/images/tarbiyat-course.jpg', status: 'checking' },
    { path: '/images/jabl-amliyat.jpg', status: 'checking' },
    { path: '/images/jabl-amliyat-1.jpg', status: 'checking' },
    { path: '/images/Jabl-E-Amliyat-Season-1.jpg', status: 'checking' },
    { path: '/images/hikmat-tariqi.jpg', status: 'checking' },
    { path: '/images/free-amliyat.jpg', status: 'checking' },
  ])
  const [storageInfo, setStorageInfo] = useState<any>(null)

  const checkImages = async () => {
    setImages(prev => prev.map(img => ({ ...img, status: 'checking' })))

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      try {
        const response = await fetch(img.path)
        setImages(prev => {
          const newImages = [...prev]
          newImages[i] = {
            ...newImages[i],
            status: response.ok ? 'success' : 'error',
            statusCode: response.status
          }
          return newImages
        })
      } catch (error) {
        setImages(prev => {
          const newImages = [...prev]
          newImages[i] = {
            ...newImages[i],
            status: 'error',
            statusCode: 0
          }
          return newImages
        })
      }
    }
  }

  const checkStorage = () => {
    try {
      const storage = localStorage.getItem('courses-storage')
      if (storage) {
        const parsed = JSON.parse(storage)
        setStorageInfo(parsed)
      } else {
        setStorageInfo({ message: 'No data in localStorage' })
      }
    } catch (error) {
      setStorageInfo({ error: 'Failed to parse localStorage' })
    }
  }

  const clearStorage = () => {
    if (confirm('Clear localStorage and reload page?')) {
      localStorage.removeItem('courses-storage')
      window.location.reload()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <AlertCircle className="h-6 w-6 text-blue-500" />
        Image Debug Panel
      </h2>

      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={checkImages} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Check All Images
          </Button>
          <Button onClick={checkStorage} variant="outline" className="gap-2">
            Check localStorage
          </Button>
          <Button onClick={clearStorage} variant="outline" className="gap-2 text-red-600">
            Clear localStorage
          </Button>
        </div>

        {/* Image Status */}
        {images.some(img => img.status !== 'checking') && (
          <div className="border rounded-lg p-4 dark:border-gray-700">
            <h3 className="font-semibold mb-3">Image Status:</h3>
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  {img.status === 'checking' && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {img.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {img.status === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {img.path}
                  </code>
                  {img.statusCode !== undefined && (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      img.statusCode === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {img.statusCode === 200 ? 'OK' : img.statusCode === 0 ? 'FAIL' : img.statusCode}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage Info */}
        {storageInfo && (
          <div className="border rounded-lg p-4 dark:border-gray-700">
            <h3 className="font-semibold mb-3">localStorage Data:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(storageInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">💡 Quick Fixes:</h3>
          <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
            <li>• If images show ❌ → Check if files exist in <code>public/images/</code> folder</li>
            <li>• If images show ✅ but not displaying → Clear localStorage and refresh</li>
            <li>• Press <code>Ctrl + Shift + R</code> to hard refresh browser</li>
            <li>• Check browser console (F12) for errors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
