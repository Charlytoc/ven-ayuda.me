"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AppShell,
  Box,
  Container,
  Loader,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

import { HelpMapPanel } from "@/components/help-map-panel";
import { HelpRequestDetailView } from "@/components/help-request-detail-view";
import { HomeNavbar } from "@/components/home-navbar";
import { getHelpRequest } from "@/lib/api/help-requests";
import type { HelpRequest } from "@/lib/types/help-request";

export default function AlertaDetailPage() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) {
      return;
    }

    setLoading(true);
    setError(null);

    getHelpRequest(params.id)
      .then(setRequest)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "No se pudo cargar la alerta.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <AppShell header={{ height: 60 }}>
      <HomeNavbar title="Detalle de alerta" showBack />

      <AppShell.Main>
        <Container size="md" py="xl">
          {loading ? (
            <Stack align="center" py="xl">
              <Loader />
              <Text size="sm" c="dimmed">
                Cargando alerta…
              </Text>
            </Stack>
          ) : error ? (
            <Paper withBorder radius="md" p="md">
              <Text c="red">{error}</Text>
            </Paper>
          ) : request ? (
            <Stack gap="xl">
              <Box
                style={{
                  height: 360,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid var(--mantine-color-dark-4)",
                }}
              >
                <HelpMapPanel
                  requests={[request]}
                  height={360}
                  focusRequest={request}
                />
              </Box>

              <HelpRequestDetailView request={request} />
            </Stack>
          ) : null}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
