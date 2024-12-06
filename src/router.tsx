import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Route } from '@tanstack/react-router'
import { rootRoute } from './routes/root'
import { SignIn } from './pages/SignIn'
import { Dashboard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { adminLayoutRoute } from './routes/admin/layout'
import { adminDashboardRoute } from './routes/admin/dashboard'
import { adminUsersRoute } from './routes/admin/users'
import { adminTeamsRoute } from './routes/admin/teams'

// Create an index route (Sign In)
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SignIn,
})

// Create a dashboard route (Protected)
const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
})

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminUsersRoute,
    adminTeamsRoute,
  ])
])

// Create the router using your route tree
export const router = createRouter({ 
  routeTree,
  // Add default options
  defaultPreload: 'intent', // Preload on hover/focus
  defaultPreloadStaleTime: 0, // Always preload
  defaultPendingComponent: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
})

// Register your router for maximum type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function Router() {
  return <RouterProvider router={router} />
}
