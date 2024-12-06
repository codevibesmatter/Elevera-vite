import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireSuperUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!user?.isSuperuser) {
    throw new Error("Not authorized. Requires superuser access.");
  }

  return user;
}

export const getAllUsers = query({
  async handler(ctx) {
    await requireSuperUser(ctx);

    const users = await ctx.db.query("users").collect();

    // Get team memberships for each user
    const usersWithTeams = await Promise.all(
      users.map(async (user) => {
        const memberships = await ctx.db
          .query("teamMembers")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const teams = await Promise.all(
          memberships.map(async (membership) => {
            const team = await ctx.db.get(membership.teamId);
            return {
              ...team,
              role: membership.role,
            };
          })
        );

        return {
          ...user,
          teams: teams.filter(Boolean),
        };
      })
    );

    return usersWithTeams;
  },
});

export const getAllTeams = query({
  async handler(ctx) {
    await requireSuperUser(ctx);

    const teams = await ctx.db.query("teams").collect();

    // Get member count and storage usage for each team
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        // TODO: Add storage usage calculation when file system is implemented
        const storageUsed = 0;

        return {
          ...team,
          memberCount: members.length,
          storageUsed,
        };
      })
    );

    return teamsWithStats;
  },
});

export const getTeamStats = query({
  async handler(ctx) {
    await requireSuperUser(ctx);

    const teams = await ctx.db.query("teams").collect();
    const users = await ctx.db.query("users").collect();
    const teamMembers = await ctx.db.query("teamMembers").collect();

    const stats = {
      totalTeams: teams.length,
      totalUsers: users.length,
      totalMemberships: teamMembers.length,
      averageMembersPerTeam: teams.length ? teamMembers.length / teams.length : 0,
      teamsCreatedLast30Days: teams.filter(
        (team) => team.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      usersCreatedLast30Days: users.filter(
        (user) => user.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
    };

    return stats;
  },
});

export const updateUserSuperStatus = mutation({
  args: {
    userId: v.id("users"),
    isSuperuser: v.boolean(),
  },
  async handler(ctx, args) {
    await requireSuperUser(ctx);

    return await ctx.db.patch(args.userId, {
      isSuperuser: args.isSuperuser,
    });
  },
});
