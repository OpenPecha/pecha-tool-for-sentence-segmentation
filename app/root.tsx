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

export function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* add the UI you want your users to see */}
        <Scripts />
      </body>
    </html>
  );
}
