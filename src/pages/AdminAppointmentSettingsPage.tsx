import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Save, DollarSign, Clock, Calendar, Info, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import apiClient from '@/services/api'

interface AppointmentSettings {
  // PKR In-Person Fees
  consultationFee: number
  healingFee: number
  hikmatFee: number
  ruqyahFee: number
  taveezFee: number
  // PKR Video Call Fees
  consultationFeeVideoCall: number
  healingFeeVideoCall: number
  hikmatFeeVideoCall: number
  ruqyahFeeVideoCall: number
  taveezFeeVideoCall: number
  // INR In-Person Fees
  consultationFeeINR: number
  healingFeeINR: number
  hikmatFeeINR: number
  ruqyahFeeINR: number
  taveezFeeINR: number
  // INR Video Call Fees
  consultationFeeVideoCallINR: number
  healingFeeVideoCallINR: number
  hikmatFeeVideoCallINR: number
  ruqyahFeeVideoCallINR: number
  taveezFeeVideoCallINR: number
  // Other settings
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
    // PKR In-Person Fees
    consultationFee: 2000,
    healingFee: 2000,
    hikmatFee: 2000,
    ruqyahFee: 2000,
    taveezFee: 2000,
    // PKR Video Call Fees
    consultationFeeVideoCall: 3000,
    healingFeeVideoCall: 3000,
    hikmatFeeVideoCall: 3000,
    ruqyahFeeVideoCall: 3000,
    taveezFeeVideoCall: 3000,
    // INR In-Person Fees
    consultationFeeINR: 700,
    healingFeeINR: 700,
    hikmatFeeINR: 700,
    ruqyahFeeINR: 700,
    taveezFeeINR: 700,
    // INR Video Call Fees
    consultationFeeVideoCallINR: 1000,
    healingFeeVideoCallINR: 1000,
    hikmatFeeVideoCallINR: 1000,
    ruqyahFeeVideoCallINR: 1000,
    taveezFeeVideoCallINR: 1000,
    // Other settings
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
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoadingSettings(true)
      const response = await apiClient.get('/settings/appointments')
      if (response.data.success && response.data.data) {
        setSettings({ ...settings, ...response.data.data })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings from server')
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await apiClient.put('/settings/appointments', settings)
      
      if (response.data.success) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
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

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    )
  }

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

        <div className="grid grid-cols-1 gap-8">
          {/* Service Charges - Full Width with Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary-800 dark:text-white flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Service Charges
            </h2>
            
            {/* Currency and Mode Tabs Info */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Set prices for both <strong>In-Person</strong> and <strong>Video Call</strong> consultations in <strong>PKR</strong> (Pakistani Rupees) and <strong>INR</strong> (Indian Rupees)
              </p>
            </div>

            {/* Service Charges Grid */}
            <div className="space-y-6">
              {/* Spiritual Consultation */}
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 text-primary-700 dark:text-primary-400">Spiritual Consultation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">In-Person (PKR)</label>
                    <input type="number" value={settings.consultationFee} onChange={(e) => handleChange('consultationFee', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Video Call (PKR)</label>
                    <input type="number" value={settings.consultationFeeVideoCall} onChange={(e) => handleChange('consultationFeeVideoCall', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">In-Person (₹ INR)</label>
                    <input type="number" value={settings.consultationFeeINR} onChange={(e) => handleChange('consultationFeeINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">Video Call (₹ INR)</label>
                    <input type="number" value={settings.consultationFeeVideoCallINR} onChange={(e) => handleChange('consultationFeeVideoCallINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Traditional Healing */}
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 text-primary-700 dark:text-primary-400">Traditional Healing</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">In-Person (PKR)</label>
                    <input type="number" value={settings.healingFee} onChange={(e) => handleChange('healingFee', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Video Call (PKR)</label>
                    <input type="number" value={settings.healingFeeVideoCall} onChange={(e) => handleChange('healingFeeVideoCall', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">In-Person (₹ INR)</label>
                    <input type="number" value={settings.healingFeeINR} onChange={(e) => handleChange('healingFeeINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">Video Call (₹ INR)</label>
                    <input type="number" value={settings.healingFeeVideoCallINR} onChange={(e) => handleChange('healingFeeVideoCallINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Hikmat Consultation */}
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 text-primary-700 dark:text-primary-400">Hikmat Consultation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">In-Person (PKR)</label>
                    <input type="number" value={settings.hikmatFee} onChange={(e) => handleChange('hikmatFee', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Video Call (PKR)</label>
                    <input type="number" value={settings.hikmatFeeVideoCall} onChange={(e) => handleChange('hikmatFeeVideoCall', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">In-Person (₹ INR)</label>
                    <input type="number" value={settings.hikmatFeeINR} onChange={(e) => handleChange('hikmatFeeINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">Video Call (₹ INR)</label>
                    <input type="number" value={settings.hikmatFeeVideoCallINR} onChange={(e) => handleChange('hikmatFeeVideoCallINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Ruqyah Session */}
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 text-primary-700 dark:text-primary-400">Ruqyah Session</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">In-Person (PKR)</label>
                    <input type="number" value={settings.ruqyahFee} onChange={(e) => handleChange('ruqyahFee', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Video Call (PKR)</label>
                    <input type="number" value={settings.ruqyahFeeVideoCall} onChange={(e) => handleChange('ruqyahFeeVideoCall', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">In-Person (₹ INR)</label>
                    <input type="number" value={settings.ruqyahFeeINR} onChange={(e) => handleChange('ruqyahFeeINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">Video Call (₹ INR)</label>
                    <input type="number" value={settings.ruqyahFeeVideoCallINR} onChange={(e) => handleChange('ruqyahFeeVideoCallINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Taveez & Amulets */}
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 text-primary-700 dark:text-primary-400">Taveez & Amulets</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">In-Person (PKR)</label>
                    <input type="number" value={settings.taveezFee} onChange={(e) => handleChange('taveezFee', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Video Call (PKR)</label>
                    <input type="number" value={settings.taveezFeeVideoCall} onChange={(e) => handleChange('taveezFeeVideoCall', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">In-Person (₹ INR)</label>
                    <input type="number" value={settings.taveezFeeINR} onChange={(e) => handleChange('taveezFeeINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400">Video Call (₹ INR)</label>
                    <input type="number" value={settings.taveezFeeVideoCallINR} onChange={(e) => handleChange('taveezFeeVideoCallINR', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours and Days Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <input
                  type="number"
                  min="15"
                  max="240"
                  value={settings.appointmentDuration}
                  onChange={(e) => handleChange('appointmentDuration', Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter duration in minutes"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter any value between 15-240 minutes</p>
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
          </div>

          {/* Contact & Instructions - Full Width */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:col-span-2">
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
              <h4 className="font-bold text-lg mb-2">Service Charges (In-Person | Video Call):</h4>
              <div className="overflow-x-auto">
                <table className="text-sm w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2">Service</th>
                      <th className="text-center py-2">PKR (In-Person)</th>
                      <th className="text-center py-2">PKR (Video)</th>
                      <th className="text-center py-2">INR (In-Person)</th>
                      <th className="text-center py-2">INR (Video)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2">Spiritual Consultation</td>
                      <td className="text-center">{settings.consultationFee}</td>
                      <td className="text-center">{settings.consultationFeeVideoCall}</td>
                      <td className="text-center text-emerald-600">₹{settings.consultationFeeINR}</td>
                      <td className="text-center text-emerald-600">₹{settings.consultationFeeVideoCallINR}</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2">Traditional Healing</td>
                      <td className="text-center">{settings.healingFee}</td>
                      <td className="text-center">{settings.healingFeeVideoCall}</td>
                      <td className="text-center text-emerald-600">₹{settings.healingFeeINR}</td>
                      <td className="text-center text-emerald-600">₹{settings.healingFeeVideoCallINR}</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2">Hikmat Consultation</td>
                      <td className="text-center">{settings.hikmatFee}</td>
                      <td className="text-center">{settings.hikmatFeeVideoCall}</td>
                      <td className="text-center text-emerald-600">₹{settings.hikmatFeeINR}</td>
                      <td className="text-center text-emerald-600">₹{settings.hikmatFeeVideoCallINR}</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2">Ruqyah Session</td>
                      <td className="text-center">{settings.ruqyahFee}</td>
                      <td className="text-center">{settings.ruqyahFeeVideoCall}</td>
                      <td className="text-center text-emerald-600">₹{settings.ruqyahFeeINR}</td>
                      <td className="text-center text-emerald-600">₹{settings.ruqyahFeeVideoCallINR}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Taveez & Amulets</td>
                      <td className="text-center">{settings.taveezFee}</td>
                      <td className="text-center">{settings.taveezFeeVideoCall}</td>
                      <td className="text-center text-emerald-600">₹{settings.taveezFeeINR}</td>
                      <td className="text-center text-emerald-600">₹{settings.taveezFeeVideoCallINR}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
