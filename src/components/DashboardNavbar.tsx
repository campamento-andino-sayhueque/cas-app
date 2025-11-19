import { Link } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";

export function DashboardNavbar() {
  const auth = useAuth();
  const handleLogout = () => auth.signoutRedirect();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Brand / Logo */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Code2 className="h-6 w-6" />
          <span className="font-bold">Boilerplate</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/dashboard"
            className="text-foreground/60 transition-colors hover:text-foreground/80 [&.active]:text-foreground"
          >
            Dashboard
          </Link>
        </nav>

        {/* User Info and Logout */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {auth.user?.profile.name}
          </span>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
