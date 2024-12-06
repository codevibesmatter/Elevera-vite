import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { config } from "../config";

export function useConvexUser() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const convexUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (!isClerkLoaded || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    const configuredEmail = config.initialSuperUserEmail;
    const shouldBeSuperuser = Boolean(
      configuredEmail && 
      email.toLowerCase() === configuredEmail.toLowerCase()
    );

    console.log('User Sync Debug:', {
      email,
      configuredEmail,
      shouldBeSuperuser,
      existingUser: convexUser,
      currentSuperuserStatus: convexUser?.isSuperuser
    });

    createOrUpdateUser({
      clerkId: user.id,
      email: email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      isSuperuser: shouldBeSuperuser,
    });
  }, [isClerkLoaded, user, createOrUpdateUser]);

  return {
    user: convexUser,
    isLoading: !isClerkLoaded || convexUser === undefined,
    isSuperuser: convexUser?.isSuperuser ?? false,
  };
}
