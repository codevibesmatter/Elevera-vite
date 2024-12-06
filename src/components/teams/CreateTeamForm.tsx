import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "../form/FormField";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

export function CreateTeamForm({ onSuccess }: { onSuccess?: () => void }) {
  const createTeam = useMutation(api.teams.create);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
  });

  const onSubmit = async (data: CreateTeamForm) => {
    try {
      await createTeam(data);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Team Name"
        name="name"
        register={register}
        error={errors.name?.message}
        required
      />
      
      <FormField
        label="Description"
        name="description"
        register={register}
        error={errors.description?.message}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Creating...
            </>
          ) : (
            'Create Team'
          )}
        </button>
      </div>
    </form>
  );
}
