// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryProviders } from "@/components/QueryProviders";
import { theme } from "@/lib/theme";
import "./globals.css";

export const metadata = {
  title: "Japanese Practice",
  description: "Practice Japanese with an AI tutor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <QueryProviders>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <Notifications position="top-right" />
            {children}
          </MantineProvider>
        </QueryProviders>
      </body>
    </html>
  );
}
