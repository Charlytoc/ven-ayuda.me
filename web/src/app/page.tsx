"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionIcon, Affix, Loader, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

import { HelpMapPanel } from "@/components/help-map-panel";
import { ReportHelpDrawer } from "@/components/report-help-drawer";
import { listHelpRequests } from "@/lib/api/help-requests";
import type { HelpRequest } from "@/lib/types/help-request";

type LatLng = { lat: number; lng: number };

export default function HomePage() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftLocation, setDraftLocation] = useState<LatLng | null>(null);

  const refreshRequests = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await listHelpRequests();
      setRequests(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar las solicitudes.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshRequests();
  }, [refreshRequests]);

  return (
    <div style={{ position: "relative", height: "100dvh", width: "100%" }}>
      <Stack
        gap={0}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          padding: "12px 16px",
          pointerEvents: "none",
        }}
      >
        <Title order={3} c="white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
          ven-ayuda.me
        </Title>
        <Text size="sm" c="gray.1" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
          Mapa de solicitudes de ayuda en Venezuela
        </Text>
        {loadError ? (
          <Text size="sm" c="red.3" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
            {loadError}
          </Text>
        ) : null}
      </Stack>

      {loading ? (
        <Stack align="center" justify="center" h="100%">
          <Loader />
        </Stack>
      ) : (
        <HelpMapPanel
          requests={requests}
          draftLocation={draftLocation}
          onDraftLocationChange={setDraftLocation}
        />
      )}

      <Affix position={{ bottom: 24, right: 24 }} zIndex={600}>
        <ActionIcon
          size={64}
          radius="xl"
          variant="filled"
          color="red"
          aria-label="Pedir ayuda"
          onClick={() => setDrawerOpen(true)}
        >
          <IconAlertTriangle size={28} />
        </ActionIcon>
      </Affix>

      <ReportHelpDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        draftLocation={draftLocation}
        onDraftLocationChange={setDraftLocation}
        onSubmitted={() => {
          void refreshRequests();
        }}
      />
    </div>
  );
}
