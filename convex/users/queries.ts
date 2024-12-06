import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAuth } from "../auth";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Get the current user's profile
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    return user;
  },
});

/**
 * Get a user's profile by ID
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

/**
 * Get a user's team memberships
 */
export const getUserTeams = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const targetUserId = args.userId ?? user._id;

    // Get team memberships
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .collect();

    // Get team details
    return Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        if (!team) return null;

        return {
          ...team,
          role: membership.role,
        };
      })
    ).then((teams) => teams.filter(Boolean));
  },
});

/**
 * Search for users by name or email
 */
export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const query = args.query.toLowerCase();
    const limit = args.limit ?? 10;

    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.or(
          q.filter((q) => q.lte("email", query + "\uffff").gte("email", query)),
          q.filter((q) =>
            q.lte("firstName", query + "\uffff").gte("firstName", query)
          ),
          q.filter((q) =>
            q.lte("lastName", query + "\uffff").gte("lastName", query)
          )
        )
      )
      .take(limit);

    return users;
  },
});
