import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Moon, Sun, Heart } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { isMenuOpen, toggleMenu, closeMenu, theme, toggleTheme } = useUIStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/courses', label: 'Courses' },
    { path: '/products', label: 'Products' },
    { path: '/services', label: 'Services' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/track-order', label: 'Track Order' },
    { path: '/admin', label: 'Admin' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary-900 backdrop-blur shadow-lg">
      <div className="container mx-auto px-2 lg:px-4">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0" onClick={closeMenu}>
            <img src="/images/logo.png" alt="Logo" className="h-10 w-10 lg:h-14 lg:w-14 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm lg:text-lg font-bold text-gold-400 truncate whitespace-nowrap">Sahibzada Shariq Ahmed Tariqi</span>
              <span className="text-[9px] lg:text-[11px] text-gray-300 truncate whitespace-nowrap">Spiritual Healing & Guidance</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs lg:text-sm font-medium transition-colors hover:text-gold-400 whitespace-nowrap ${
                    isActive ? 'text-gold-400' : 'text-gray-200'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Donate Link */}
            <Link to="/donate" className="hidden lg:flex items-center space-x-1.5 text-xs lg:text-sm font-medium text-gray-200 transition-colors hover:text-gold-400 whitespace-nowrap">
              <Heart className="h-4 w-4" />
              <span>Donate</span>
            </Link>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-200 hover:text-gold-400 hover:bg-primary-800 flex-shrink-0">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
                <Button variant="outline" onClick={handleLogout} className="border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-primary-900 text-xs lg:text-sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-200 hover:text-gold-400 hover:bg-primary-800 text-xs lg:text-sm px-3">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gold-500 text-primary-900 hover:bg-gold-400 text-xs lg:text-sm px-3">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden text-gray-200 hover:text-gold-400 hover:bg-primary-800" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 bg-primary-900">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2 text-sm font-medium transition-colors hover:text-gold-400 ${
                    isActive ? 'text-gold-400' : 'text-gray-200'
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="pt-4 border-t border-primary-700 space-y-2">
              {/* Mobile Donate Link */}
              <Link to="/donate" onClick={closeMenu}>
                <Button variant="ghost" className="w-full text-gray-200 hover:text-gold-400 hover:bg-primary-800 flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" />
                  Donate
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full text-gray-200 hover:text-gold-400 hover:bg-primary-800">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-primary-900" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full text-gray-200 hover:text-gold-400 hover:bg-primary-800">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <Button className="w-full bg-gold-500 text-primary-900 hover:bg-gold-400">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
