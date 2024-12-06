import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAuth } from "../auth";
import { Doc, Id } from "../_generated/dataModel";
import { canPerformTeamAction, TeamRole } from "../users/helpers";
import { getTeamStorageLimit } from "../teams/helpers";

/**
 * Create a new file record
 */
export const createFile = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    description: v.optional(v.string()),
    storageKey: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user has access to create files in the team
    const canAccess = await canPerformTeamAction(ctx.db, user._id, args.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!canAccess) {
      throw new Error("Not authorized to create files in this team");
    }

    // Check team storage limit
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const storageLimit = getTeamStorageLimit(team);
    const currentStorage = await ctx.db
      .query("files")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()
      .then((files) => files.reduce((acc, file) => acc + (file.size || 0), 0));

    if (currentStorage + args.size > storageLimit) {
      throw new Error("Team storage limit exceeded");
    }

    // Create file record
    const fileId = await ctx.db.insert("files", {
      teamId: args.teamId,
      name: args.name,
      type: args.type,
      size: args.size,
      description: args.description,
      storageKey: args.storageKey,
      metadata: args.metadata,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

/**
 * Update file details
 */
export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has access to update the file
    const canAccess = await canPerformTeamAction(ctx.db, user._id, file.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!canAccess) {
      throw new Error("Not authorized to update this file");
    }

    // Update file
    await ctx.db.patch(args.fileId, {
      ...(args.name && { name: args.name }),
      ...(args.description && { description: args.description }),
      ...(args.metadata && { metadata: args.metadata }),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a file
 */
export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has access to delete the file
    const canAccess = await canPerformTeamAction(ctx.db, user._id, file.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
    ]);

    if (!canAccess) {
      throw new Error("Not authorized to delete this file");
    }

    // Delete file record
    await ctx.db.delete(args.fileId);

    // Note: Storage cleanup should be handled separately
    // through a scheduled job or webhook
  },
});

/**
 * Move file to another team
 */
export const moveFile = mutation({
  args: {
    fileId: v.id("files"),
    targetTeamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has access to both teams
    const canAccessSource = await canPerformTeamAction(
      ctx.db,
      user._id,
      file.teamId,
      [TeamRole.OWNER, TeamRole.ADMIN]
    );
    const canAccessTarget = await canPerformTeamAction(
      ctx.db,
      user._id,
      args.targetTeamId,
      [TeamRole.OWNER, TeamRole.ADMIN]
    );

    if (!canAccessSource || !canAccessTarget) {
      throw new Error(
        "Not authorized to move files between these teams"
      );
    }

    // Check target team storage limit
    const targetTeam = await ctx.db.get(args.targetTeamId);
    if (!targetTeam) {
      throw new Error("Target team not found");
    }

    const storageLimit = getTeamStorageLimit(targetTeam);
    const currentStorage = await ctx.db
      .query("files")
      .withIndex("by_team", (q) => q.eq("teamId", args.targetTeamId))
      .collect()
      .then((files) => files.reduce((acc, file) => acc + (file.size || 0), 0));

    if (currentStorage + (file.size || 0) > storageLimit) {
      throw new Error("Target team storage limit exceeded");
    }

    // Move file
    await ctx.db.patch(args.fileId, {
      teamId: args.targetTeamId,
      updatedAt: Date.now(),
    });
  },
});
