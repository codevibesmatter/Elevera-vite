import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAuth } from "../auth";
import { Doc, Id } from "../_generated/dataModel";
import { canPerformTeamAction, TeamRole } from "../users/helpers";

/**
 * Create a new team
 */
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        storageLimit: v.optional(v.number()),
        allowedFileTypes: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Create the team
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      settings: args.settings ?? {
        storageLimit: 5 * 1024 * 1024 * 1024, // 5GB default
        allowedFileTypes: ["image/*", "application/pdf"],
      },
      createdAt: Date.now(),
      createdBy: user._id,
    });

    // Add creator as team owner
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: user._id,
      role: TeamRole.OWNER,
      joinedAt: Date.now(),
    });

    return await ctx.db.get(teamId);
  },
});

/**
 * Update team settings
 */
export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        storageLimit: v.optional(v.number()),
        allowedFileTypes: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user has permission
    const canUpdate = await canPerformTeamAction(ctx.db, user._id, args.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
    ]);

    if (!canUpdate) {
      throw new Error("Not authorized to update team settings");
    }

    // Update team
    await ctx.db.patch(args.teamId, {
      ...(args.name && { name: args.name }),
      ...(args.description && { description: args.description }),
      ...(args.settings && {
        settings: {
          ...(await ctx.db.get(args.teamId))?.settings,
          ...args.settings,
        },
      }),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.teamId);
  },
});

/**
 * Add a member to the team
 */
export const addTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user has permission
    const canManageMembers = await canPerformTeamAction(
      ctx.db,
      user._id,
      args.teamId,
      [TeamRole.OWNER, TeamRole.ADMIN]
    );

    if (!canManageMembers) {
      throw new Error("Not authorized to manage team members");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) =>
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member of this team");
    }

    // Add member
    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      role: args.role as TeamRole,
      joinedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Update a team member's role
 */
export const updateTeamMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user has permission
    const canManageMembers = await canPerformTeamAction(
      ctx.db,
      user._id,
      args.teamId,
      [TeamRole.OWNER]
    );

    if (!canManageMembers) {
      throw new Error("Only team owners can change member roles");
    }

    // Get existing membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) =>
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this team");
    }

    // Update role
    await ctx.db.patch(membership._id, {
      role: args.newRole as TeamRole,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Remove a member from the team
 */
export const removeTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user has permission
    const canManageMembers = await canPerformTeamAction(
      ctx.db,
      user._id,
      args.teamId,
      [TeamRole.OWNER, TeamRole.ADMIN]
    );

    if (!canManageMembers) {
      throw new Error("Not authorized to manage team members");
    }

    // Get membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) =>
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this team");
    }

    // Cannot remove the owner
    if (membership.role === TeamRole.OWNER) {
      throw new Error("Cannot remove the team owner");
    }

    // Remove member
    await ctx.db.delete(membership._id);

    return true;
  },
});
