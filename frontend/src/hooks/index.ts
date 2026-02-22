/**
 * Barrel export for all custom hooks
 */

export {
  useProtectedRoute,
  useCurrentUser,
  useIsAuthenticated,
} from "./useAuth";
export { usePosts } from "./usePost";
export { useUser, useFollow, useSearchUsers } from "./useUser";
