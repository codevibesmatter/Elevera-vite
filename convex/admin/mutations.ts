import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireSuperUser } from "../auth";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Update a user's superuser status
 */
export const updateUserSuperStatus = mutation({
  args: {
    userId: v.id("users"),
    isSuperuser: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);

    // Update user's superuser status
    await ctx.db.patch(args.userId, {
      isSuperuser: args.isSuperuser,
    });

    // Return the updated user
    return await ctx.db.get(args.userId);
  },
});

/**
 * Update a team's settings
 */
export const updateTeamSettings = mutation({
  args: {
    teamId: v.id("teams"),
    settings: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      storageLimit: v.optional(v.number()),
      allowedFileTypes: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);

    // Update team settings
    await ctx.db.patch(args.teamId, {
      ...(args.settings.name && { name: args.settings.name }),
      ...(args.settings.description && { description: args.settings.description }),
      settings: {
        ...(await ctx.db.get(args.teamId))?.settings,
        ...(args.settings.storageLimit && {
          storageLimit: args.settings.storageLimit,
        }),
        ...(args.settings.allowedFileTypes && {
          allowedFileTypes: args.settings.allowedFileTypes,
        }),
      },
    });

    // Return the updated team
    return await ctx.db.get(args.teamId);
  },
});

/**
 * Delete a team and all its associated data
 */
export const deleteTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);

    // Delete team members
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete files
    const files = await ctx.db
      .query("files")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    for (const file of files) {
      await ctx.db.delete(file._id);
    }

    // Finally, delete the team
    await ctx.db.delete(args.teamId);
  },
});
