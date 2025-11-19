// Read configuration from environment variables with sensible defaults
const authority = `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`;
const client_id = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "FE";
const redirect_uri = `${window.location.origin}/callback`;
const post_logout_redirect_uri = window.location.origin;

export const oidcConfig = {
  authority,
  client_id,
  redirect_uri,
  post_logout_redirect_uri,
  response_type: "code",
  scope: "openid profile email",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
