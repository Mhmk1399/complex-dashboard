import { Suspense } from 'react'
import { Dashboard } from './dashboard'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingFallback />}>
        <Dashboard/>
      </Suspense>
    </main>
  )
}