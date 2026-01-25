import { Link } from 'react-router-dom'
import { Facebook, Youtube, Mail, Phone, MapPin, Instagram } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../services/api'

interface Settings {
  email: string;
  phone: string;
  whatsappLink: string;
  clinicName: string;
  clinicSubtitle: string;
  timings: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  whatsappChannelUrl: string;
  footerDescription: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings')
        if (response.data.success) {
          setSettings(response.data.data)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <footer id="footer" className="bg-primary-800 text-white islamic-pattern">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gold-400">Sahibzada Shariq Ahmed Tariqi</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
              {settings?.footerDescription || 'Rooted in the timeless wisdom of Sufism and the healing sciences of Hikmat, illuminating hearts with divine knowledge of spirituality and traditional healing.'}
            </p>
            <div className="flex space-x-4">
              <a
                href={settings?.facebookUrl || 'https://www.facebook.com/share/181bF2SNbH/'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={settings?.youtubeUrl || 'https://www.youtube.com/@Sahibzadashariqahmedtariqi'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href={settings?.instagramUrl || 'https://www.instagram.com/sahibzadashariqahmedtariqi?igsh=NDhwc3d2M3Z1cGM1'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={settings?.tiktokUrl || 'https://www.tiktok.com/@sahibzadashariqahmed?_r=1&_t=ZS-91WRMNMm7GM'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href={settings?.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaPkzc89cDDh42CswW3S'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="WhatsApp Channel"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:text-gold-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm hover:text-gold-400 transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm hover:text-gold-400 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm hover:text-gold-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-sm hover:text-gold-400 transition-colors">
                  Appointments
                </Link>
              </li>
              <li>
                <a href="https://api.whatsapp.com/send/?phone=923182392985&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-gold-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-400">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-300">Spiritual Courses</li>
              <li className="text-sm text-gray-300">Spiritual Consultation</li>
              <li className="text-sm text-gray-300">Istikhara Services</li>
              <li className="text-sm text-gray-300">Traditional Hikmat</li>
              <li className="text-sm text-gray-300">Online Courses</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-400">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm">
                <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                <a href={`mailto:${settings?.email || 'sahibzadashariqahmedtariqi@gmail.com'}`} className="hover:text-gold-400">
                  {settings?.email || 'sahibzadashariqahmedtariqi@gmail.com'}
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <a href={settings?.whatsappLink || 'https://api.whatsapp.com/send/?phone=923182392985&text&type=phone_number&app_absent=0'} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold-400">
                  Available on WhatsApp
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <a href="tel:+923182392985" className="text-gray-300 hover:text-gold-400">
                  +92 318 2392985
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <div className="text-gray-300">
                  {settings?.clinicName && <p>{settings.clinicName}</p>}
                  {settings?.clinicSubtitle && <p>{settings.clinicSubtitle}</p>}
                  {settings?.timings && <p>Timings: {settings.timings}</p>}
                  <p className="mt-1">{settings?.address || 'Karachi, Pakistan'}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-300">
            © {currentYear} Sahibzada Shariq Ahmed Tariqi. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Developed with ❤️ for spreading spiritual knowledge
          </p>
        </div>
      </div>
    </footer>
  )
}
