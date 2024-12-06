import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./users";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const userId = await getUserId(ctx);

    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      createdBy: userId,
      createdAt: Date.now(),
    });

    // Add creator as team owner
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      role: "owner",
      invitedBy: userId,
      joinedAt: Date.now(),
    });

    return teamId;
  },
});

export const list = query({
  async handler(ctx) {
    const userId = await getUserId(ctx);

    // Get all teams the user is a member of
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get the actual team details
    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        if (!team) return null;

        const memberCount = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect()
          .then((members) => members.length);

        return {
          ...team,
          role: membership.role,
          memberCount,
        };
      })
    );

    return teams.filter(Boolean);
  },
});

export const getTeam = query({
  args: { teamId: v.id("teams") },
  async handler(ctx, args) {
    const userId = await getUserId(ctx);

    // Check if user is a member of the team
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", userId).eq("teamId", args.teamId)
      )
      .first();

    if (!membership) {
      throw new Error("Not authorized to view this team");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user,
        };
      })
    );

    return {
      ...team,
      members: memberDetails,
      userRole: membership.role,
    };
  },
});

export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has permission to add members
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", user._id).eq("teamId", args.teamId)
      )
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized to add members");
    }

    // Find the user to add by email
    const userToAdd = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!userToAdd) {
      throw new Error("User not found with that email");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", userToAdd._id).eq("teamId", args.teamId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member of this team");
    }

    // Add new member
    return await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: userToAdd._id,
      role: args.role,
      invitedBy: user._id,
      joinedAt: Date.now(),
    });
  },
});

export const updateMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    newRole: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has permission to update roles
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", user._id).eq("teamId", args.teamId)
      )
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized to update member roles");
    }

    // Get target member's current role
    const targetMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();

    if (!targetMembership) {
      throw new Error("Member not found");
    }

    // Prevent non-owners from modifying owner role
    if (
      targetMembership.role === "owner" && 
      membership.role !== "owner"
    ) {
      throw new Error("Only owners can modify owner roles");
    }

    // Update the role
    return await ctx.db.patch(targetMembership._id, {
      role: args.newRole,
    });
  },
});

export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has permission to remove members
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", user._id).eq("teamId", args.teamId)
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only team owners can remove members");
    }

    // Get target member's current role
    const targetMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", args.userId).eq("teamId", args.teamId)
      )
      .first();

    if (!targetMembership) {
      throw new Error("Member not found");
    }

    // Prevent removing owners
    if (targetMembership.role === "owner") {
      throw new Error("Cannot remove team owner");
    }

    // Remove the member
    await ctx.db.delete(targetMembership._id);
  },
});

export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        storageLimit: v.optional(v.number()),
        allowedFileTypes: v.optional(v.array(v.string())),
      })
    ),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has permission to update team
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", user._id).eq("teamId", args.teamId)
      )
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized to update team settings");
    }

    // Update the team
    return await ctx.db.patch(args.teamId, {
      name: args.name,
      description: args.description,
      settings: args.settings,
    });
  },
});

export const deleteTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is the team owner
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_user_team", (q) => 
        q.eq("userId", user._id).eq("teamId", args.teamId)
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only team owners can delete teams");
    }

    // Get all team members
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Delete all team members
    await Promise.all(
      members.map((member) => ctx.db.delete(member._id))
    );

    // Delete the team
    await ctx.db.delete(args.teamId);
  },
});
