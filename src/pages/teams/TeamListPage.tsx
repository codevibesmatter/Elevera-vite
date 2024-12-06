import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { Users, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TeamListPage() {
  const teams = useQuery(api.teams.list);

  if (!teams) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Link
          to="/teams/create"
          className="btn btn-primary"
        >
          Create Team
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team._id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <h2 className="card-title">{team.name}</h2>
              {team.description && (
                <p className="text-base-content/70">{team.description}</p>
              )}
              
              <div className="flex items-center gap-2 text-sm text-base-content/60 mt-2">
                <Users className="w-4 h-4" />
                <span>{team.memberCount} members</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <span>Created {formatDistanceToNow(team.createdAt)} ago</span>
              </div>

              <div className="card-actions justify-end mt-4">
                {(team.role === "owner" || team.role === "admin") && (
                  <Link
                    to="/teams/$teamId/settings"
                    params={{ teamId: team._id }}
                    className="btn btn-ghost btn-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                )}
                <Link
                  to="/teams/$teamId"
                  params={{ teamId: team._id }}
                  className="btn btn-primary btn-sm"
                >
                  View Team
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
          <p className="text-base-content/70 mb-4">
            Create your first team to get started
          </p>
          <Link
            to="/teams/create"
            className="btn btn-primary"
          >
            Create Team
          </Link>
        </div>
      )}
    </div>
  );
}
