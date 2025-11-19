import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  KeyRound,
  Network,
  Component,
  DatabaseZap,
  Cable,
  Palette,
  Server,
  Code,
} from "lucide-react";

export const Route = createFileRoute("/(public)/")({
  component: HomeComponent,
});

const techStack = [
  {
    icon: <Component className="size-8 text-sky-500" />,
    name: "React & Vite",
    description:
      "A fast, modern frontend stack with Vite's lightning-fast HMR.",
  },
  {
    icon: <KeyRound className="size-8 text-green-500" />,
    name: "Keycloak & OIDC",
    description: "Robust, secure authentication handled by oidc-client-ts.",
  },
  {
    icon: <Network className="size-8 text-rose-500" />,
    name: "Tanstack Router",
    description:
      "Fully type-safe, file-based routing with search param schemas.",
  },
  {
    icon: <DatabaseZap className="size-8 text-fuchsia-500" />,
    name: "Tanstack Query",
    description:
      "Effortless server state management, caching, and data fetching.",
  },
  {
    icon: <Cable className="size-8 text-amber-500" />,
    name: "Axios Interceptors",
    description:
      "Automated, secure API calls with automatic bearer token injection.",
  },
  {
    icon: <Palette className="size-8 text-slate-500" />,
    name: "Tailwind & Shadcn",
    description: "A beautiful, utility-first UI toolkit for rapid development.",
  },
];

function HomeComponent() {
  const auth = useAuth();
  const handleLogin = () => auth.signinRedirect();

  // Show a simple welcome message if the user is already logged in
  if (auth.isAuthenticated) {
    return (
      <div className="container mx-auto max-w-5xl py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome Back!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You are already logged in as{" "}
          <strong>{auth.user?.profile.name}</strong>.
        </p>
        <Button asChild className="mt-6">
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    );
  }

  // Show the full landing page for logged-out users
  return (
    <div className="container mx-auto max-w-5xl py-10">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          MERN Stack + Keycloak + Tanstack
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A production-ready, type-safe boilerplate for building modern web
          applications.
        </p>
        <Button onClick={handleLogin} size="lg" className="mt-8">
          Login to Get Started
        </Button>
      </section>

      {/* Technologies Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center">What's Inside?</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech) => (
            <Card key={tech.name}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                {tech.icon}
                <div className="grid gap-1">
                  <CardTitle>{tech.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tech.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center">Getting Started</h2>
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="space-y-4 text-sm">
              <p>
                <strong>1. Clone the Repository:</strong>
              </p>
              <pre className="p-3 rounded-md bg-muted text-muted-foreground">
                <code>git clone [your-repo-url]</code>
              </pre>
              <p>
                <strong>2. Install Dependencies:</strong>
              </p>
              <pre className="p-3 rounded-md bg-muted text-muted-foreground">
                <code>npm install</code>
              </pre>
              <p>
                <strong>3. Configure Environment:</strong> Copy{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  .env.example
                </code>{" "}
                to <code className="bg-muted px-1 py-0.5 rounded">.env</code>{" "}
                and update the values to match your Keycloak and API setup.
              </p>
              <p>
                <strong>4. Run the Development Server:</strong>
              </p>
              <pre className="p-3 rounded-md bg-muted text-muted-foreground">
                <code>npm run dev</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Customization Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center">How to Customize</h2>
        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-5" /> Authentication
              </CardTitle>
              <CardDescription>
                All Keycloak settings are managed in the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">.env</code> file.
                The logic is centralized in{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  src/auth/authConfig.ts
                </code>
                .
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="size-5" /> API Calls
              </CardTitle>
              <CardDescription>
                Change the API base URL in{" "}
                <code className="bg-muted px-1 py-0.5 rounded">.env</code>. The
                authenticated Axios client is in{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  src/lib/api.ts
                </code>
                . Add your new API fetching functions in the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">src/api/</code>{" "}
                directory.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="size-5" /> Pages & Layouts
              </CardTitle>
              <CardDescription>
                Add new pages and layouts in the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  src/routes/
                </code>{" "}
                directory following the file-based routing conventions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
