import { Route } from '@tanstack/react-router'
import { rootRoute } from '../root'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { useConvexAuth } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useQuery } from 'convex/react'
import { AdminNav } from '../../components/admin/AdminNav'

// Admin layout component with navigation
function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.queries.getCurrentUser)
  
  if (!isAuthenticated || !user?.isSuperuser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this area.</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <AdminNav />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

// Admin layout route
export const adminLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: AdminLayout,
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Error</h1>
        <p className="text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
      </div>
    </div>
  ),
})
