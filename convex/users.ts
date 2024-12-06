import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isSuperuser: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        isSuperuser: args.isSuperuser,
      });
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      isSuperuser: args.isSuperuser,
      createdAt: Date.now(),
    });
  },
});

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const setSuperuser = mutation({
  args: {
    userId: v.id("users"),
    isSuperuser: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return await ctx.db.patch(args.userId, { isSuperuser: args.isSuperuser });
  },
});

export const getProfile = query({
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get teams the user is a member of
    const teamMemberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const teams = await Promise.all(
      teamMemberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        if (!team) return null;
        return {
          _id: team._id,
          name: team.name,
          role: membership.role,
        };
      })
    );

    return {
      ...user,
      teams: teams.filter(Boolean),
    };
  },
});
