// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryProviders } from "@/components/QueryProviders";
import { APP_NAME } from "@/lib/constants";
import { theme } from "@/lib/theme";
import "./globals.css";

export const metadata = {
  title: APP_NAME,
  description: "Mapa de emergencias y coordinación de ayuda en Venezuela.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" {...mantineHtmlProps}>
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
