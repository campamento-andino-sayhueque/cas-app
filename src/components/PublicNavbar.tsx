import { Link } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react"; // A nice icon for a logo

export function PublicNavbar() {
  const { isAuthenticated, login, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Brand / Logo - Left side with margin */}
        <div className="flex items-center space-x-2 ml-100">
          <Link to="/" className="flex items-center space-x-2">
            <Code2 className="h-6 w-6" />
            <span className="font-bold">Boilerplate</span>
          </Link>
        </div>

        {/* Empty space in the center to balance layout */}
        <div className="flex flex-1 justify-center items-center">
          {/* This space can be used for navigation if needed */}
        </div>

        {/* Auth Buttons - Right side */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={signOut} variant="outline">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={login}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );
}
