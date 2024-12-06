import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAuth } from "../auth";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    settings: v.optional(
      v.object({
        theme: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
        timezone: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Update user profile
    await ctx.db.patch(user._id, {
      ...(args.firstName && { firstName: args.firstName }),
      ...(args.lastName && { lastName: args.lastName }),
      ...(args.avatarUrl && { avatarUrl: args.avatarUrl }),
      ...(args.settings && {
        settings: {
          ...user.settings,
          ...args.settings,
        },
      }),
      updatedAt: Date.now(),
    });

    // Return updated user
    return await ctx.db.get(user._id);
  },
});

/**
 * Update user's notification settings
 */
export const updateNotificationSettings = mutation({
  args: {
    settings: v.object({
      emailNotifications: v.optional(v.boolean()),
      pushNotifications: v.optional(v.boolean()),
      notificationTypes: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Update notification settings
    await ctx.db.patch(user._id, {
      settings: {
        ...user.settings,
        notifications: {
          ...(user.settings?.notifications ?? {}),
          ...args.settings,
        },
      },
      updatedAt: Date.now(),
    });

    // Return updated user
    return await ctx.db.get(user._id);
  },
});

/**
 * Update user's avatar
 */
export const updateAvatar = mutation({
  args: {
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Update avatar URL
    await ctx.db.patch(user._id, {
      avatarUrl: args.avatarUrl,
      updatedAt: Date.now(),
    });

    // Return updated user
    return await ctx.db.get(user._id);
  },
});

/**
 * Delete user's avatar
 */
export const deleteAvatar = mutation({
  handler: async (ctx) => {
    const user = await requireAuth(ctx);

    // Remove avatar URL
    await ctx.db.patch(user._id, {
      avatarUrl: null,
      updatedAt: Date.now(),
    });

    // Return updated user
    return await ctx.db.get(user._id);
  },
});
