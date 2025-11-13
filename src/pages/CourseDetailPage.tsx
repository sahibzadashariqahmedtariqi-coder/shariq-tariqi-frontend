import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'

export default function CourseDetailPage() {
  const { id } = useParams()

  return (
    <>
      <Helmet>
        <title>Course Details | Sahibzada Shariq Ahmed Tariqi</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Course Details</h1>
        <p>Course ID: {id}</p>
      </div>
    </>
  )
}
