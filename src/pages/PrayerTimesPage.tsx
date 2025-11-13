import { Helmet } from 'react-helmet-async'

export default function PrayerTimesPage() {
  return (
    <>
      <Helmet>
        <title>Prayer Times | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Prayer Times & Islamic Tools</h1>
        <p>Prayer times calculator, Qibla finder, and Ilm-ul-Adad calculator will be displayed here.</p>
      </div>
    </>
  )
}
