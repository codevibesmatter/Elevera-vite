import { RootRoute } from '@tanstack/react-router'
import App from '../App'

export const rootRoute = new RootRoute({
  component: App,
  // Add error boundary
  errorComponent: ({ error }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
      <p className="text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
    </div>
  ),
})
