"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AppShell,
  Box,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

import { HelpMapPanel } from "@/components/help-map-panel";
import { HomeNavbar } from "@/components/home-navbar";
import { SeverityLegend } from "@/components/severity-legend";
import { useOpenHelpRequest } from "@/hooks/use-open-help-request";
import { listHelpRequests } from "@/lib/api/help-requests";
import type { HelpRequest } from "@/lib/types/help-request";

export default function MapaPage() {
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
      <HomeNavbar title="Mapa de alertas" showBack />

      <AppShell.Main
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100dvh - 60px)",
          overflow: "hidden",
        }}
      >
        <Container size="md" py="md" style={{ flexShrink: 0 }}>
          <Stack gap="sm">
            <SeverityLegend />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {loading
                  ? "Cargando alertas…"
                  : requests.length === 0
                    ? "No hay alertas activas."
                    : `${requests.length} alerta${requests.length === 1 ? "" : "s"} activa${requests.length === 1 ? "" : "s"}. Toca un punto para ver detalles.`}
              </Text>
            </Group>
            {loadError ? (
              <Paper withBorder radius="md" p="sm">
                <Text c="red" size="sm">
                  {loadError}
                </Text>
              </Paper>
            ) : null}
          </Stack>
        </Container>

        <Box style={{ flex: 1, minHeight: 0, padding: "0 16px 16px" }}>
          {loading ? (
            <Stack align="center" justify="center" h="100%">
              <Loader />
            </Stack>
          ) : (
            <Box
              style={{
                height: "100%",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--mantine-color-dark-4)",
              }}
            >
              <HelpMapPanel
                requests={requests}
                height="100%"
                onRequestSelect={openHelpRequest}
              />
            </Box>
          )}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
