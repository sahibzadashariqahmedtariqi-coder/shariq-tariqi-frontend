import { Outlet, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from '../ui/WhatsAppButton'

function DynamicCanonical() {
  const { pathname } = useLocation()
  const baseUrl = 'https://www.sahibzadashariqahmedtariqi.com'
  const canonicalUrl = `${baseUrl}${pathname === '/' ? '' : pathname}`

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <DynamicCanonical />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
