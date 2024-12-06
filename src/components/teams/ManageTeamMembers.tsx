import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Shield, Crown, User, X, Check } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: User,
};

const roleOptions = [
  { value: "admin", label: "Admin", description: "Can manage team and members" },
  { value: "member", label: "Member", description: "Can view and edit content" },
  { value: "viewer", label: "Viewer", description: "Can only view content" },
];

type Member = {
  _id: Id<"teamMembers">;
  role: string;
  user: {
    _id: Id<"users">;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

type Props = {
  teamId: Id<"teams">;
  members: Member[];
  userRole: string;
  onUpdate?: () => void;
};

export default function ManageTeamMembers({ teamId, members, userRole, onUpdate }: Props) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [error, setError] = useState("");
  const [isChangingRole, setIsChangingRole] = useState<Id<"users"> | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const addMember = useMutation(api.teams.addMember);
  const updateRole = useMutation(api.teams.updateMemberRole);
  const removeMember = useMutation(api.teams.removeMember);

  const canManageMembers = ["owner", "admin"].includes(userRole);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await addMember({
        teamId,
        email: newMemberEmail,
        role: selectedRole,
      });
      setNewMemberEmail("");
      setSelectedRole("member");
      setIsAddingMember(false);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    }
  };

  const handleUpdateRole = async (userId: Id<"users">, newRole: string) => {
    try {
      await updateRole({
        teamId,
        userId,
        newRole,
      });
      setIsChangingRole(null);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: Id<"users">) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMember({
        teamId,
        userId,
      });
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-error mb-4">
          <X className="w-4 h-4" />
          <span>{error}</span>
          <button className="btn btn-ghost btn-xs" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {canManageMembers && (
        <div className="mb-6">
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingMember(true)}
          >
            Add Member
          </button>

          <Dialog.Root open={isAddingMember} onOpenChange={setIsAddingMember}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-base-100 rounded-lg shadow-xl p-6">
                <Dialog.Title className="text-lg font-bold mb-4">
                  Add Team Member
                </Dialog.Title>

                <form onSubmit={handleAddMember}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text">Role</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <label className="label">
                      <span className="label-text-alt">
                        {roleOptions.find((r) => r.value === selectedRole)?.description}
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsAddingMember(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Member
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              {canManageMembers && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
              const isCurrentlyChangingRole = isChangingRole === member.user._id;

              return (
                <tr key={member._id}>
                  <td className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-8">
                        <span className="text-xs">
                          {member.user.firstName?.[0] || member.user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.firstName
                          ? `${member.user.firstName} ${member.user.lastName || ""}`
                          : member.user.email}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {member.user.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <RoleIcon className="w-4 h-4" />
                      {isCurrentlyChangingRole ? (
                        <select
                          className="select select-bordered select-sm"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          autoFocus
                        >
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="capitalize">{member.role}</span>
                      )}
                    </div>
                  </td>
                  {canManageMembers && (
                    <td>
                      <div className="flex gap-2">
                        {isCurrentlyChangingRole ? (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setIsChangingRole(null)}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleUpdateRole(member.user._id, newRole)}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {member.role !== "owner" && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                  setIsChangingRole(member.user._id);
                                  setNewRole(member.role);
                                }}
                              >
                                Change Role
                              </button>
                            )}
                            {userRole === "owner" && member.role !== "owner" && (
                              <button
                                className="btn btn-ghost btn-sm text-error"
                                onClick={() => handleRemoveMember(member.user._id)}
                              >
                                Remove
                              </button>
                            )}
                          </>
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
  );
}
