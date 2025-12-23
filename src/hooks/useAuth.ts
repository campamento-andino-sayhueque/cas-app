import { useCallback } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

export function useAuth() {
  const auth = useOidcAuth();

  const signOut = useCallback(async () => {
    await auth.removeUser();
    await auth.signoutRedirect();
  }, [auth]);

  const roles = (auth.user?.profile?.roles as string[]) || [];
  const groups = (auth.user?.profile?.groups as string[]) || [];

  const hasRole = useCallback((role: string) => 
    roles.some(r => r.toLowerCase() === role.toLowerCase()), [roles]);
    
  const hasGroup = useCallback((group: string) => 
    groups.some(g => g.toLowerCase() === group.toLowerCase()), [groups]);

  const user = auth.user
    ? {
        displayName: auth.user.profile.name || auth.user.profile.preferred_username || null,
        email: auth.user.profile.email || null,
        uid: auth.user.profile.sub || null,
        photoURL: auth.user.profile.picture || null,
        access_token: auth.user.access_token || null,
        roles,
        groups,
      }
    : null;

  return {
    user,
    signOut,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    hasRole,
    hasGroup,
    originalAuth: auth 
  };
}
