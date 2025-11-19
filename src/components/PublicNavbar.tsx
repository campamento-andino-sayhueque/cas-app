import { Link } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react"; // A nice icon for a logo

export function PublicNavbar() {
  const auth = useAuth();

  const handleLogin = () => auth.signinRedirect();
  const handleLogout = () => auth.signoutRedirect();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Brand / Logo */}
        <Link to="/" className="ml-60 flex items-center space-x-2">
          <Code2 className="h-6 w-6" />
          <span className="font-bold">Boilerplate</span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {auth.isAuthenticated ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={handleLogin}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );
}
