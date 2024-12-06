# Elevra Version 1.0 Specification

## Technical Stack

### Frontend
- Vite + React 18
- TypeScript 5.x
- TailwindCSS + daisyUI
- Tanstack Router
- Zustand (UI State)
- Tanstack Query

### Backend
- Convex
  - Database
  - Functions
  - File Storage
- Clerk Authentication

## Data Schema

```typescript
// schema.ts
export const users = defineTable({
  email: v.string(),
  name: v.optional(v.string()),
  isSuperUser: v.optional(v.boolean()),
  avatarUrl: v.optional(v.string()),
  lastLogin: v.optional(v.number()),
  preferences: v.optional(v.object({})),
}).index("by_email", ["email"]);

export const teams = defineTable({
  name: v.string(),
  createdById: v.id("users"),
  settings: v.optional(v.object({})),
}).index("by_created", ["createdById"]);

export const teamMembers = defineTable({
  teamId: v.id("teams"),
  userId: v.id("users"),
  role: v.string(),
  invitedById: v.id("users"),
}).index("by_team", ["teamId"])
  .index("by_user", ["userId"]);

export const projects = defineTable({
  name: v.string(),
  teamId: v.id("teams"),
  createdById: v.id("users"),
}).index("by_team", ["teamId"]);

export const spaces = defineTable({
  name: v.string(),
  projectId: v.id("projects"),
  type: v.literal("DOCUMENT"),
  createdById: v.id("users"),
}).index("by_project", ["projectId"]);

export const documents = defineTable({
  name: v.string(),
  spaceId: v.id("spaces"),
  createdById: v.id("users"),
  currentVersionId: v.optional(v.id("versions")),
}).index("by_space", ["spaceId"]);

export const versions = defineTable({
  documentId: v.id("documents"),
  number: v.number(),
  storageId: v.id("storage"),
  createdById: v.id("users"),
}).index("by_document", ["documentId"]);
```

## Core Functions

```typescript
// auth.ts
export const getUser = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return await ctx.db
    .query("users")
    .filter(q => q.eq(q.field("email"), identity.email))
    .first();
});

// teams.ts
export const createTeam = mutation(async ({ db, auth }, name: string) => {
  const identity = await auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const team = await db.insert("teams", {
    name,
    createdById: identity.id,
  });

  await db.insert("teamMembers", {
    teamId: team,
    userId: identity.id,
    role: "OWNER",
    invitedById: identity.id,
  });

  return team;
});

// spaces.ts
export const createSpace = mutation(
  async ({ db, auth }, 
    { name, projectId }: { name: string; projectId: Id<"projects"> }
  ) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await db.insert("spaces", {
      name,
      projectId,
      type: "DOCUMENT",
      createdById: identity.id,
    });
});

// documents.ts
export const uploadDocument = mutation(
  async ({ db, storage, auth },
    { name, spaceId, file }: { name: string; spaceId: Id<"spaces">; file: File }
  ) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const storageId = await storage.store(file);
    
    const document = await db.insert("documents", {
      name,
      spaceId,
      createdById: identity.id,
    });

    const version = await db.insert("versions", {
      documentId: document,
      number: 1,
      storageId,
      createdById: identity.id,
    });

    await db.patch(document, { currentVersionId: version });

    return document;
});
```

## User Stories

### Team Management
T1. As a team administrator, I want to create a new team
- Can set team name
- Can see team created
- Can set initial profile

T2. As a team administrator, I want to invite members
- Can invite via email
- Can set initial role
- Can add welcome message

T3. As a team member, I want to accept an invitation
- Can view team information
- Can accept or decline
- Can set initial profile

### Document Management
D1. As a project manager, I want to upload documents
- Can select multiple files
- Can see upload progress
- Can add basic metadata

D2. As a team member, I want to find documents
- Can search by name
- Can filter by type
- Can sort by date

D3. As a team member, I want to update versions
- Can upload new version
- Can add version notes
- Can see version history

## UI Components

### Authentication Flow
```
+----------------------------------------------------------------------------------------+
|                                                                                        |
|                              [Elevra Logo]                                             |
|                            Welcome back to Elevra                                      |
|     +------------------------------------------------------------------------+       |
|     |  Continue with:                                                          |       |
|     |  [ Google ]  [ Microsoft ]                                               |       |
|     |                                                                          |       |
|     |                            or                                            |       |
|     |                                                                          |       |
|     |  Email                                                                   |       |
|     |  +----------------------------------------------------------+          |       |
|     |  |                                                          | |          |       |
|     |  +----------------------------------------------------------+          |       |
|     |  Password                                                               |       |
|     |  +----------------------------------------------------------+          |       |
|     |  |                                                          | |          |       |
|     |  +----------------------------------------------------------+          |       |
|     |                                                                          |       |
|     |  [ Sign In ]                                                            |       |
|     |                                                                          |       |
|     |  [Forgot password?]                                                      |       |
|     +------------------------------------------------------------------------+       |
|                                                                                        |
|     Don't have an account? [Sign up]                                                  |
|                                                                                        |
+----------------------------------------------------------------------------------------+
```

### Main Navigation
```
+----------------------------------------------------------------------------------------+
|  [LOGO]  Team: [Current Team ▼]  [🔍 Search...]           [👤 John Doe ▼]             |
+----------------------------------------------------------------------------------------+
|         |                                                                               |
| T       |  Project > Spaces                                                            |
| E       |  +----------------------------------------------------------------+         |
| A       |  |  [+ New Space] [Sort ▼]  [Grid │ List]                          |         |
| M       |  |                                                                  |         |
| S       |  |  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          |         |
|         |  |  │ Floor Plans  │  │ Elevations   │  │ Details      │          |         |
| [+]     |  |  │ 3 Documents  │  │ 2 Documents  │  │ 4 Documents  │          |         |
|         |  |  │ Last: 2h ago │  │ Last: 1d ago │  │ Last: 4h ago │          |         |
|         |  |  └──────────────┘  └──────────────┘  └──────────────┘          |         |
|         |  |                                                                  |         |
|         |  +----------------------------------------------------------------+         |
+----------------------------------------------------------------------------------------+
```

## Technical Requirements

### Core Functionality
- Basic file upload/download with Convex storage
- Simple file metadata extraction
- Basic caching strategy
- Document version tracking
- Team and project organization
- User authentication and roles

### Performance Considerations
- Efficient large file handling
- Progressive loading for document lists
- Basic search functionality
- Resource cleanup
- Memory management

### Security Requirements
- Input validation
- Basic access control
- File type validation
- Size limits
- Token management

### Implementation Constraints
- PDF-only document support
- Basic metadata only
- Simple version numbering
- Single document type handling
- Minimal real-time features