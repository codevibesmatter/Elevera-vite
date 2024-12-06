import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Shield, User, Building2, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import AdminNav from "../../components/admin/AdminNav";

export default function AdminUsers() {
  const users = useQuery(api.admin.queries.getAllUsers);
  const updateSuperStatus = useMutation(api.admin.mutations.updateUserSuperStatus);
  const [error, setError] = useState("");

  if (!users) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const handleSuperStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      await updateSuperStatus({
        userId,
        isSuperuser: newStatus,
      });
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user status");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Users</h1>
        </div>

        <AdminNav />

        {error && (
          <div className="alert alert-error">
            <X className="w-4 h-4" />
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
                    <th>User</th>
                    <th>Teams</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-8">
                              <span className="text-xs">
                                {user.firstName?.[0] || user.email[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">
                              {user.firstName
                                ? `${user.firstName} ${user.lastName || ""}`
                                : user.email}
                            </div>
                            <div className="text-sm opacity-50">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {user.teams?.map((team) => (
                            <Link
                              key={team._id}
                              to="/teams/$teamId"
                              params={{ teamId: team._id }}
                              className="flex items-center gap-1 text-sm hover:text-primary"
                            >
                              <Building2 className="w-3 h-3" />
                              {team.name}
                              <span className="text-xs opacity-50">
                                ({team.role})
                              </span>
                            </Link>
                          ))}
                          {(!user.teams || user.teams.length === 0) && (
                            <span className="text-sm opacity-50">No teams</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        {formatDistanceToNow(user.createdAt)} ago
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {user.isSuperuser ? (
                            <div className="badge badge-primary gap-1">
                              <Shield className="w-3 h-3" />
                              Super Admin
                            </div>
                          ) : (
                            <div className="badge gap-1">
                              <User className="w-3 h-3" />
                              User
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            className={`btn btn-sm ${
                              user.isSuperuser ? "btn-error" : "btn-primary"
                            }`}
                            onClick={() =>
                              handleSuperStatusChange(user._id, !user.isSuperuser)
                            }
                          >
                            {user.isSuperuser ? (
                              <>
                                <X className="w-4 h-4" />
                                Remove Super Admin
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Make Super Admin
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
