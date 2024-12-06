import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import AvatarUpload from '../AvatarUpload'; // Import AvatarUpload component

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().url().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getProfile);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      avatarUrl: user?.imageUrl,
    },
  });

  if (!user || !convexUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update Clerk profile
      await user.update({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // If email changed, add it to Clerk
      const currentEmail = user.emailAddresses[0]?.emailAddress;
      if (data.email !== currentEmail) {
        await user.addEmail({ email: data.email });
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          {!isEditing && (
            <button
              className="btn btn-ghost"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col items-center gap-4 mb-6">
              <AvatarUpload />
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">First Name</span>
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered ${
                      errors.firstName ? "input-error" : ""
                    }`}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.firstName.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Last Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    {...register("lastName")}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className={`input input-bordered ${
                      errors.email ? "input-error" : ""
                    }`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.email.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary ${
                      isSubmitting ? "loading" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <p className="mt-1">{user.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <p className="mt-1">{user.lastName || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="mt-1">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Teams Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Teams</h2>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {convexUser.teams?.length > 0 ? (
                <div className="space-y-4">
                  {convexUser.teams.map((team) => (
                    <div
                      key={team._id}
                      className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-base-content/70">
                          Role: {team.role}
                        </p>
                      </div>
                      <a
                        href={`/teams/${team._id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View Team
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-base-content/70">You are not a member of any teams yet.</p>
                  <a href="/teams" className="btn btn-primary mt-2">
                    Browse Teams
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
