import { useCallback } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

export function useAuth() {
  const auth = useOidcAuth();

  const signOut = useCallback(async () => {
    await auth.removeUser();
    await auth.signoutRedirect();
  }, [auth]);

  const user = auth.user
    ? {
        displayName: auth.user.profile.name || auth.user.profile.preferred_username || null,
        email: auth.user.profile.email || null,
        uid: auth.user.profile.sub || null,
        photoURL: auth.user.profile.picture || null,
        access_token: auth.user.access_token || null,
      }
    : null;

  return {
    user,
    signOut,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    originalAuth: auth // Expose original auth for advanced usage if needed
  };
}
