import { Loader2 } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
