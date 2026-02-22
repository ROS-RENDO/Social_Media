/**
 * Custom hook for authentication-related operations
 */

"use client";

import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useProtectedRoute = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  return { session, isPending, isAuthenticated: !!session };
};

/**
 * Hook to get the current user
 */
export const useCurrentUser = () => {
  const { data: session } = useSession();
  return session?.user;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data: session, isPending } = useSession();
  return {
    isAuthenticated: !!session,
    isPending,
  };
};
