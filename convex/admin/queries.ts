import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireSuperUser } from "../auth";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Get all users with their team memberships and roles
 */
export const getAllUsers = query({
  handler: async (ctx) => {
    await requireSuperUser(ctx);

    // Get all users
    const users = await ctx.db.query("users").collect();

    // Get team memberships for each user
    return Promise.all(
      users.map(async (user) => {
        const memberships = await ctx.db
          .query("teamMembers")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        // Get team details for each membership
        const teams = await Promise.all(
          memberships.map(async (membership) => {
            const team = await ctx.db.get(membership.teamId);
            return team
              ? {
                  _id: team._id,
                  name: team.name,
                  role: membership.role,
                }
              : null;
          })
        );

        return {
          ...user,
          teams: teams.filter(Boolean),
        };
      })
    );
  },
});

/**
 * Get all teams with their member counts and storage usage
 */
export const getAllTeams = query({
  handler: async (ctx) => {
    await requireSuperUser(ctx);

    // Get all teams
    const teams = await ctx.db.query("teams").collect();

    // Get member counts and storage usage for each team
    return Promise.all(
      teams.map(async (team) => {
        // Get member count
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        // Get storage usage
        const storage = await ctx.db
          .query("files")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const storageUsed = storage.reduce((acc, file) => acc + (file.size || 0), 0);

        return {
          ...team,
          memberCount: members.length,
          storageUsed,
        };
      })
    );
  },
});

/**
 * Get dashboard statistics for teams and users
 */
export const getDashboardStats = query({
  handler: async (ctx) => {
    await requireSuperUser(ctx);

    // Get all records
    const [teams, users, teamMembers, files] = await Promise.all([
      ctx.db.query("teams").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("teamMembers").collect(),
      ctx.db.query("files").collect(),
    ]);

    // Calculate storage usage
    const totalStorage = files.reduce((acc, file) => acc + (file.size || 0), 0);

    // Calculate time-based metrics
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const teamsCreatedLast30Days = teams.filter(
      (team) => team.createdAt > thirtyDaysAgo
    ).length;
    const usersCreatedLast30Days = users.filter(
      (user) => user.createdAt > thirtyDaysAgo
    ).length;

    return {
      totalTeams: teams.length,
      totalUsers: users.length,
      totalMemberships: teamMembers.length,
      totalStorage,
      teamsCreatedLast30Days,
      usersCreatedLast30Days,
      averageMembersPerTeam: teams.length
        ? teamMembers.length / teams.length
        : 0,
    };
  },
});
