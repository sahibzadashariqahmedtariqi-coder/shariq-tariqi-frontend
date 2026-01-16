import { Helmet } from 'react-helmet-async'

export default function MediaPage() {
  return (
    <>
      <Helmet>
        <title>Media Library | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16">
        <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8">Media Library</h1>
        <p className="text-sm sm:text-base">Video lectures and audio content will be displayed here.</p>
      </div>
    </>
  )
}
