import { Route } from '@tanstack/react-router'
import { adminLayoutRoute } from './layout'
import { AdminDashboard } from '../../pages/admin/AdminDashboard'
import { api } from '../../convex/_generated/api'
import { useQuery } from 'convex/react'

// Admin dashboard route with data loading
export const adminDashboardRoute = new Route({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  loader: async () => {
    // Return empty object for initial load
    // Data will be fetched via suspense in the component
    return {}
  },
  component: () => {
    // Use suspense for data loading
    const stats = useQuery(api.admin.queries.getDashboardStats)
    const recentUsers = useQuery(api.admin.queries.getRecentUsers)
    const recentTeams = useQuery(api.admin.queries.getRecentTeams)

    return (
      <AdminDashboard 
        stats={stats} 
        recentUsers={recentUsers} 
        recentTeams={recentTeams} 
      />
    )
  },
  errorComponent: ({ error }) => (
    <div className="text-center p-4">
      <h2 className="text-xl font-bold text-red-600 mb-2">Dashboard Error</h2>
      <p className="text-gray-600">{error?.message || 'Failed to load dashboard data'}</p>
    </div>
  ),
})
