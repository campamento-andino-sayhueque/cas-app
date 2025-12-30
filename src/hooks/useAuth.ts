import { useCallback } from "react";
import { useOidc } from "../oidc";

export function useAuth() {
  const oidc = useOidc();

  const signOut = useCallback(async () => {
    if (oidc.isUserLoggedIn) {
      await oidc.logout({ redirectTo: "home" });
    }
  }, [oidc]);

  const login = useCallback(async () => {
    if (!oidc.isUserLoggedIn && oidc.login) {
      await oidc.login({});
    }
  }, [oidc]);

  if (!oidc.isUserLoggedIn) {
    return {
      user: null,
      signOut,
      login,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasRole: () => false,
      hasGroup: () => false,
    };
  }

  const { decodedIdToken } = oidc;
  // Roles are at top level in the token (not under realm_access)
  const roles = decodedIdToken.roles ?? [];
  const groups = decodedIdToken.groups ?? [];

  const hasRole = useCallback(
    (role: string) =>
      roles.some((r) => r.toLowerCase() === role.toLowerCase()),
    [roles]
  );

  const hasGroup = useCallback(
    (group: string) =>
      groups.some((g) => g.toLowerCase() === group.toLowerCase()),
    [groups]
  );

  const user = {
    displayName: decodedIdToken.name || decodedIdToken.preferred_username || null,
    email: decodedIdToken.email || null,
    uid: decodedIdToken.sub || null,
    photoURL: decodedIdToken.picture || null,
    roles,
    groups,
  };

  return {
    user,
    signOut,
    login,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    hasRole,
    hasGroup,
  };
}
