import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react'
import { ReactNode } from 'react'

const PUBLISHABLE_KEY = import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <BaseClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  )
}
