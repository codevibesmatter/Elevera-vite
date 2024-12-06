import { useParams } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Settings, Crown, Shield, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: User,
};

export default function TeamDetailsPage() {
  const { teamId } = useParams();
  const team = useQuery(api.teams.getTeam, { teamId });

  if (!team) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const canManageTeam = team.userRole === "owner" || team.userRole === "admin";

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.description && (
            <p className="text-base-content/70 mt-1">{team.description}</p>
          )}
        </div>
        {canManageTeam && (
          <Link
            to="/teams/$teamId/settings"
            params={{ teamId }}
            className="btn btn-ghost"
          >
            <Settings className="w-4 h-4 mr-2" />
            Team Settings
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Info */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg">Team Information</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{team.members.length} members</span>
                </div>
                <div className="text-sm text-base-content/60">
                  Created {formatDistanceToNow(team.createdAt)} ago
                </div>
              </div>

              {team.settings && (
                <div>
                  <h3 className="font-medium mb-2">Team Settings</h3>
                  {team.settings.storageLimit && (
                    <div className="text-sm">
                      Storage Limit: {team.settings.storageLimit}GB
                    </div>
                  )}
                  {team.settings.allowedFileTypes && (
                    <div className="text-sm">
                      Allowed Files: {team.settings.allowedFileTypes.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Team Members</h2>
            {canManageTeam && (
              <button className="btn btn-primary btn-sm">
                Add Member
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Joined</th>
                  {canManageTeam && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {team.members.map((member) => {
                  const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                  return (
                    <tr key={member._id}>
                      <td className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span className="text-xs">
                              {member.user?.firstName?.[0] || member.user?.email[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.user?.firstName
                              ? `${member.user.firstName} ${member.user.lastName || ""}`
                              : member.user?.email}
                          </div>
                          <div className="text-sm text-base-content/60">
                            {member.user?.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <RoleIcon className="w-4 h-4" />
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </td>
                      <td>{formatDistanceToNow(member.joinedAt)} ago</td>
                      {canManageTeam && (
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-ghost btn-xs">
                              Change Role
                            </button>
                            {team.userRole === "owner" && member.role !== "owner" && (
                              <button className="btn btn-ghost btn-xs text-error">
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
