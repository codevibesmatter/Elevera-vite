import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAuth } from "../auth";
import { Doc, Id } from "../_generated/dataModel";
import { canPerformTeamAction, TeamRole } from "../users/helpers";

/**
 * Get a team by ID
 */
export const getTeamById = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user is a member of the team
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) =>
        q.eq("userId", user._id).eq("teamId", args.teamId)
      )
      .first();

    if (!membership) {
      throw new Error("Not authorized to view this team");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    return {
      ...team,
      role: membership.role,
    };
  },
});

/**
 * Get team members
 */
export const getTeamMembers = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user is a member of the team
    const isMember = await canPerformTeamAction(ctx.db, user._id, args.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!isMember) {
      throw new Error("Not authorized to view team members");
    }

    // Get all team members
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Get user details for each member
    return Promise.all(
      memberships.map(async (membership) => {
        const memberUser = await ctx.db.get(membership.userId);
        if (!memberUser) return null;

        return {
          ...memberUser,
          role: membership.role,
        };
      })
    ).then((members) => members.filter(Boolean));
  },
});

/**
 * Get team storage usage
 */
export const getTeamStorage = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user is a member of the team
    const isMember = await canPerformTeamAction(ctx.db, user._id, args.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!isMember) {
      throw new Error("Not authorized to view team storage");
    }

    // Get all files
    const files = await ctx.db
      .query("files")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Calculate storage metrics
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
    const fileCount = files.length;
    const fileTypes = new Set(files.map((file) => file.type));

    return {
      totalSize,
      fileCount,
      fileTypes: Array.from(fileTypes),
      files: files.map((file) => ({
        id: file._id,
        name: file.name,
        size: file.size,
        type: file.type,
        createdAt: file.createdAt,
      })),
    };
  },
});

/**
 * Search for teams
 */
export const searchTeams = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const query = args.query.toLowerCase();
    const limit = args.limit ?? 10;

    // Get user's team memberships
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const teamIds = memberships.map((m) => m.teamId);

    // Search teams user is a member of
    const teams = await ctx.db
      .query("teams")
      .filter((q) =>
        q.and(
          q.in(q.field("_id"), teamIds),
          q.or(
            q.filter((q) => q.lte("name", query + "\uffff").gte("name", query)),
            q.filter((q) =>
              q.lte("description", query + "\uffff").gte("description", query)
            )
          )
        )
      )
      .take(limit);

    return teams;
  },
});
