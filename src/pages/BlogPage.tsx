import { Helmet } from 'react-helmet-async'

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title>Blog | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Spiritual Blog</h1>
        <p>Articles and spiritual guidance will be displayed here.</p>
      </div>
    </>
  )
}
