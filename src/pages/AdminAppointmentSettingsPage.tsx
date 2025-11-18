import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Save, DollarSign, Clock, Calendar, Info, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/services/api'
import toast from 'react-hot-toast'

interface AppointmentSettings {
  consultationFee: number
  healingFee: number
  hikmatFee: number
  ruqyahFee: number
  taveezFee: number
  workingHoursStart: string
  workingHoursEnd: string
  workingDays: string[]
  appointmentDuration: number
  advanceBookingDays: number
  instructions: string
  phone: string
  email: string
}

export default function AdminAppointmentSettingsPage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const [settings, setSettings] = useState<AppointmentSettings>({
    consultationFee: 2000,
    healingFee: 3000,
    hikmatFee: 2500,
    ruqyahFee: 3500,
    taveezFee: 1500,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    appointmentDuration: 60,
    advanceBookingDays: 1,
    instructions: 'Please arrive 10 minutes before your scheduled appointment. Bring any relevant medical documents or previous prescriptions.',
    phone: '+92 300 1234567',
    email: 'info@shariqahmedtariqi.com'
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem('appointmentSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...settings, ...parsed })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save to localStorage for now (you can add API call later)
      localStorage.setItem('appointmentSettings', JSON.stringify(settings))
      
      // Optional: Save to backend
      // await apiClient.post('/settings/appointments', settings)
      
      toast.success('Settings saved successfully!')
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof AppointmentSettings, value: any) => {
    setSettings({
      ...settings,
      [field]: value,
    })
  }

  const toggleWorkingDay = (day: string) => {
    if (settings.workingDays.includes(day)) {
      setSettings({
        ...settings,
        workingDays: settings.workingDays.filter((d) => d !== day),
      })
    } else {
      setSettings({
        ...settings,
        workingDays: [...settings.workingDays, day],
      })
    }
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <>
      <Helmet>
        <title>Appointment Settings | Admin Dashboard</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <Link to="/admin" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-2">
              Appointment Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Configure appointment charges, timings, and availability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Charges */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary-800 dark:text-white flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Service Charges
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Spiritual Consultation (PKR)
                </label>
                <input
                  type="number"
                  value={settings.consultationFee}
                  onChange={(e) => handleChange('consultationFee', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Traditional Healing (PKR)
                </label>
                <input
                  type="number"
                  value={settings.healingFee}
                  onChange={(e) => handleChange('healingFee', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hikmat Consultation (PKR)
                </label>
                <input
                  type="number"
                  value={settings.hikmatFee}
                  onChange={(e) => handleChange('hikmatFee', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ruqyah Session (PKR)
                </label>
                <input
                  type="number"
                  value={settings.ruqyahFee}
                  onChange={(e) => handleChange('ruqyahFee', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Taveez & Amulets (PKR)
                </label>
                <input
                  type="number"
                  value={settings.taveezFee}
                  onChange={(e) => handleChange('taveezFee', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary-800 dark:text-white flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Working Hours
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={settings.workingHoursStart}
                  onChange={(e) => handleChange('workingHoursStart', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={settings.workingHoursEnd}
                  onChange={(e) => handleChange('workingHoursEnd', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Appointment Duration (minutes)
                </label>
                <select
                  value={settings.appointmentDuration}
                  onChange={(e) => handleChange('appointmentDuration', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Advance Booking Required (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.advanceBookingDays}
                  onChange={(e) => handleChange('advanceBookingDays', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Working Days */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary-800 dark:text-white flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Working Days
            </h2>
            <div className="space-y-2">
              {daysOfWeek.map((day) => (
                <label key={day} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.workingDays.includes(day)}
                    onChange={() => toggleWorkingDay(day)}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <span className="font-medium">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact & Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary-800 dark:text-white flex items-center gap-2">
              <Info className="h-6 w-6" />
              Contact & Instructions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                  placeholder="+92 300 1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                  placeholder="info@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Instructions for Visitors
                </label>
                <textarea
                  value={settings.instructions}
                  onChange={(e) => handleChange('instructions', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter instructions that will be displayed to visitors on the appointment page..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={loading}
            size="lg"
            className="px-12 py-6 text-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>

        {/* Preview Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-300">
            Preview - How it will appear to visitors:
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2">Service Charges:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Spiritual Consultation: <strong>PKR {settings.consultationFee}</strong></li>
                <li>• Traditional Healing: <strong>PKR {settings.healingFee}</strong></li>
                <li>• Hikmat Consultation: <strong>PKR {settings.hikmatFee}</strong></li>
                <li>• Ruqyah Session: <strong>PKR {settings.ruqyahFee}</strong></li>
                <li>• Taveez & Amulets: <strong>PKR {settings.taveezFee}</strong></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Working Hours:</h4>
              <p className="text-sm">
                {settings.workingDays.join(', ')}: {settings.workingHoursStart} - {settings.workingHoursEnd}
              </p>
              <p className="text-sm mt-1">
                Duration: {settings.appointmentDuration} minutes per appointment
              </p>
              <p className="text-sm mt-1">
                Advance booking: {settings.advanceBookingDays} day(s) required
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Contact:</h4>
              <p className="text-sm">Phone: {settings.phone}</p>
              <p className="text-sm">Email: {settings.email}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Instructions:</h4>
              <p className="text-sm">{settings.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
