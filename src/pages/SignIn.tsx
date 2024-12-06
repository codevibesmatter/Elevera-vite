import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

export function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full p-8 bg-base-100 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome to Elevra</h1>
        <ClerkSignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-transparent shadow-none",
            }
          }}
        />
      </div>
    </div>
  );
}
