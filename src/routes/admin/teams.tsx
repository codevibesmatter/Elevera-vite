import { Route } from '@tanstack/react-router'
import { adminLayoutRoute } from './layout'
import { AdminTeams } from '../../pages/admin/AdminTeams'
import { api } from '../../convex/_generated/api'
import { useQuery } from 'convex/react'
import { z } from 'zod'

// Search params schema
const searchSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
})

export const adminTeamsRoute = new Route({
  getParentRoute: () => adminLayoutRoute,
  path: 'teams',
  validateSearch: searchSchema,
  loader: async ({ search }) => {
    // Return search params for initial load
    // Data will be fetched via suspense in the component
    return { search }
  },
  component: ({ search }) => {
    // Use suspense for data loading with pagination
    const teams = useQuery(api.admin.queries.getAllTeams, {
      search: search.search,
      skip: (search.page - 1) * search.perPage,
      limit: search.perPage,
    })

    // Get total count for pagination
    const totalCount = useQuery(api.admin.queries.getTeamCount, {
      search: search.search,
    })

    return (
      <AdminTeams 
        teams={teams} 
        totalCount={totalCount}
        page={search.page}
        perPage={search.perPage}
      />
    )
  },
  errorComponent: ({ error }) => (
    <div className="text-center p-4">
      <h2 className="text-xl font-bold text-red-600 mb-2">Teams Error</h2>
      <p className="text-gray-600">{error?.message || 'Failed to load teams data'}</p>
    </div>
  ),
})
