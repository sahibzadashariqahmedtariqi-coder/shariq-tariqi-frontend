import { Link } from 'react-router-dom'
import { Facebook, Youtube, Send, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-800 text-white islamic-pattern">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold-400">Sahibzada Shariq Ahmed Tariqi</h3>
            <p className="text-sm text-gray-300 mb-4">
              Rooted in the timeless wisdom of Sufism and the healing sciences of Hikmat, 
              illuminating hearts with divine knowledge of spirituality and traditional healing.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61553408394146"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@Sahibzadashariqahmedtariqi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/drabdulwajidshazli"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-400 transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
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
                <Link to="/contact" className="text-sm hover:text-gold-400 transition-colors">
                  Contact
                </Link>
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
                <a href="mailto:info@shariqahmedtariqi.com" className="hover:text-gold-400">
                  info@shariqahmedtariqi.com
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Available on WhatsApp</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Karachi, Pakistan</span>
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
