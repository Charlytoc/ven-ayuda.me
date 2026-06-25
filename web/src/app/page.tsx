"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AppShell,
  Button,
  Container,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

import { AlertsMapSection } from "@/components/alerts-map-section";
import { HomeNavbar } from "@/components/home-navbar";
import { useOpenHelpRequest } from "@/hooks/use-open-help-request";
import { listHelpRequests } from "@/lib/api/help-requests";
import type { HelpRequest } from "@/lib/types/help-request";

export default function HomePage() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const openHelpRequest = useOpenHelpRequest();

  const refreshRequests = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await listHelpRequests();
      setRequests(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar las alertas.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshRequests();
  }, [refreshRequests]);

  return (
    <AppShell header={{ height: 60 }}>
      <HomeNavbar />

      <AppShell.Main>
        <Container size="md" py="xl">
          <Stack gap="xl">
            <Paper
              withBorder
              radius="md"
              p="xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--mantine-color-red-9) 0%, var(--mantine-color-dark-7) 100%)",
              }}
            >
              <Stack gap="md" align="flex-start">
                <Title order={2} c="white">
                  ¿Necesitas ayuda?
                </Title>
                <Text c="gray.2" size="md" maw={560}>
                  Si tienes una emergencia causada por el terremoto y aún no has
                  recibido asistencia — para ti o para otra persona — pide ayuda
                  ahora.
                </Text>
                <Button
                  component={Link}
                  href="/pedir-ayuda"
                  size="md"
                  color="red"
                  leftSection={<IconAlertTriangle size={18} />}
                >
                  Pedir ayuda
                </Button>
              </Stack>
            </Paper>

            {loading ? (
              <Stack align="center" py="xl">
                <Loader />
                <Text size="sm" c="dimmed">
                  Cargando alertas…
                </Text>
              </Stack>
            ) : loadError ? (
              <Paper withBorder radius="md" p="md">
                <Text c="red">{loadError}</Text>
              </Paper>
            ) : (
              <AlertsMapSection
                requests={requests}
                onRequestSelect={openHelpRequest}
              />
            )}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
