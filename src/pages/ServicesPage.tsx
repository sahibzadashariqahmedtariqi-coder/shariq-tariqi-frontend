import { Helmet } from 'react-helmet-async'
import { Heart, BookOpen, Stethoscope, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function ServicesPage() {
  const services = [
    {
      icon: <Sparkles className="h-12 w-12" />,
      title: 'TAQ Healing',
      description: 'Advanced spiritual healing techniques based on divine energy channeling',
      features: ['Energy balancing', 'Chakra alignment', 'Spiritual cleansing', 'Aura strengthening'],
      price: 'From $50/session',
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: 'Istikhara Services',
      description: 'Seeking divine guidance for important life decisions',
      features: ['Marriage guidance', 'Business decisions', 'Travel consultation', 'Life path direction'],
      price: 'Contact for pricing',
    },
    {
      icon: <Stethoscope className="h-12 w-12" />,
      title: 'Traditional Hikmat',
      description: 'Prophetic medicine and natural healing treatments',
      features: ['Herbal remedies', 'Spiritual treatments', 'Natural cures', 'Holistic healing'],
      price: 'From $75/consultation',
    },
    {
      icon: <BookOpen className="h-12 w-12" />,
      title: 'Spiritual Consultation',
      description: 'One-on-one spiritual guidance and mentorship',
      features: ['Life coaching', 'Spiritual development', 'Problem solving', 'Personal growth'],
      price: 'From $100/hour',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Our Services | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-primary-800 dark:text-white mb-4 text-center">Our Services</h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          Discover comprehensive spiritual healing and traditional Islamic medicine services
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-gold-500 mb-4">{service.icon}</div>
              <h2 className="text-2xl font-bold mb-3">{service.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <span className="mr-2 text-gold-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary-600">{service.price}</span>
                <Link to="/contact">
                  <Button>Book Now</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
