import { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import tailwindStyle from "~/styles/tailwind.css";
import globalStyle from "~/styles/global.css";
import controlStyle from "~/styles/control_btn.css";
import sidebarStyle from "~/styles/sidebar.css";
import tabStyle from "react-tabs/style/react-tabs.css";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStyle },
    { rel: "stylesheet", href: globalStyle },
    { rel: "stylesheet", href: controlStyle },
    { rel: "stylesheet", href: sidebarStyle },
    { rel: "stylesheet", href: tabStyle },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 0 }}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
