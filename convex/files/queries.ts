import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAuth } from "../auth";
import { Doc, Id } from "../_generated/dataModel";
import { canPerformTeamAction, TeamRole } from "../users/helpers";

/**
 * Get file details by ID
 */
export const getFileById = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Check if user has access to the file's team
    const canAccess = await canPerformTeamAction(ctx.db, user._id, file.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!canAccess) {
      throw new Error("Not authorized to access this file");
    }

    return file;
  },
});

/**
 * Get team files with pagination
 */
export const getTeamFiles = query({
  args: {
    teamId: v.id("teams"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const limit = args.limit ?? 50;

    // Check if user has access to the team
    const canAccess = await canPerformTeamAction(ctx.db, user._id, args.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!canAccess) {
      throw new Error("Not authorized to access team files");
    }

    // Build query
    let filesQuery = ctx.db
      .query("files")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId));

    // Add type filter if specified
    if (args.type) {
      filesQuery = filesQuery.filter((q) => q.eq(q.field("type"), args.type));
    }

    // Add cursor if specified
    if (args.cursor) {
      filesQuery = filesQuery.filter((q) =>
        q.lt(q.field("createdAt"), parseInt(args.cursor!))
      );
    }

    // Get files with pagination
    const files = await filesQuery.order("desc").take(limit + 1);

    // Check if there are more results
    const hasMore = files.length > limit;
    if (hasMore) {
      files.pop(); // Remove the extra item
    }

    return {
      files,
      cursor: hasMore ? files[files.length - 1].createdAt.toString() : null,
    };
  },
});

/**
 * Search team files
 */
export const searchTeamFiles = query({
  args: {
    teamId: v.id("teams"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const limit = args.limit ?? 20;

    // Check if user has access to the team
    const canAccess = await canPerformTeamAction(ctx.db, user._id, args.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!canAccess) {
      throw new Error("Not authorized to access team files");
    }

    const query = args.query.toLowerCase();

    // Search files
    const files = await ctx.db
      .query("files")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) =>
        q.or(
          q.filter((q) => q.lte("name", query + "\uffff").gte("name", query)),
          q.filter((q) =>
            q.lte("description", query + "\uffff").gte("description", query)
          )
        )
      )
      .take(limit);

    return files;
  },
});

/**
 * Get file statistics for a team
 */
export const getTeamFileStats = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user has access to the team
    const canAccess = await canPerformTeamAction(ctx.db, user._id, args.teamId, [
      TeamRole.OWNER,
      TeamRole.ADMIN,
      TeamRole.MEMBER,
    ]);

    if (!canAccess) {
      throw new Error("Not authorized to access team statistics");
    }

    // Get all files
    const files = await ctx.db
      .query("files")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Calculate statistics
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
    const fileTypes = files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lastMonth = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentFiles = files.filter((file) => file.createdAt > lastMonth);

    return {
      totalFiles: files.length,
      totalSize,
      fileTypes,
      recentFiles: recentFiles.length,
      averageFileSize: files.length ? totalSize / files.length : 0,
    };
  },
});
