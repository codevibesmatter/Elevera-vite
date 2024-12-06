# Architecture Decisions - Version 1

## File Storage
- Primary: Google Cloud Storage
  - Direct uploads using signed URLs
  - Organized by team/project folders
  - Automatic file cleanup on project/team deletion
  - Object lifecycle management for cost optimization
- File Metadata Schema:
```typescript
export const files = defineTable({
  name: v.string(),
  size: v.number(),
  type: v.string(),
  projectId: v.id("projects"),
  uploaderId: v.id("users"),
  gcsPath: v.string(),    // Full GCS path
  gcsBucket: v.string(),  // GCS bucket name
  contentHash: v.string(), // For deduplication
  lastModified: v.number(),
}).index("by_project", ["projectId"])
  .index("by_uploader", ["uploaderId"]);

// GCS folder structure:
// {bucket}/teams/{teamId}/projects/{projectId}/{fileId}-{filename}

## Permission Model
- Roles & Permissions:
```typescript
type Role = 'owner' | 'admin' | 'member' | 'viewer';

interface Permission {
  team: {
    manage: boolean,   // Invite/remove members, settings
    view: boolean,     // View team details
  },
  project: {
    create: boolean,   // Create new projects
    manage: boolean,   // Project settings
    view: boolean,     // View project details
  },
  file: {
    upload: boolean,   // Upload files
    delete: boolean,   // Delete files
    download: boolean, // Download files
  }
}

const rolePermissions: Record<Role, Permission> = {
  owner: {
    team: { manage: true, view: true },
    project: { create: true, manage: true, view: true },
    file: { upload: true, delete: true, download: true }
  },
  admin: {
    team: { manage: true, view: true },
    project: { create: true, manage: true, view: true },
    file: { upload: true, delete: true, download: true }
  },
  member: {
    team: { manage: false, view: true },
    project: { create: true, manage: false, view: true },
    file: { upload: true, delete: false, download: true }
  },
  viewer: {
    team: { manage: false, view: true },
    project: { create: false, manage: false, view: true },
    file: { upload: false, delete: false, download: true }
  }
};
```

## Data Access Patterns

### Row-Level Security
```typescript
// Example Convex access control
const canAccessTeam = async (ctx: Context, teamId: Id<"teams">) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  
  const membership = await ctx.db
    .query("teamMembers")
    .withIndex("by_user_team", (q) => 
      q.eq("userId", identity.subject)
       .eq("teamId", teamId))
    .first();
  
  return !!membership;
};
```

### Query Optimization
- Key Indexes:
  - Teams: by creator, by member
  - Projects: by team, by creator
  - Files: by project, by uploader
  - Users: by email, by team

### Caching Strategy
- TanStack Query defaults:
  - staleTime: 10 seconds
  - cacheTime: 5 minutes
- Aggressive caching for:
  - User permissions
  - Team member lists
  - Project metadata
- No caching for:
  - File contents
  - Sensitive settings

## Security Considerations
1. File Access:
   - Signed URLs with short expiration
   - Validate file types on upload
   - Size limits per team/project
2. Authentication:
   - Clerk handles user auth
   - Session management
   - OAuth providers
3. Authorization:
   - Role-based access control
   - Team-level permissions
   - Project-level permissions
