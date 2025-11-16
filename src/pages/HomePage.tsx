import { Helmet } from 'react-helmet-async'
import HeroSection from '@/components/home/HeroSection'
import FeaturedCourses from '@/components/home/FeaturedCourses'
import LatestVideos from '@/components/home/LatestVideos'
import Testimonials from '@/components/home/Testimonials'
import StatsSection from '@/components/home/StatsSection'
import LatestUpdates from '@/components/home/LatestUpdates'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Sahibzada Shariq Ahmed Tariqi | Spiritual Healing & Islamic Knowledge</title>
        <meta
          name="description"
          content="Discover spiritual healing, TAQ healing, traditional Hikmat, and Islamic knowledge with Sahibzada Shariq Ahmed Tariqi."
        />
      </Helmet>

      <div className="space-y-16 pb-16">
        <HeroSection />
        <LatestUpdates />
        <FeaturedCourses />
        <LatestVideos />
        <Testimonials />
        <StatsSection />
      </div>
    </>
  )
}
