import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, HardDrive, Link as LinkIcon, Trash2, AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import AdminNav from "../../components/admin/AdminNav";

export default function AdminTeams() {
  const teams = useQuery(api.admin.queries.getAllTeams);
  const deleteTeam = useMutation(api.admin.mutations.deleteTeam);
  const [error, setError] = useState("");
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  if (!teams) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam({ teamId });
      setTeamToDelete(null);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Teams</h1>
        </div>

        <AdminNav />

        {error && (
          <div className="alert alert-error">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
            <button className="btn btn-ghost btn-xs" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Members</th>
                    <th>Storage</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team._id}>
                      <td className="min-w-[200px]">
                        <div>
                          <div className="font-bold">{team.name}</div>
                          {team.description && (
                            <div className="text-sm opacity-50">
                              {team.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{team.memberCount} members</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          <div>
                            <div>
                              {(team.storageUsed / 1024 / 1024 / 1024).toFixed(2)}{" "}
                              GB used
                            </div>
                            {team.settings?.storageLimit && (
                              <div className="text-sm opacity-50">
                                of {team.settings.storageLimit} GB limit
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        {formatDistanceToNow(team.createdAt)} ago
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            to="/teams/$teamId"
                            params={{ teamId: team._id }}
                            className="btn btn-ghost btn-sm"
                          >
                            <LinkIcon className="w-4 h-4" />
                            View Team
                          </Link>
                          {teamToDelete === team._id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-error">
                                Are you sure?
                              </span>
                              <button
                                className="btn btn-error btn-sm"
                                onClick={() => handleDeleteTeam(team._id)}
                              >
                                Yes, Delete
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setTeamToDelete(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm text-error"
                              onClick={() => setTeamToDelete(team._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Storage Usage</h2>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Total Storage Used</div>
                  <div className="stat-value">
                    {(
                      teams.reduce((acc, team) => acc + team.storageUsed, 0) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    GB
                  </div>
                  <div className="stat-desc">
                    Across {teams.length} team{teams.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Team Size Distribution</h2>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Average Team Size</div>
                  <div className="stat-value">
                    {(
                      teams.reduce((acc, team) => acc + team.memberCount, 0) /
                      teams.length
                    ).toFixed(1)}
                  </div>
                  <div className="stat-desc">Members per team</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Team Activity</h2>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Active Teams</div>
                  <div className="stat-value">
                    {
                      teams.filter(
                        (team) =>
                          team.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000
                      ).length
                    }
                  </div>
                  <div className="stat-desc">Created in last 30 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
