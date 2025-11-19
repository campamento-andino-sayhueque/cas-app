import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

export const Route = createFileRoute("/callback")({
  component: CallbackComponent,
});

function CallbackComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate({ from: "/callback" });

  useEffect(() => {
    // When the auth state is no longer loading and the user is authenticated,
    // we can safely navigate them to the dashboard.
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }

    // You might also want to handle the case where authentication fails.
    // For example, if isLoading is false but the user is not authenticated.
    if (!isLoading && !isAuthenticated) {
      console.error("Authentication failed after callback.");
      navigate({ to: "/", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="p-2">
      <h3>Authenticating...</h3>
      <p>Please wait while we complete the sign-in process.</p>
    </div>
  );
}
