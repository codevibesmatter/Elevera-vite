import { useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, AlertTriangle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

const teamSettingsSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  settings: z.object({
    storageLimit: z.number().min(1, "Storage limit must be at least 1GB").optional(),
    allowedFileTypes: z.array(z.string()).optional(),
  }).optional(),
});

type TeamSettingsFormData = z.infer<typeof teamSettingsSchema>;

const DEFAULT_ALLOWED_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export default function TeamSettingsPage() {
  const { teamId } = useParams();
  const team = useQuery(api.teams.getTeam, { teamId });
  const updateTeam = useMutation(api.teams.updateTeam);
  const deleteTeam = useMutation(api.teams.deleteTeam);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<TeamSettingsFormData>({
    resolver: zodResolver(teamSettingsSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      settings: {
        storageLimit: team?.settings?.storageLimit,
        allowedFileTypes: team?.settings?.allowedFileTypes || DEFAULT_ALLOWED_FILE_TYPES,
      },
    },
  });

  if (!team) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const onSubmit = async (data: TeamSettingsFormData) => {
    try {
      await updateTeam({
        teamId,
        ...data,
      });
      reset(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team settings");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== team.name) {
      setError("Team name doesn't match");
      return;
    }

    try {
      await deleteTeam({ teamId });
      window.location.href = "/teams";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Team Settings</h1>

        {error && (
          <div className="alert alert-error mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
            <button className="btn btn-ghost btn-xs" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Team Name</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered ${
                    errors.name ? "input-error" : ""
                  }`}
                  {...register("name")}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.name.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  {...register("description")}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Storage Limit (GB)</span>
                </label>
                <input
                  type="number"
                  className={`input input-bordered ${
                    errors.settings?.storageLimit ? "input-error" : ""
                  }`}
                  {...register("settings.storageLimit", { valueAsNumber: true })}
                />
                {errors.settings?.storageLimit && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.settings.storageLimit.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Allowed File Types</span>
                </label>
                <select
                  multiple
                  className="select select-bordered h-32"
                  {...register("settings.allowedFileTypes")}
                >
                  <option value="image/*">Images</option>
                  <option value="application/pdf">PDF Documents</option>
                  <option value="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                    Word Documents
                  </option>
                  <option value="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                    Excel Spreadsheets
                  </option>
                  <option value="text/plain">Text Files</option>
                  <option value="application/zip,application/x-zip-compressed">
                    ZIP Archives
                  </option>
                </select>
                <label className="label">
                  <span className="label-text-alt">
                    Hold Ctrl/Cmd to select multiple
                  </span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
                  disabled={!isDirty || isSubmitting}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-error mb-4">Danger Zone</h2>
          <div className="card bg-base-100 shadow-xl border-2 border-error">
            <div className="card-body">
              <h3 className="card-title text-error">Delete Team</h3>
              <p className="text-base-content/70">
                This action cannot be undone. This will permanently delete the team
                and remove all members.
              </p>

              <div className="flex justify-end mt-4">
                <button
                  className="btn btn-error"
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Team
                </button>
              </div>

              <Dialog.Root open={isDeleting} onOpenChange={setIsDeleting}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-base-100 rounded-lg shadow-xl p-6">
                    <Dialog.Title className="text-lg font-bold text-error mb-4">
                      Delete Team
                    </Dialog.Title>

                    <p className="mb-4">
                      This action cannot be undone. This will permanently delete the
                      <strong> {team.name} </strong>
                      team and remove all members.
                    </p>

                    <p className="mb-2">
                      Please type <strong>{team.name}</strong> to confirm:
                    </p>

                    <input
                      type="text"
                      className="input input-bordered w-full mb-4"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-ghost"
                        onClick={() => {
                          setIsDeleting(false);
                          setDeleteConfirmation("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-error"
                        onClick={handleDelete}
                        disabled={deleteConfirmation !== team.name}
                      >
                        Delete Team
                      </button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
