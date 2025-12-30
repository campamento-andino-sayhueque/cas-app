import { Link } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";

function DashboardNavbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Brand / Logo - Left side with margin */}
        <div className="flex items-center space-x-6 ml-122">
          <Link to="/" className="flex items-center space-x-2">
            <Code2 className="h-6 w-6" />
            <span className="font-bold">Boilerplate</span>
          </Link>
          <Link
            to="/dashboard"
            className="text-foreground/60 transition-colors hover:text-foreground/80 [&.active]:text-foreground text-sm font-medium"
          >
            Dashboard
          </Link>
        </div>

        {/* User Info and Logout - Right side */}
        <div className="flex items-center space-x-4 ml-140">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.displayName}
          </span>
          <Button onClick={signOut} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export { DashboardNavbar };
