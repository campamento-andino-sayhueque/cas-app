import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
// import  TanStackDevtools } from "@tanstack/react-devtools";
import { type AuthContextProps } from "react-oidc-context";

export interface RouterContext {
  auth: AuthContextProps;
}

export const Route = createRootRoute<RouterContext>({
  component: RootRouteComponent,
});

function RootRouteComponent() {
  return (
    <>
      <Outlet />
      {/* <TanStackDevtools */}
      {/*   config={{ */}
      {/*     position: 'bottom-right', */}
      {/*   }} */}
      {/*   plugins={[ */}
      {/*     { */}
      {/*       name: 'Tanstack Router', */}
      {/*       render: <TanStackRouterDevtoolsPanel />, */}
      {/*     }, */}
      {/*   ]} */}
      {/* /> */}
    </>
  );
}
