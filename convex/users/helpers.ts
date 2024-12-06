import { v } from "convex/values";
import { DatabaseReader, DatabaseWriter } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

/**
 * User roles within a team
 */
export const TeamRole = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];

/**
 * Check if a user has a specific role in a team
 */
export async function hasTeamRole(
  db: DatabaseReader,
  userId: Id<"users">,
  teamId: Id<"teams">,
  role: TeamRole
): Promise<boolean> {
  const membership = await db
    .query("teamMembers")
    .withIndex("by_user_team", (q) =>
      q.eq("userId", userId).eq("teamId", teamId)
    )
    .first();

  return membership?.role === role;
}

/**
 * Check if a user is a member of a team
 */
export async function isTeamMember(
  db: DatabaseReader,
  userId: Id<"users">,
  teamId: Id<"teams">
): Promise<boolean> {
  const membership = await db
    .query("teamMembers")
    .withIndex("by_user_team", (q) =>
      q.eq("userId", userId).eq("teamId", teamId)
    )
    .first();

  return !!membership;
}

/**
 * Get a user's role in a team
 */
export async function getUserTeamRole(
  db: DatabaseReader,
  userId: Id<"users">,
  teamId: Id<"teams">
): Promise<TeamRole | null> {
  const membership = await db
    .query("teamMembers")
    .withIndex("by_user_team", (q) =>
      q.eq("userId", userId).eq("teamId", teamId)
    )
    .first();

  return membership?.role ?? null;
}

/**
 * Check if a user can perform an action in a team
 */
export async function canPerformTeamAction(
  db: DatabaseReader,
  userId: Id<"users">,
  teamId: Id<"teams">,
  requiredRoles: TeamRole[]
): Promise<boolean> {
  const role = await getUserTeamRole(db, userId, teamId);
  return role ? requiredRoles.includes(role) : false;
}

/**
 * Validate user input for profile updates
 */
export const profileSchema = {
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
};
