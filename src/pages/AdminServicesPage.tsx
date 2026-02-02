import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Plus, Trash2, Edit, X, Heart, Stethoscope, BookOpen, MessageCircle, Eye } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface Service {
  id: string
  title: string
  description: string
  features: string[]
  price: string
  priceLabel?: string
  videoCallPrice?: string
  priceINR?: string
  videoCallPriceINR?: string
  isFree: boolean
  isActive: boolean
  whatsappMessage?: string
  appointmentService?: string
  icon: string
  gradient: string
  stats: {
    served: string
    rating: string
  }
}

const defaultServices: Service[] = [
  {
    id: 'istikhara',
    title: 'Istikhara Services',
    description: 'Seeking divine guidance for important life decisions through authentic Islamic prayer',
    features: ['Marriage guidance', 'Business decisions', 'Travel consultation', 'Life path direction'],
    price: 'FREE',
    isFree: true,
    isActive: true,
    whatsappMessage: 'Assalam o Alaikum, I want to request Istikhara service for guidance.',
    icon: 'heart',
    gradient: 'from-emerald-500 to-teal-600',
    stats: { served: '5000+', rating: '4.9' },
  },
  {
    id: 'hikmat',
    title: 'Traditional Hikmat',
    description: 'Prophetic medicine and natural healing treatments based on ancient wisdom',
    features: ['Herbal remedies', 'Natural cures', 'Holistic healing'],
    price: 'PKR 2,000',
    priceLabel: '/consultation',
    videoCallPrice: 'PKR 3,000',
    priceINR: '₹700',
    videoCallPriceINR: '₹1,000',
    isFree: false,
    isActive: true,
    appointmentService: 'Hikmat Consultation',
    icon: 'stethoscope',
    gradient: 'from-amber-500 to-orange-600',
    stats: { served: '3500+', rating: '4.8' },
  },
  {
    id: 'consultation',
    title: 'Spiritual Consultation',
    description: 'One-on-one spiritual guidance and mentorship for personal transformation',
    features: ['Life coaching', 'Spiritual development', 'Problem solving', 'Personal growth'],
    price: 'PKR 2,000',
    priceLabel: '/consultation',
    videoCallPrice: 'PKR 3,000',
    priceINR: '₹700',
    videoCallPriceINR: '₹1,000',
    isFree: false,
    isActive: true,
    appointmentService: 'Spiritual Consultation',
    icon: 'book',
    gradient: 'from-primary-500 to-primary-700',
    stats: { served: '4200+', rating: '4.9' },
  },
]

const iconOptions = [
  { value: 'heart', label: 'Heart', icon: <Heart className="h-5 w-5" /> },
  { value: 'stethoscope', label: 'Stethoscope', icon: <Stethoscope className="h-5 w-5" /> },
  { value: 'book', label: 'Book', icon: <BookOpen className="h-5 w-5" /> },
]

const gradientOptions = [
  { value: 'from-emerald-500 to-teal-600', label: 'Green (Free)' },
  { value: 'from-amber-500 to-orange-600', label: 'Amber/Orange' },
  { value: 'from-primary-500 to-primary-700', label: 'Primary Green' },
  { value: 'from-purple-500 to-indigo-600', label: 'Purple' },
  { value: 'from-rose-500 to-pink-600', label: 'Rose/Pink' },
  { value: 'from-blue-500 to-cyan-600', label: 'Blue/Cyan' },
]

export default function AdminServicesPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [services, setServices] = useState<Service[]>([])
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newFeature, setNewFeature] = useState('')

  useEffect(() => {
    // Load services from localStorage or use defaults
    const savedServices = localStorage.getItem('adminServices')
    if (savedServices) {
      setServices(JSON.parse(savedServices))
    } else {
      setServices(defaultServices)
      localStorage.setItem('adminServices', JSON.stringify(defaultServices))
    }
  }, [])

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const saveServices = (updatedServices: Service[]) => {
    setServices(updatedServices)
    localStorage.setItem('adminServices', JSON.stringify(updatedServices))
  }

  const handleEdit = (service: Service) => {
    setEditingService({ ...service })
    setIsAdding(false)
  }

  const handleAddNew = () => {
    setEditingService({
      id: `service-${Date.now()}`,
      title: '',
      description: '',
      features: [],
      price: '',
      priceLabel: '',
      videoCallPrice: '',
      priceINR: '',
      videoCallPriceINR: '',
      isFree: false,
      isActive: true,
      whatsappMessage: '',
      appointmentService: '',
      icon: 'heart',
      gradient: 'from-primary-500 to-primary-700',
      stats: { served: '0', rating: '5.0' },
    })
    setIsAdding(true)
  }

  const handleSave = () => {
    if (!editingService) return

    if (!editingService.title || !editingService.description) {
      toast.error('Please fill in title and description')
      return
    }

    let updatedServices: Service[]
    if (isAdding) {
      updatedServices = [...services, editingService]
      toast.success('Service added successfully!')
    } else {
      updatedServices = services.map(s => 
        s.id === editingService.id ? editingService : s
      )
      toast.success('Service updated successfully!')
    }

    saveServices(updatedServices)
    setEditingService(null)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      const updatedServices = services.filter(s => s.id !== id)
      saveServices(updatedServices)
      toast.success('Service deleted!')
    }
  }

  const handleToggleActive = (id: string) => {
    const updatedServices = services.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    )
    saveServices(updatedServices)
    toast.success('Service visibility updated!')
  }

  const addFeature = () => {
    if (!newFeature.trim() || !editingService) return
    setEditingService({
      ...editingService,
      features: [...editingService.features, newFeature.trim()]
    })
    setNewFeature('')
  }

  const removeFeature = (index: number) => {
    if (!editingService) return
    setEditingService({
      ...editingService,
      features: editingService.features.filter((_, i) => i !== index)
    })
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart': return <Heart className="h-6 w-6" />
      case 'stethoscope': return <Stethoscope className="h-6 w-6" />
      case 'book': return <BookOpen className="h-6 w-6" />
      default: return <Heart className="h-6 w-6" />
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin - Manage Services | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-6 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Admin Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-800 dark:text-white">Manage Services</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Add, edit, or remove services displayed on the Services page</p>
          </div>
          <div className="flex gap-3">
            <Link to="/services" target="_blank">
              <Button variant="outline" className="gap-2">
                <Eye className="h-5 w-5" />
                Preview Page
              </Button>
            </Link>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-5 w-5" />
              Add New Service
            </Button>
          </div>
        </div>

        {/* Edit/Add Form Modal */}
        {editingService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isAdding ? 'Add New Service' : 'Edit Service'}
                </h2>
                <button 
                  onClick={() => { setEditingService(null); setIsAdding(false); }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      value={editingService.title}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Spiritual Consultation"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Description *
                    </label>
                    <textarea
                      value={editingService.description}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Describe this service..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Price (In-Person PKR)
                    </label>
                    <input
                      type="text"
                      value={editingService.price}
                      onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., PKR 2,000 or FREE"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Price Label (optional)
                    </label>
                    <input
                      type="text"
                      value={editingService.priceLabel || ''}
                      onChange={(e) => setEditingService({ ...editingService, priceLabel: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., /hour or /consultation"
                    />
                  </div>

                  {/* Video Call & INR Prices */}
                  {!editingService.isFree && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">
                          Video Call Price (PKR)
                        </label>
                        <input
                          type="text"
                          value={editingService.videoCallPrice || ''}
                          onChange={(e) => setEditingService({ ...editingService, videoCallPrice: e.target.value })}
                          className="w-full px-4 py-3 border border-amber-300 rounded-lg dark:bg-gray-700 dark:border-amber-600 dark:text-white"
                          placeholder="e.g., PKR 3,000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-emerald-600 dark:text-emerald-400">
                          In-Person Price (₹ INR)
                        </label>
                        <input
                          type="text"
                          value={editingService.priceINR || ''}
                          onChange={(e) => setEditingService({ ...editingService, priceINR: e.target.value })}
                          className="w-full px-4 py-3 border border-emerald-300 rounded-lg dark:bg-gray-700 dark:border-emerald-600 dark:text-white"
                          placeholder="e.g., ₹700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-emerald-600 dark:text-emerald-400">
                          Video Call Price (₹ INR)
                        </label>
                        <input
                          type="text"
                          value={editingService.videoCallPriceINR || ''}
                          onChange={(e) => setEditingService({ ...editingService, videoCallPriceINR: e.target.value })}
                          className="w-full px-4 py-3 border border-emerald-300 rounded-lg dark:bg-gray-700 dark:border-emerald-600 dark:text-white"
                          placeholder="e.g., ₹1,000"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Icon
                    </label>
                    <select
                      value={editingService.icon}
                      onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Color Theme
                    </label>
                    <select
                      value={editingService.gradient}
                      onChange={(e) => setEditingService({ ...editingService, gradient: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {gradientOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Free Service Toggle */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService.isFree}
                      onChange={(e) => setEditingService({ ...editingService, isFree: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">This is a FREE service</span>
                  </label>
                </div>

                {/* WhatsApp Message (for free services) */}
                {editingService.isFree && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      <MessageCircle className="inline h-4 w-4 mr-2" />
                      WhatsApp Message (auto-filled when user clicks)
                    </label>
                    <textarea
                      value={editingService.whatsappMessage || ''}
                      onChange={(e) => setEditingService({ ...editingService, whatsappMessage: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Assalam o Alaikum, I want to request..."
                    />
                  </div>
                )}

                {/* Appointment Service Name (for paid services) */}
                {!editingService.isFree && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Appointment Service Name (for booking form)
                    </label>
                    <input
                      type="text"
                      value={editingService.appointmentService || ''}
                      onChange={(e) => setEditingService({ ...editingService, appointmentService: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., Spiritual Consultation"
                    />
                  </div>
                )}

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Features / Benefits
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Add a feature..."
                    />
                    <Button onClick={addFeature} type="button" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingService.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {feature}
                        <button 
                          onClick={() => removeFeature(index)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Clients Served (display text)
                    </label>
                    <input
                      type="text"
                      value={editingService.stats.served}
                      onChange={(e) => setEditingService({ 
                        ...editingService, 
                        stats: { ...editingService.stats, served: e.target.value }
                      })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., 5000+"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Rating (display text)
                    </label>
                    <input
                      type="text"
                      value={editingService.stats.rating}
                      onChange={(e) => setEditingService({ 
                        ...editingService, 
                        stats: { ...editingService.stats, rating: e.target.value }
                      })}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., 4.9"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <Button onClick={handleSave} className="flex-1 gap-2">
                    <Save className="h-5 w-5" />
                    {isAdding ? 'Add Service' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setEditingService(null); setIsAdding(false); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${!service.isActive ? 'opacity-50' : ''}`}
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.gradient} flex items-center justify-center text-white`}>
                    {getIcon(service.icon)}
                  </div>
                  <div className="flex gap-2">
                    {service.isFree && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">FREE</span>
                    )}
                    {!service.isActive && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">HIDDEN</span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {service.features.slice(0, 3).map((f, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                      {f}
                    </span>
                  ))}
                  {service.features.length > 3 && (
                    <span className="text-gray-400 text-xs">+{service.features.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
                  <span className="text-2xl font-bold text-primary-600 dark:text-gold-400">
                    {service.price}
                    {service.priceLabel && <span className="text-sm text-gray-500">{service.priceLabel}</span>}
                  </span>
                  <div className="text-sm text-gray-500">
                    {service.stats.served} • ⭐ {service.stats.rating}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(service)} variant="outline" size="sm" className="flex-1 gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleToggleActive(service.id)} 
                    variant="outline" 
                    size="sm"
                    className={service.isActive ? 'text-orange-600' : 'text-green-600'}
                  >
                    {service.isActive ? 'Hide' : 'Show'}
                  </Button>
                  <Button 
                    onClick={() => handleDelete(service.id)} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No services added yet</p>
            <Button onClick={handleAddNew}>Add Your First Service</Button>
          </div>
        )}
      </div>
    </>
  )
}
