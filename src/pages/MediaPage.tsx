import { Helmet } from 'react-helmet-async'

export default function MediaPage() {
  return (
    <>
      <Helmet>
        <title>Media Library | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Media Library</h1>
        <p>Video lectures and audio content will be displayed here.</p>
      </div>
    </>
  )
}
