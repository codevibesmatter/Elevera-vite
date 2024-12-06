import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
