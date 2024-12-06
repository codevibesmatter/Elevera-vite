# Technical Guidelines

## Stack
- React 18 + Vite + TypeScript
- Clerk: Authentication
- Convex: Backend
- DaisyUI + Tailwind: UI
- TanStack React Router: Navigation
- TanStack Table: Data tables
- Lucide: Icons
- Radix UI: Accessible components
- React Hook Form: Form handling
- Zod: Schema validation
- Google Cloud Storage: File storage

## Conventions

### TypeScript
- Use strict mode
- Prefer `type` over `interface`
- Use `as const` for configuration objects
- Use Zod for runtime type validation

### React
- Use functional components
- Custom hooks in `src/hooks/`
- Pages in `src/pages/`
- Components in `src/components/`
- Use React Hook Form for all forms
- Prefer controlled components

### Routing and Navigation
- Use TanStack Router for all routing
- Organize routes in a nested tree structure
- Place route definitions in `src/routes/`
- Implement shared layouts using layout routes
- Use loaders for page-level data fetching
- Implement proper error boundaries per route
- Handle scroll restoration for navigation
- Create type-safe route helpers
- Protect routes with auth checks
- Support code splitting via lazy loading
- Implement preloading for critical routes

### Forms and Validation
- Use React Hook Form for form state
- Zod schemas in `src/schemas/`
- Validate both client and server side
- Use Radix UI for accessible form elements

### Data Tables
- Use TanStack Table for all data grids
- Define column configs in separate files
- Support sorting and filtering
- Include pagination where needed

### Convex
#### Project Structure
- Tables in `convex/schema.ts`
- Functions organized by domain in dedicated directories:
  - `convex/[domain]/queries.ts`: Read operations
  - `convex/[domain]/mutations.ts`: Write operations
  - `convex/[domain]/actions.ts`: Background jobs and external integrations
  - `convex/[domain]/helpers.ts`: Shared utilities and types
- Common utilities in `convex/utils/`
- Auth helpers in `convex/auth.ts`

#### Query Best Practices
- Keep queries light and fast (< 100ms)
- Use appropriate indexes for all queries
- Batch related queries when possible
- Return minimal data needed by the UI
- Use pagination for large datasets
- Integrate with TanStack Router loaders
- Support suspense for component-level queries

#### Mutation Guidelines
- Validate all input with Zod schemas
- Use transactions for related operations
- Return minimal data for optimistic updates
- Handle errors gracefully with proper messages
- Implement proper cleanup in failure cases
- Coordinate with router navigation

#### Action Usage
- Only use actions for:
  - Long-running operations
  - External API calls
  - Batch processing
  - File operations
- Record progress incrementally
- Handle failures gracefully
- Use mutations to trigger actions

#### Security
- Implement proper access control
- Validate user permissions
- Sanitize all inputs
- Use helper functions for common checks
- Audit sensitive operations

### File Management
- Use Google Cloud Storage for all files
- Organize files by team/project
- Use signed URLs for uploads/downloads
- Include metadata for all files
- Implement proper cleanup routines
- Track file ownership and permissions
- Validate file types and sizes
- Handle file versioning
- Support file search and filtering
- Monitor storage usage per team
- Implement file move operations
- Support batch operations
- Generate unique storage keys
- Handle concurrent modifications

### Clerk
- User management in `useConvexUser` hook
- Sync Clerk user with Convex on auth changes
- Protected routes via `<ClerkProvider>`
- Use Clerk webhooks for user events
- Integrate with TanStack Router auth

### State Management
- Server state: Convex queries
- Local state: React hooks
- Auth state: Clerk + Convex sync
- Route state: TanStack Router
- Avoid unnecessary client-side caching
- Let Convex handle data synchronization

### Styling
- Use Tailwind classes
- DaisyUI components for common UI elements
- Lucide icons for consistent iconography
- Responsive design with Tailwind breakpoints
- Dark mode support via Tailwind

### Error Handling
- Consistent error messages across app
- Clear user feedback for all operations
- Proper error logging
- Route-level error boundaries
- Component-level error boundaries
- Fallback UI components
- Confirmation for destructive actions
- Handle network errors gracefully
- Support offline capabilities

### Performance
- Use Convex's built-in caching
- Keep queries and mutations light
- Implement proper pagination
- Route-based code splitting
- Preload critical routes
- Lazy load routes and components
- Monitor bundle size
- Optimize file uploads/downloads
- Use proper indexes for queries

### Development Workflow
- Use Convex Dashboard for debugging
- Write clear function descriptions
- Document schema changes
- Test queries in Dashboard before use
- Monitor performance metrics
- Follow routing conventions
- Maintain type safety
- Review file operations
- Test error scenarios
