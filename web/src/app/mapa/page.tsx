"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AppShell,
  Box,
  Container,
  Loader,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

import { AlertsMapFilters } from "@/components/alerts-map-filters";
import { HelpMapPanel } from "@/components/help-map-panel";
import { HomeNavbar } from "@/components/home-navbar";
import { useAlertFilters } from "@/hooks/use-alert-filters";
import { useOpenHelpRequest } from "@/hooks/use-open-help-request";
import { listHelpRequests } from "@/lib/api/help-requests";
import type { HelpRequest } from "@/lib/types/help-request";

export default function MapaPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const openHelpRequest = useOpenHelpRequest();
  const filters = useAlertFilters(requests);

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
          {loading ? (
            <Text size="sm" c="dimmed">
              Cargando alertas…
            </Text>
          ) : loadError ? (
            <Paper withBorder radius="md" p="sm">
              <Text c="red" size="sm">
                {loadError}
              </Text>
            </Paper>
          ) : (
            <AlertsMapFilters
              selectedSeverities={filters.selectedSeverities}
              onToggleSeverity={filters.toggleSeverity}
              nearMeEnabled={filters.nearMeEnabled}
              onNearMeChange={filters.setNearMe}
              locating={filters.locating}
              locationError={filters.locationError}
              statusMessage={filters.statusMessage()}
            />
          )}
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
                requests={filters.filteredRequests}
                height="100%"
                showMarkerTitles
                panToLocation={filters.nearMeEnabled ? filters.userLocation : null}
                onRequestSelect={openHelpRequest}
              />
            </Box>
          )}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
