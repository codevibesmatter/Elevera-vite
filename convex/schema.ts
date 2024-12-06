import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isSuperuser: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    settings: v.optional(v.object({
      storageLimit: v.optional(v.number()),
      allowedFileTypes: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
  }).index("by_created_by", ["createdBy"]),

  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.string(), // owner, admin, member, viewer
    invitedBy: v.id("users"),
    joinedAt: v.number(),
  })
  .index("by_team", ["teamId"])
  .index("by_user", ["userId"])
  .index("by_user_team", (q) => [q.userId, q.teamId]),

  files: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    description: v.optional(v.string()),
    storageKey: v.string(),
    metadata: v.optional(v.any()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_team", ["teamId"])
  .index("by_created_by", ["createdBy"])
  .index("by_team_type", ["teamId", "type"]),

  messages: defineTable({
    text: v.string(),
    author: v.string(),
    createdAt: v.number(),
  }),
});
