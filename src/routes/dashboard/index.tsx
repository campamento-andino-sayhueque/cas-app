import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "react-oidc-context";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/services/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  // TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardComponent,
});

// A skeleton component to show while data is loading
function DashboardLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardComponent() {
  const auth = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["myData"],
    queryFn: fetchData,
    enabled: !!auth.isAuthenticated,
  });

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching Data</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-6" /> User Data from API
        </CardTitle>
        <CardDescription>
          This data is fetched from a protected backend API endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right w-[80px]">Age</TableHead>
              <TableHead>City</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">{user.age}</TableCell>
                  <TableCell>{user.city}</TableCell>
                </TableRow>
              ))
            ) : (
              // This is the new empty state
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
