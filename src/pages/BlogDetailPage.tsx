import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'

export default function BlogDetailPage() {
  const { id } = useParams()

  return (
    <>
      <Helmet>
        <title>Blog Post | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Blog Post</h1>
        <p>Post ID: {id}</p>
      </div>
    </>
  )
}
