import { ConvexProvider as BaseConvexProvider } from "convex/react";
import { ReactNode } from "react";
import { convex } from "../lib/convex";

export function ConvexProvider({ children }: { children: ReactNode }) {
  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
